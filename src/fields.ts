/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    MobilettoOrmFieldControl,
    MobilettoOrmFieldDefConfig,
    MobilettoOrmFieldDefConfigs,
    MobilettoOrmFieldType,
    VALID_FIELD_TYPES,
    VALID_PRIMARY_TYPES,
} from "./field.js";
import { MobilettoOrmError } from "./errors.js";
import {
    AUTO_REDACT_CONTROLS,
    DEFAULT_FIELD_INDEX_LEVELS,
    NUMERIC_CONTROL_TYPES,
    RESERVED_FIELD_NAMES,
} from "./constants.js";
import { MobilettoOrmTypeDef } from "./typedef.js";

const determineFieldControl = (
    fieldName: string,
    field: MobilettoOrmFieldDefConfig,
    fieldType: MobilettoOrmFieldType
): MobilettoOrmFieldControl => {
    if (field.control) return field.control;
    if (fieldType === "boolean") return "flag";
    if (fieldType === "array") return "multi";
    if (fieldType === "number" && typeof field.minValue === "number" && typeof field.maxValue === "number")
        return "range";
    if (fieldType === "object" && typeof field.fields === "undefined") return "textarea";
    if (
        (field.values && Array.isArray(field.values) && field.values.length > 0) ||
        (field.items && Array.isArray(field.items) && field.items.length > 0)
    )
        return "select";
    if (fieldName === "password") return "password";
    return "text";
};

const determineFieldType = (fieldName: string, field: MobilettoOrmFieldDefConfig) => {
    let foundType = field.type ? field.type : null;
    if (
        typeof field.min === "number" ||
        typeof field.max === "number" ||
        typeof field.regex === "string" ||
        (typeof field.regex === "object" && field.regex instanceof RegExp)
    ) {
        if (foundType != null && foundType !== "string") {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / string`
            );
        }
        foundType = "string";
    }
    if (
        typeof field.minValue === "number" ||
        typeof field.maxValue === "number" ||
        (field.control && NUMERIC_CONTROL_TYPES.includes(field.control))
    ) {
        if (foundType != null && foundType !== "number") {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / number`
            );
        }
        foundType = "number";
    }
    const hasItems = field.items && Array.isArray(field.items);
    const hasValues = field.values && Array.isArray(field.values);
    const hasLabels = field.labels && Array.isArray(field.labels);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let defaultType: any = typeof field.default;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (defaultType !== "undefined") {
        if (Array.isArray(field.default) && !hasValues && !hasItems) {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had an array as 'default' value, but has no 'items' or 'values'`
            );
        }
        if ((field.type && field.type === "array") || (field.control && field.control === "multi")) {
            if (!Array.isArray(field.default)) {
                throw new MobilettoOrmError(
                    `invalid TypeDefConfig: field ${fieldName} had type 'array' or control 'multi' but default value type is ${defaultType} (expected array)`
                );
            }
            defaultType = "array";
        }
        if (foundType != null && foundType !== defaultType) {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${defaultType}`
            );
        }
        foundType = defaultType;
    }
    if (hasValues || hasItems) {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const items = field.items!;
        const values = field.values!;
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
        if (hasValues && hasItems && values.length !== items.length) {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs items (${items.length})`
            );
        }
        if (hasLabels) {
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            const labels = field.labels!;
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            if (hasValues && values.length !== labels.length) {
                throw new MobilettoOrmError(
                    `invalid TypeDefConfig: field ${fieldName} had different lengths for values (${values.length}) vs labels (${labels.length})`
                );
            }
            if (hasItems && items.length !== labels.length) {
                throw new MobilettoOrmError(
                    `invalid TypeDefConfig: field ${fieldName} had different lengths for items (${values.length}) vs labels (${labels.length})`
                );
            }
        }
        if ((!field.control || field.control !== "multi") && (!field.type || field.type !== "array")) {
            const vType =
                hasItems && items.length > 0 && typeof items[0].value !== "undefined" && items[0].value != null
                    ? typeof items[0].value
                    : hasValues && values.length > 0
                    ? typeof values[0]
                    : null;
            if (vType) {
                if (foundType != null && foundType !== vType) {
                    throw new MobilettoOrmError(
                        `invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / ${vType}`
                    );
                }
                foundType = vType as MobilettoOrmFieldType;
            }
        }
    }
    const hasFields = field.fields && typeof field.fields === "object";
    if (hasFields) {
        if (foundType != null && foundType !== "object") {
            throw new MobilettoOrmError(
                `invalid TypeDefConfig: field ${fieldName} had incompatible types: ${foundType} / object`
            );
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

export const FIELD_NAME_REGEX = /^[A-Z][A-Z\d]*$/i;

export const processFields = (fields: MobilettoOrmFieldDefConfigs, objPath: string, typeDef: MobilettoOrmTypeDef) => {
    const invalidPrefix = `invalid TypeDefConfig(${typeDef.typeName}):`;
    Object.keys(fields).forEach((fieldName) => {
        if (RESERVED_FIELD_NAMES.includes(fieldName)) {
            throw new MobilettoOrmError(`${invalidPrefix} reserved field name: ${fieldName}`);
        }
        if (!fieldName.match(FIELD_NAME_REGEX)) {
            throw new MobilettoOrmError(
                `${invalidPrefix} invalid field name (must start with a letter and contain only letters and numbers): ${fieldName}`
            );
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
                throw new MobilettoOrmError(
                    `${invalidPrefix} non-root field ${fieldName} had {primary: true} (not allowed)`
                );
            }
            if (typeDef.primary) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} multiple fields had {primary: true}: ${typeDef.primary} and ${fieldName}`
                );
            }
            if (!VALID_PRIMARY_TYPES.includes(field.type)) {
                throw new MobilettoOrmError(`${invalidPrefix} primary ${typeDef.primary} had bad type: ${field.type}`);
            }
            typeDef.primary = fieldName;
            if (typeof field.required === "boolean" && field.required === false) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} primary field ${typeDef.primary} had {required: false} (not allowed)`
                );
            }
            if (typeof field.unique === "boolean" && field.unique === false) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} primary field ${typeDef.primary} had {unique: false} (not allowed)`
                );
            }
            if (typeof field.updatable === "boolean" && field.updatable === true) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} primary field ${typeDef.primary} had {updatable: true} (not allowed)`
                );
            }
            if (field.when) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} primary field ${typeDef.primary} had {when} (not allowed)`
                );
            }
            if (field.ref) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} primary field ${typeDef.primary} had {ref} (not allowed)`
                );
            }
            field.required = true;
            field.unique = true;
            field.updatable = false;
            field.inFileName = true;
        }
        if (typeof field.ref === "object") {
            if (typeof field.index === "boolean" && field.index === false) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} reference field ${fieldName} had {index: false} (not allowed)`
                );
            }
            field.index = true;
            if (!field.ref.refType) {
                field.ref.refType = fieldName;
            }
            typeDef.addRef(fieldPath, field.ref.refType);
        }
        if (field.index || field.unique) {
            if (!typeDef) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} non-root field ${fieldName} had {index: true} (not allowed)`
                );
            }
            if (field.type === "boolean" && field.indexLevels && field.indexLevels !== 0) {
                throw new MobilettoOrmError(`${invalidPrefix} indexLevels > 0 not allowed on boolean field`);
            }
            if (!field.primary) {
                typeDef.indexes.push({ field: fieldName, unique: field.unique || false });
            } else if (field.unique) {
                field.required = true;
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
                throw new MobilettoOrmError(
                    `${invalidPrefix} transient field ${typeDef.primary} had {primary: true} (not allowed)`
                );
            } else if (field.unique) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} transient field ${typeDef.primary} had {unique: true} (not allowed)`
                );
            } else if (field.index) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} transient field ${typeDef.primary} had {index: true} (not allowed)`
                );
            } else if (field.ref) {
                throw new MobilettoOrmError(
                    `${invalidPrefix} transient field ${typeDef.primary} had {ref: ...} (not allowed)`
                );
            }
        }

        const redact =
            (typeof field.redact === "undefined" && AUTO_REDACT_CONTROLS.includes(field.control)) ||
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
                throw new MobilettoOrmError(
                    `${invalidPrefix} {inFileName: true} not allowed on field that is not required: ${fieldPath}`
                );
            }
            typeDef.filenameFields.push(fieldPath);
        }

        if (field.values && Array.isArray(field.values)) {
            const hasLabels =
                field.labels && Array.isArray(field.labels) && field.labels.length === field.values.length;
            const hasItems = field.items && Array.isArray(field.items) && field.items.length === field.values.length;
            if (!hasItems) field.items = [];
            if (!hasLabels) field.labels = [];
            for (let i = 0; i < field.values.length; i++) {
                const value = field.values[i];
                if (!hasItems && field.items) {
                    field.items.push({
                        value,
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        label: `${hasLabels ? field.labels![i] : value}`,
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    });
                }
                if (!hasLabels) {
                    (field.labels as string[]).push(`${value}`);
                }
            }
        } else if (field.items && Array.isArray(field.items)) {
            field.values = field.items.map((i) => i.value);
            field.labels ||= [];
            field.labels = field.items.map((i) => i.label) as string[];
        }
    });
};
