/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VALID_FIELD_TYPES, VALID_PRIMARY_TYPES, } from "./field.js";
import { MobilettoOrmError } from "./errors.js";
import { AUTO_REDACT_CONTROLS, NUMERIC_CONTROL_TYPES, RESERVED_FIELD_NAMES } from "./constants.js";
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
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / string`);
        }
        foundType = "string";
    }
    if (typeof field.minValue === "number" ||
        typeof field.maxValue === "number" ||
        (field.control && NUMERIC_CONTROL_TYPES.includes(field.control))) {
        if (foundType != null && foundType !== "number") {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / number`);
        }
        foundType = "number";
    }
    const hasItems = field.items && Array.isArray(field.items);
    const hasValues = field.values && Array.isArray(field.values);
    const hasLabels = field.labels && Array.isArray(field.labels);
    let defaultType = typeof field.default;
    if (defaultType !== "undefined") {
        // @ts-ignore
        if (Array.isArray(field.default) &&
            !hasValues &&
            !hasItems &&
            // @ts-ignore
            (!field.type || (field.type !== "select" && field.type !== "multi"))) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had an array as default value, but is not a select or multi field`);
        }
        if ((field.type && field.type === "array") || (field.control && field.control === "multi")) {
            if (!Array.isArray(field.default)) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had type 'array' or control 'multi' but default value type is ${defaultType} (expected array)`);
            }
            defaultType = "array";
        }
        if (foundType != null && foundType !== defaultType) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`);
        }
        foundType = defaultType;
    }
    if (hasValues || hasItems) {
        const items = field.items;
        const values = field.values;
        if (hasValues && hasItems && values.length !== items.length) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs items (${items.length})`);
        }
        if (hasLabels) {
            const labels = field.labels;
            if (hasValues && values.length !== labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs labels (${labels.length})`);
            }
            if (hasItems && items.length !== labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for items (${values.length}) vs labels (${labels.length})`);
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
                    throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${vType}`);
                }
                foundType = vType;
            }
        }
    }
    const hasFields = field.fields && typeof field.fields === "object";
    if (hasFields) {
        if (foundType != null && foundType !== "object") {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / object`);
        }
        foundType = "object";
    }
    if (foundType) {
        if (!VALID_FIELD_TYPES.includes(foundType)) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had invalid type: ${foundType}`);
        }
        return foundType;
    }
    return "string";
};
export const processFields = (fields, objPath, typeDef) => {
    Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];
        if (RESERVED_FIELD_NAMES.includes(fieldName)) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: reserved field name: ${fieldName}`);
        }
        field.name = fieldName;
        field.type = determineFieldType(fieldName, field);
        field.control = determineFieldControl(fieldName, field, field.type);
        const fieldPath = objPath === "" ? fieldName : objPath + "." + fieldName;
        if (field.type === "object" && field.fields && typeof field.fields === "object") {
            field.tabIndexes = typeDef._tabIndexes(field.fields);
            processFields(field.fields, fieldPath, typeDef);
        }
        if (typeof field.primary === "boolean" && field.primary === true) {
            if (objPath !== "") {
                throw new MobilettoOrmError(`invalid TypeDefConfig: non-root field ${fieldName} had {primary: true} (not allowed)`);
            }
            if (typeDef.primary) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: multiple fields had {primary: true}: ${typeDef.primary} and ${fieldName}`);
            }
            if (!VALID_PRIMARY_TYPES.includes(field.type)) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: primary ${typeDef.primary} had bad type: ${field.type}`);
            }
            typeDef.primary = fieldName;
            if (typeof field.required === "boolean" && field.required === false) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: primary field ${typeDef.primary} had {required: false} (not allowed)`);
            }
            field.required = true;
            if (typeof field.updatable === "boolean" && field.updatable === true) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: primary field ${typeDef.primary} had {updatable: true} (not allowed)`);
            }
            if (field.when) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: primary field ${typeDef.primary} had {when} (not allowed)`);
            }
            field.updatable = false;
        }
        if (field.index) {
            if (!typeDef) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: non-root field ${fieldName} had {index: true} (not allowed)`);
            }
            typeDef.indexes.push(fieldName);
        }
        const redact = (typeof field.redact === "undefined" && AUTO_REDACT_CONTROLS.includes(field.control)) ||
            (typeof field.redact === "boolean" && field.redact === true);
        if (redact) {
            if (fieldName === "id") {
                throw new MobilettoOrmError(`invalid TypeDefConfig: {redact: true} not allowed on id field`);
            }
            field.redact = true;
            typeDef.redaction.push(fieldPath);
        }
        if (field.values && Array.isArray(field.values)) {
            const hasLabels = field.labels && Array.isArray(field.labels) && field.labels.length === field.values.length;
            field.items = [];
            if (!hasLabels)
                field.labels = [];
            for (let i = 0; i < field.values.length; i++) {
                const value = field.values[i];
                field.items.push({
                    value,
                    label: `${hasLabels ? field.labels[i] : value}`,
                });
                if (!hasLabels)
                    field.labels.push(`${value}`);
            }
        }
        else if (field.items && Array.isArray(field.items)) {
            field.values = field.items.map((i) => i.value);
            field.labels = field.items.map((i) => i.label);
        }
    });
};
