/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { normalizedValue } from "./field.js";
import { addError, MobilettoOrmReferenceError } from "./errors.js";
import { ERR_REF_NOT_FOUND, ERR_REF_UNREGISTERED } from "./registry.js";
export const FIELD_VALIDATORS = {
    required: (val, req) => !req || (typeof val !== "undefined" && val != null && (typeof val !== "string" || val.length > 0)),
    min: (val, limit) => val == null || (typeof val === "string" && val.length >= limit),
    max: (val, limit) => val == null || (typeof val === "string" && val.length <= limit),
    minValue: (val, limit) => val == null || (typeof val === "number" && val >= limit),
    maxValue: (val, limit) => val == null || (typeof val === "number" && val <= limit),
    regex: (val, rx) => val == null || !!val.match(rx),
};
export const ERR_REQUIRED = "required";
export const validateFields = (rootThing, thing, fields, current, validated, validators, errors, objPath, registry) => __awaiter(void 0, void 0, void 0, function* () {
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
                addError(errors, fieldPath, ERR_REQUIRED);
            }
            else if (field.fields && thingValueType === "object") {
                validated[fieldName] = {};
                const currentValue = current && typeof current === "object" && current[fieldName] ? current[fieldName] : null;
                yield validateFields(rootThing, thing[fieldName], field.fields, currentValue, validated[fieldName], validators, errors, fieldPath, registry);
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
            if (field.ref) {
                if (!registry) {
                    addError(errors, fieldPath, "noRegistry");
                    continue;
                }
                if (typeof fieldValue === "undefined" || fieldValue == null || `${fieldValue}`.length === 0) {
                    addError(errors, fieldPath, ERR_REQUIRED);
                    continue;
                }
                const refType = field.ref.refType ? field.ref.refType : fieldName;
                if (!registry.isRegistered(refType)) {
                    addError(errors, fieldPath, ERR_REF_UNREGISTERED);
                    continue;
                }
                try {
                    const found = yield registry.resolve(refType, fieldValue);
                    if (!found) {
                        addError(errors, fieldPath, ERR_REF_NOT_FOUND);
                        continue;
                    }
                }
                catch (e) {
                    if (e instanceof MobilettoOrmReferenceError) {
                        addError(errors, fieldPath, e.message);
                        continue;
                    }
                }
            }
            else {
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
                // only normalize if we used the caller-provided value
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
                            validated[fieldName] = yield normalizedValue(fields, fieldName, val);
                            // this is the primary field; rewrite the id
                            if (validated._meta) {
                                validated._meta.id = validated[fieldName];
                            }
                        }
                    }
                    else {
                        validated[fieldName] = yield normalizedValue(fields, fieldName, val);
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
});
