/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { MobilettoOrmFieldDefConfigs, normalizedValue } from "./field.js";
import { addError, MobilettoOrmReferenceError, MobilettoOrmValidationErrors } from "./errors.js";
import { isArrayType, MobilettoOrmObject } from "./constants.js";
import { ERR_REF_NOT_FOUND, ERR_REF_UNREGISTERED, MobilettoOrmTypeDefRegistry } from "./registry.js";

export type FieldValidator = (val: any, arg: any) => boolean;

export type FieldValidators = Record<string, FieldValidator>;

export const FIELD_VALIDATORS: FieldValidators = {
    required: (val: any, req: boolean | null | undefined): boolean =>
        !req || (typeof val !== "undefined" && val != null && (typeof val !== "string" || val.length > 0)),

    min: (val: any, limit: number): boolean => val == null || (typeof val === "string" && val.length >= limit),

    max: (val: any, limit: number): boolean => val == null || (typeof val === "string" && val.length <= limit),

    minValue: (val: any, limit: number): boolean => val == null || (typeof val === "number" && val >= limit),

    maxValue: (val: any, limit: number): boolean => val == null || (typeof val === "number" && val <= limit),

    regex: (val: any, rx: RegExp): boolean => val == null || !!val.match(rx),
};

export type TypeValidation = {
    field: string;
    valid: (val: any) => boolean | Promise<boolean>;
    error?: string;
};

export type TypeValidations = Record<string, TypeValidation>;

export const ERR_REQUIRED = "required";

export type ValidateFieldsArg = {
    rootThing: MobilettoOrmObject;
    thing: MobilettoOrmObject;
    fields: MobilettoOrmFieldDefConfigs;
    current: MobilettoOrmObject | undefined;
    validated: MobilettoOrmObject;
    validators: FieldValidators;
    errors: MobilettoOrmValidationErrors;
    objPath: string;
    registry: MobilettoOrmTypeDefRegistry;
};

export const validateFields = async (arg: ValidateFieldsArg) => {
    const rootThing = arg.rootThing;
    const thing = arg.thing;
    const fields = arg.fields;
    const current = arg.current;
    const validated = arg.validated;
    const validators = arg.validators;
    const errors = arg.errors;
    const objPath = arg.objPath;
    const registry = arg.registry;
    const isCreate = typeof current === "undefined" || current == null;
    for (const fieldName of Object.keys(fields)) {
        const fieldPath = objPath === "" ? fieldName : `${objPath}.${fieldName}`;
        let field = fields[fieldName];
        let thingValueType: string = thing[fieldName] == null ? "undefined" : typeof thing[fieldName];
        if (thingValueType === "object" && Array.isArray(thing[fieldName])) {
            if (thing[fieldName].length > 0) {
                thingValueType = `${typeof thing[fieldName][0]}[]`;
            } else {
                thingValueType = "undefined";
            }
        }

        if (typeof field.when === "function") {
            if (field.when(thing)) {
                field = Object.assign({}, field, { required: true });
            } else {
                continue;
            }
        }
        if (field.type === "object") {
            if (field.required && thingValueType !== "object") {
                addError(errors, fieldPath, ERR_REQUIRED);
            } else if (field.fields && thingValueType === "object") {
                validated[fieldName] = {};
                const currentValue =
                    current && typeof current === "object" && typeof current[fieldName] !== "undefined"
                        ? current[fieldName]
                        : null;
                const subArg = Object.assign({}, arg, {
                    thing: thing[fieldName],
                    fields: field.fields,
                    current: currentValue,
                    validated: validated[fieldName],
                    objPath: fieldPath,
                });
                await validateFields(subArg);
            }
            continue;
        }

        const currentValueType = isCreate || !current ? "undefined" : typeof current[fieldName];
        const updatable = typeof field.updatable === "undefined" || !!field.updatable;
        const useThingValue = isCreate || (updatable && thingValueType !== "undefined" && thing[fieldName] != null);
        let fieldValue = useThingValue
            ? thing[fieldName]
            : currentValueType !== "undefined"
            ? current[fieldName]
            : null;
        if (typeof fieldValue === "string" && !field.required && fieldValue === "") {
            // empty strings are treated as no-value; for not-required fields the value '' becomes null
            // this ensures that "min length" checks pass
            fieldValue = null;
        }
        if (useThingValue) {
            const fieldEmpty =
                typeof fieldValue === "undefined" ||
                fieldValue == null ||
                (fieldValue.length && fieldValue.length === 0) ||
                `${fieldValue}`.length === 0;
            if (fieldEmpty && field.required && (field.ref || typeof field.default === "undefined")) {
                addError(errors, fieldPath, ERR_REQUIRED);
                continue;
            }
            if (field.type && typeof thing[fieldName] !== "undefined" && thing[fieldName] != null) {
                if (fieldValue != null && field.type !== thingValueType) {
                    if (field.type !== "object[]" || !Array.isArray(thing[fieldName])) {
                        addError(errors, fieldPath, "type");
                        continue;
                    }
                }
                if (isArrayType(field.type)) {
                    if (!Array.isArray(thing[fieldName])) {
                        addError(errors, fieldPath, "type");
                        continue;
                    }
                    let valueErrors = false;
                    for (let index = 0; index < thing[fieldName].length; index++) {
                        const v = thing[fieldName][index];
                        if (!field.type.startsWith(typeof v)) {
                            addError(errors, fieldPath, "type");
                            valueErrors = true;
                            break;
                        }
                        if (field.type === "object[]") {
                            const indexedFieldPath = `${fieldPath}[${index}]`;
                            validated[indexedFieldPath] = {};
                            const currentValue =
                                current &&
                                typeof current === "object" &&
                                typeof current[fieldName] !== "undefined" &&
                                typeof current[fieldName][index] !== "undefined"
                                    ? current[fieldName]
                                    : null;
                            const subArg = Object.assign({}, arg, {
                                thing: v,
                                fields: field.fields,
                                current: currentValue,
                                validated: validated[indexedFieldPath],
                                objPath: indexedFieldPath,
                            });
                            await validateFields(subArg);
                        }
                    }
                    if (valueErrors) continue;
                }
            }
            // @ts-ignore
            if (field.values && fieldValue && field.type === "array" && Array.isArray(fieldValue)) {
                const filtered = fieldValue.filter((v) => v != null && v !== "");
                if (!filtered.every((v) => typeof field.values !== "undefined" && field.values.includes(v))) {
                    addError(errors, fieldPath, "values");
                    continue;
                }
            }
            if (field.ref) {
                if (registry && !registry.default && !fieldEmpty) {
                    const refType = field.ref.refType ? field.ref.refType : fieldName;
                    if (!registry.isRegistered(refType)) {
                        addError(errors, fieldPath, ERR_REF_UNREGISTERED);
                        continue;
                    }
                    try {
                        const found = await registry.resolve(refType, fieldValue);
                        if (!found) {
                            addError(errors, fieldPath, ERR_REF_NOT_FOUND);
                            continue;
                        }
                    } catch (e) {
                        if (e instanceof MobilettoOrmReferenceError) {
                            addError(errors, fieldPath, e.message);
                            continue;
                        }
                    }
                }
            } else {
                if (isArrayType(field.type) && fieldValue && Array.isArray(fieldValue)) {
                    for (const val of fieldValue) {
                        for (const validator of Object.keys(validators)) {
                            // @ts-ignore
                            if (typeof field[validator] !== "undefined") {
                                // @ts-ignore
                                if (!validators[validator](val, field[validator])) {
                                    addError(errors, fieldPath, validator);
                                }
                            }
                        }
                    }
                } else {
                    for (const validator of Object.keys(validators)) {
                        // @ts-ignore
                        if (typeof field[validator] !== "undefined") {
                            // @ts-ignore
                            if (!validators[validator](fieldValue, field[validator])) {
                                if (validator === ERR_REQUIRED && typeof field.default !== "undefined") {
                                    continue;
                                }
                                addError(errors, fieldPath, validator);
                            }
                        }
                    }
                }
            }
            if (typeof errors[fieldName] === "undefined" && typeof thing[fieldName] !== "undefined") {
                if (typeof field.test === "object" && field.test.message && typeof field.test.valid === "function") {
                    try {
                        if (!field.test.valid(thing)) {
                            addError(errors, fieldPath, field.test.message);
                        }
                    } catch (e) {
                        addError(errors, fieldPath, field.test.message);
                    }
                }
            }
            if (typeof errors[fieldName] === "undefined") {
                let val = null;
                if (
                    isCreate &&
                    typeof field.default !== "undefined" &&
                    (typeof fieldValue === "undefined" ||
                        fieldValue == null ||
                        (typeof fieldValue.length === "number" && fieldValue.length === 0))
                ) {
                    val = field.default;
                } else {
                    val = typeof fieldValue === "undefined" ? null : fieldValue;
                }

                // only normalize if we used the caller-provided value
                // do not re-normalize if we used the current value
                if (useThingValue && val) {
                    // if this is the primary field, it must be a new object,
                    // or it must match previous value
                    if (field.primary) {
                        if (current && current[fieldName] !== val) {
                            addError(errors, fieldPath, "unmodifiable");
                        } else if (current) {
                            // value remains unchanged
                        } else {
                            validated[fieldName] = await normalizedValue(fields, fieldName, val);
                            // this is the primary field; rewrite the id
                            if (validated._meta) {
                                validated._meta.id = validated[fieldName];
                            }
                        }
                    } else {
                        validated[fieldName] = await normalizedValue(fields, fieldName, val);
                    }
                } else {
                    validated[fieldName] = val;
                }
            }
        } else if (!isCreate && currentValueType !== "undefined") {
            validated[fieldName] = current[fieldName];
        }
    }
};
