/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VALID_FIELD_TYPES, VALID_PRIMARY_TYPES, } from "./field.js";
import { MobilettoOrmError } from "./errors.js";
import { AUTO_REDACT_CONTROLS, DEFAULT_FIELD_INDEX_LEVELS, isArrayType, NUMERIC_CONTROL_TYPES, RESERVED_FIELD_NAMES, } from "./constants.js";
export const determineFieldControl = (fieldName, field, fieldType) => {
    if (field.control)
        return field.control;
    if (fieldType === "boolean")
        return "flag";
    const hasValues = field.values && Array.isArray(field.values) && field.values.length > 0;
    const hasItems = field.items && Array.isArray(field.items) && field.items.length > 0;
    if (isArrayType(fieldType)) {
        return hasValues || hasItems ? "multi" : "text";
    }
    if (fieldType === "number" && typeof field.minValue === "number" && typeof field.maxValue === "number")
        return "range";
    if (fieldType === "object" && typeof field.fields === "undefined")
        return "textarea";
    if (hasValues || hasItems)
        return "select";
    if (fieldName === "password")
        return "password";
    return "text";
};
export const determineFieldType = (fieldName, field) => {
    let foundType = field.type ? field.type : null;
    const isArray = isArrayType(field.type);
    const hasItems = field.items && Array.isArray(field.items);
    const hasValues = field.values && Array.isArray(field.values);
    const hasLabels = field.labels && Array.isArray(field.labels);
    const isMulti = field.control && field.control === "multi";
    if (typeof field.min === "number" ||
        typeof field.max === "number" ||
        typeof field.regex === "string" ||
        (typeof field.regex === "object" && field.regex instanceof RegExp)) {
        if (foundType != null && foundType !== "string" && foundType !== "string[]") {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / string`);
        }
        foundType = isArray || isMulti ? "string[]" : "string";
    }
    if (typeof field.minValue === "number" ||
        typeof field.maxValue === "number" ||
        (field.control && NUMERIC_CONTROL_TYPES.includes(field.control))) {
        if (foundType != null && foundType !== "number" && foundType !== "number[]") {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / number`);
        }
        foundType = isArray || isMulti ? "number[]" : "number";
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let defaultType = typeof field.default;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (defaultType !== "undefined") {
        if (field.type && isArrayType(field.type)) {
            if (!Array.isArray(field.default)) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had type 'array' or control 'multi' but default value type is ${defaultType} (expected array)`);
            }
            defaultType = field.type;
        }
        else if (Array.isArray(field.default)) {
            if (field.default.length > 0) {
                defaultType = `${typeof field.default[0]}[]`;
            }
            else {
                defaultType = null;
            }
        }
        if (defaultType) {
            if (foundType != null && foundType !== defaultType) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`);
            }
            foundType = defaultType;
        }
    }
    if (hasValues || hasItems) {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const items = field.items;
        const values = field.values;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
        if (hasValues && hasItems && values.length !== items.length) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs items (${items.length})`);
        }
        if (hasLabels) {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            const labels = field.labels;
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            if (hasValues && values.length !== labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs labels (${labels.length})`);
            }
            if (hasItems && items.length !== labels.length) {
                throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had different lengths for items (${values.length}) vs labels (${labels.length})`);
            }
        }
        if (!isMulti && !isArrayType(field.type)) {
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
        else if (isMulti && foundType && !isArrayType(foundType)) {
            foundType += "[]";
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
        if (field.type && foundType !== field.type) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had type: ${field.type} but discovered type was ${foundType}`);
        }
        if (!VALID_FIELD_TYPES.includes(foundType)) {
            throw new MobilettoOrmError(`invalid TypeDefConfig: field ${fieldName} had invalid type: ${foundType}`);
        }
        if (isMulti && foundType && !isArrayType(foundType)) {
            return (foundType + "[]");
        }
        return foundType;
    }
    return isMulti ? "string[]" : "string";
};
export const FIELD_NAME_REGEX = /^[A-Z][A-Z\d]*$/i;
export const processFields = (fields, objPath, typeDef) => {
    const invalidPrefix = `invalid TypeDefConfig(${typeDef.typeName}):`;
    Object.keys(fields).forEach((fieldName) => {
        if (RESERVED_FIELD_NAMES.includes(fieldName)) {
            throw new MobilettoOrmError(`${invalidPrefix} reserved field name: ${fieldName}`);
        }
        if (!fieldName.match(FIELD_NAME_REGEX)) {
            throw new MobilettoOrmError(`${invalidPrefix} invalid field name (must start with a letter and contain only letters and numbers): ${fieldName}`);
        }
        const field = fields[fieldName];
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
                throw new MobilettoOrmError(`${invalidPrefix} non-root field ${fieldName} had {primary: true} (not allowed)`);
            }
            if (typeDef.primary) {
                throw new MobilettoOrmError(`${invalidPrefix} multiple fields had {primary: true}: ${typeDef.primary} and ${fieldName}`);
            }
            if (!VALID_PRIMARY_TYPES.includes(field.type)) {
                throw new MobilettoOrmError(`${invalidPrefix} primary ${typeDef.primary} had bad type: ${field.type}`);
            }
            typeDef.primary = fieldName;
            if (typeof field.required === "boolean" && field.required === false) {
                throw new MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {required: false} (not allowed)`);
            }
            if (typeof field.unique === "boolean" && field.unique === false) {
                throw new MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {unique: false} (not allowed)`);
            }
            if (typeof field.updatable === "boolean" && field.updatable === true) {
                throw new MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {updatable: true} (not allowed)`);
            }
            if (field.when) {
                throw new MobilettoOrmError(`${invalidPrefix} primary field ${typeDef.primary} had {when} (not allowed)`);
            }
            field.required = true;
            field.unique = true;
            field.updatable = false;
            field.inFileName = true;
        }
        if (typeof field.ref === "object") {
            if (typeof field.index === "boolean" && field.index === false) {
                throw new MobilettoOrmError(`${invalidPrefix} reference field ${fieldName} had {index: false} (not allowed)`);
            }
            field.index = true;
            if (!field.ref.refType) {
                field.ref.refType = fieldName;
            }
            typeDef.addRef(fieldPath, field.ref.refType);
        }
        if (field.index || field.unique) {
            if (!typeDef) {
                throw new MobilettoOrmError(`${invalidPrefix} non-root field ${fieldName} had {index: true} (not allowed)`);
            }
            if (field.type === "boolean" && field.indexLevels && field.indexLevels !== 0) {
                throw new MobilettoOrmError(`${invalidPrefix} indexLevels > 0 not allowed on boolean field`);
            }
            if (!field.primary) {
                typeDef.indexes.push({ field: fieldName, unique: field.unique || false });
            }
            if (field.unique) {
                field.required = true;
                field.index = true;
            }
            field.indexLevels =
                typeDef.debug || field.type === "boolean"
                    ? 0
                    : field.indexLevels
                        ? field.indexLevels
                        : DEFAULT_FIELD_INDEX_LEVELS;
        }
        if (typeof field.transient === "boolean" && field.transient === true) {
            if (field.primary) {
                throw new MobilettoOrmError(`${invalidPrefix} transient field ${typeDef.primary} had {primary: true} (not allowed)`);
            }
            else if (field.unique) {
                throw new MobilettoOrmError(`${invalidPrefix} transient field ${typeDef.primary} had {unique: true} (not allowed)`);
            }
            else if (field.index) {
                throw new MobilettoOrmError(`${invalidPrefix} transient field ${typeDef.primary} had {index: true} (not allowed)`);
            }
            else if (field.ref) {
                throw new MobilettoOrmError(`${invalidPrefix} transient field ${typeDef.primary} had {ref: ...} (not allowed)`);
            }
        }
        const redact = (typeof field.redact === "undefined" && AUTO_REDACT_CONTROLS.includes(field.control)) ||
            (typeof field.redact === "boolean" && field.redact === true);
        if (redact) {
            if (fieldName === "id") {
                throw new MobilettoOrmError(`${invalidPrefix} {redact: true} not allowed on id field`);
            }
            field.redact = true;
            typeDef.redaction.push(fieldPath);
        }
        const filenameField = typeof field.inFileName === "boolean" && field.inFileName;
        if (filenameField) {
            if (!field.required) {
                throw new MobilettoOrmError(`${invalidPrefix} {inFileName: true} not allowed on field that is not required: ${fieldPath}`);
            }
            typeDef.filenameFields.push(fieldPath);
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
