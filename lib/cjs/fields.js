"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFields = void 0;
/* eslint-disable @typescript-eslint/ban-ts-comment */
const field_js_1 = require("./field.js");
const errors_js_1 = require("./errors.js");
const constants_js_1 = require("./constants.js");
const determineFieldControl = (fieldName, field, fieldType) => {
    if (field.control)
        return field.control;
    if (fieldType === "boolean")
        return "flag";
    if (fieldType === "array")
        return "multi";
    if (fieldType === "number" && typeof field.minValue === "number" && typeof field.maxValue === "number")
        return "range";
    if (fieldType === "object" && typeof field.fields === "undefined")
        return "textarea";
    if ((field.values && Array.isArray(field.values) && field.values.length > 0) ||
        (field.items && Array.isArray(field.items) && field.items.length > 0))
        return "select";
    if (fieldName === "password")
        return "password";
    return "text";
};
const determineFieldType = (fieldName, field) => {
    let foundType = field.type ? field.type : null;
    if (typeof field.min === "number" ||
        typeof field.max === "number" ||
        typeof field.regex === "string" ||
        (typeof field.regex === "object" && field.regex instanceof RegExp)) {
        if (foundType != null && foundType !== "string") {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / string`);
        }
        foundType = "string";
    }
    if (typeof field.minValue === "number" ||
        typeof field.maxValue === "number" ||
        (field.control && constants_js_1.NUMERIC_CONTROL_TYPES.includes(field.control))) {
        if (foundType != null && foundType !== "number") {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / number`);
        }
        foundType = "number";
    }
    const hasItems = field.items && Array.isArray(field.items);
    const hasValues = field.values && Array.isArray(field.values);
    const hasLabels = field.labels && Array.isArray(field.labels);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let defaultType = typeof field.default;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (defaultType !== "undefined") {
        if (Array.isArray(field.default) && !hasValues && !hasItems) {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had an array as 'default' value, but has no 'items' or 'values'`);
        }
        if ((field.type && field.type === "array") || (field.control && field.control === "multi")) {
            if (!Array.isArray(field.default)) {
                throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had type 'array' or control 'multi' but default value type is ${defaultType} (expected array)`);
            }
            defaultType = "array";
        }
        if (foundType != null && foundType !== defaultType) {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`);
        }
        foundType = defaultType;
    }
    if (hasValues || hasItems) {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const items = field.items;
        const values = field.values;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
        if (hasValues && hasItems && values.length !== items.length) {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs items (${items.length})`);
        }
        if (hasLabels) {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            const labels = field.labels;
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            if (hasValues && values.length !== labels.length) {
                throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs labels (${labels.length})`);
            }
            if (hasItems && items.length !== labels.length) {
                throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for items (${values.length}) vs labels (${labels.length})`);
            }
        }
        if ((!field.control || field.control !== "multi") && (!field.type || field.type !== "array")) {
            const vType = hasItems && items.length > 0 && typeof items[0].value !== "undefined" && items[0].value != null
                ? typeof items[0].value
                : hasValues && values.length > 0
                    ? typeof values[0]
                    : null;
            if (vType) {
                if (foundType != null && foundType !== vType) {
                    throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${vType}`);
                }
                foundType = vType;
            }
        }
    }
    const hasFields = field.fields && typeof field.fields === "object";
    if (hasFields) {
        if (foundType != null && foundType !== "object") {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / object`);
        }
        foundType = "object";
    }
    if (foundType) {
        if (!field_js_1.VALID_FIELD_TYPES.includes(foundType)) {
            throw new errors_js_1.MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had invalid type: ${foundType}`);
        }
        return foundType;
    }
    return "string";
};
const processFields = (fields, objPath, typeDef) => {
    const invalidPrefix = `invalid TypeDefConfig(${typeDef.typeName}):`;
    Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];
        if (constants_js_1.RESERVED_FIELD_NAMES.includes(fieldName)) {
            throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} reserved field name: ${fieldName}`);
        }
        field.name = fieldName;
        field.type = determineFieldType(fieldName, field);
        field.control = determineFieldControl(fieldName, field, field.type);
        const fieldPath = objPath === "" ? fieldName : objPath + "." + fieldName;
        if (field.type === "object" && field.fields && typeof field.fields === "object") {
            field.tabIndexes = typeDef._tabIndexes(field.fields);
            (0, exports.processFields)(field.fields, fieldPath, typeDef);
        }
        if (typeof field.primary === "boolean" && field.primary === true) {
            if (objPath !== "") {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} non-root field ${fieldName} had {primary: true} (not allowed)`);
            }
            if (typeDef.primary) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} multiple fields had {primary: true}: ${typeDef.primary} and ${fieldName}`);
            }
            if (!field_js_1.VALID_PRIMARY_TYPES.includes(field.type)) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} primary ${typeDef.primary} had bad type: ${field.type}`);
            }
            typeDef.primary = fieldName;
            if (typeof field.required === "boolean" && field.required === false) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {required: false} (not allowed)`);
            }
            if (typeof field.unique === "boolean" && field.unique === false) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {unique: false} (not allowed)`);
            }
            if (typeof field.updatable === "boolean" && field.updatable === true) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {updatable: true} (not allowed)`);
            }
            if (field.when) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {when} (not allowed)`);
            }
            field.required = true;
            field.unique = true;
            field.updatable = false;
        }
        if (field.index || field.unique) {
            if (!typeDef) {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} non-root field ${fieldName} had {index: true} (not allowed)`);
            }
            if (!field.primary) {
                typeDef.indexes.push({ field: fieldName, unique: field.unique || false });
                if (field.type === "boolean" && field.indexLevels && field.indexLevels !== 0) {
                    throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} indexLevels > 0 not allowed on boolean field`);
                }
                field.indexLevels =
                    typeDef.debug || field.type === "boolean"
                        ? 0
                        : field.indexLevels
                            ? field.indexLevels
                            : constants_js_1.DEFAULT_FIELD_INDEX_LEVELS;
            }
            else if (field.unique) {
                field.required = true;
            }
        }
        const redact = (typeof field.redact === "undefined" && constants_js_1.AUTO_REDACT_CONTROLS.includes(field.control)) ||
            (typeof field.redact === "boolean" && field.redact === true);
        if (redact) {
            if (fieldName === "id") {
                throw new errors_js_1.MobilettoOrmError(`${invalidPrefix} {redact: true} not allowed on id field`);
            }
            field.redact = true;
            typeDef.redaction.push(fieldPath);
        }
        if (field.values && Array.isArray(field.values)) {
            const hasLabels = field.labels && Array.isArray(field.labels) && field.labels.length === field.values.length;
            const hasItems = field.items && Array.isArray(field.items) && field.items.length === field.values.length;
            if (!hasItems)
                field.items = [];
            if (!hasLabels)
                field.labels = [];
            for (let i = 0; i < field.values.length; i++) {
                const value = field.values[i];
                if (!hasItems && field.items) {
                    field.items.push({
                        value,
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        label: `${hasLabels ? field.labels[i] : value}`,
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    });
                }
                if (!hasLabels) {
                    field.labels.push(`${value}`);
                }
            }
        }
        else if (field.items && Array.isArray(field.items)) {
            field.values = field.items.map((i) => i.value);
            field.labels || (field.labels = []);
            field.labels = field.items.map((i) => i.label);
        }
    });
};
exports.processFields = processFields;
