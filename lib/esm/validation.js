/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { normalizedValue } from "./field.js";
import { addError } from "./errors.js";
export const FIELD_VALIDATORS = {
    required: (val, req) => !req || (typeof val !== "undefined" && val != null && (typeof val !== "string" || val.length > 0)),
    min: (val, limit) => val == null || (typeof val === "string" && val.length >= limit),
    max: (val, limit) => val == null || (typeof val === "string" && val.length <= limit),
    minValue: (val, limit) => val == null || (typeof val === "number" && val >= limit),
    maxValue: (val, limit) => val == null || (typeof val === "number" && val <= limit),
    regex: (val, rx) => val == null || !!val.match(rx),
};
export const validateFields = (rootThing, thing, fields, current, validated, validators, errors, objPath) => {
    const isCreate = typeof current === "undefined" || current == null;
    for (const fieldName of Object.keys(fields)) {
        const fieldPath = objPath === "" ? fieldName : `${objPath}.${fieldName}`;
        let field = fields[fieldName];
        const thingValueType = typeof thing[fieldName];
        if (typeof field.when === "function") {
            if (field.when(thing)) {
                field = Object.assign({}, field, { required: true });
            }
            else {
                continue;
            }
        }
        if (field.type === "object") {
            if (field.required && thingValueType !== "object") {
                addError(errors, fieldPath, "required");
            }
            else if (field.fields && thingValueType === "object") {
                validated[fieldName] = {};
                const currentValue = current && typeof current === "object" && current[fieldName] ? current[fieldName] : null;
                validateFields(rootThing, thing[fieldName], field.fields, currentValue, validated[fieldName], validators, errors, fieldPath);
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
            if (field.type &&
                fieldValue != null &&
                field.type !== thingValueType &&
                !(field.type === "array" && Array.isArray(fieldValue))) {
                addError(errors, fieldPath, "type");
                continue;
            }
            // @ts-ignore
            if (field.values &&
                fieldValue &&
                ((field.type === "array" &&
                    Array.isArray(fieldValue) &&
                    !fieldValue.every((v) => typeof field.values !== "undefined" && field.values.includes(v))) ||
                    (field.type !== "array" && !field.values.includes(fieldValue)))) {
                addError(errors, fieldPath, "values");
                continue;
            }
            for (const validator of Object.keys(validators)) {
                // @ts-ignore
                if (typeof field[validator] !== "undefined") {
                    // @ts-ignore
                    if (!validators[validator](fieldValue, field[validator])) {
                        if (validator === "required" && typeof field.default !== "undefined") {
                            continue;
                        }
                        addError(errors, fieldPath, validator);
                    }
                }
            }
            if (typeof errors[fieldName] === "undefined" && typeof thing[fieldName] !== "undefined") {
                if (typeof field.test === "object" && field.test.message && typeof field.test.valid === "function") {
                    try {
                        if (!field.test.valid(thing)) {
                            addError(errors, fieldPath, field.test.message);
                        }
                    }
                    catch (e) {
                        addError(errors, fieldPath, field.test.message);
                    }
                }
            }
            if (typeof errors[fieldName] === "undefined") {
                let val = null;
                if (isCreate &&
                    typeof field.default !== "undefined" &&
                    (!fieldValue || (typeof fieldValue.length === "number" && fieldValue.length === 0))) {
                    val = field.default;
                }
                else {
                    val = typeof fieldValue === "undefined" ? null : fieldValue;
                }
                // only normalize we used the caller-provided value
                // do not re-normalize if we used the current value
                if (useThingValue && val) {
                    // if this is the primary field, it must be a new object,
                    // or it must match previous value
                    if (field.primary) {
                        if (current && current[fieldName] !== val) {
                            addError(errors, fieldPath, "unmodifiable");
                        }
                        else if (current) {
                            // value remains unchanged
                        }
                        else {
                            validated[fieldName] = normalizedValue(fields, fieldName, val);
                            // this is the primary field; rewrite the id
                            if (validated._meta) {
                                validated._meta.id = validated[fieldName];
                            }
                        }
                    }
                    else {
                        validated[fieldName] = normalizedValue(fields, fieldName, val);
                    }
                }
                else {
                    validated[fieldName] = val;
                }
            }
        }
        else if (!isCreate && currentValueType !== "undefined") {
            validated[fieldName] = current[fieldName];
        }
    }
};
