"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFields = exports.ERR_REQUIRED = exports.FIELD_VALIDATORS = void 0;
const field_js_1 = require("./field.js");
const errors_js_1 = require("./errors.js");
const registry_js_1 = require("./registry.js");
exports.FIELD_VALIDATORS = {
    required: (val, req) => !req || (typeof val !== "undefined" && val != null && (typeof val !== "string" || val.length > 0)),
    min: (val, limit) => val == null || (typeof val === "string" && val.length >= limit),
    max: (val, limit) => val == null || (typeof val === "string" && val.length <= limit),
    minValue: (val, limit) => val == null || (typeof val === "number" && val >= limit),
    maxValue: (val, limit) => val == null || (typeof val === "number" && val <= limit),
    regex: (val, rx) => val == null || !!val.match(rx),
};
exports.ERR_REQUIRED = "required";
const validateFields = (rootThing, thing, fields, current, validated, validators, errors, objPath, registry) => __awaiter(void 0, void 0, void 0, function* () {
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
                (0, errors_js_1.addError)(errors, fieldPath, exports.ERR_REQUIRED);
            }
            else if (field.fields && thingValueType === "object") {
                validated[fieldName] = {};
                const currentValue = current && typeof current === "object" && current[fieldName] ? current[fieldName] : null;
                yield (0, exports.validateFields)(rootThing, thing[fieldName], field.fields, currentValue, validated[fieldName], validators, errors, fieldPath, registry);
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
                (0, errors_js_1.addError)(errors, fieldPath, "type");
                continue;
            }
            // @ts-ignore
            if (field.values &&
                fieldValue &&
                ((field.type === "array" &&
                    Array.isArray(fieldValue) &&
                    !fieldValue.every((v) => typeof field.values !== "undefined" && field.values.includes(v))) ||
                    (field.type !== "array" && !field.values.includes(fieldValue)))) {
                (0, errors_js_1.addError)(errors, fieldPath, "values");
                continue;
            }
            if (field.ref) {
                if (typeof fieldValue === "undefined" || fieldValue == null || `${fieldValue}`.length === 0) {
                    (0, errors_js_1.addError)(errors, fieldPath, exports.ERR_REQUIRED);
                    continue;
                }
                if (registry) {
                    const refType = field.ref.refType ? field.ref.refType : fieldName;
                    if (!registry.isRegistered(refType)) {
                        (0, errors_js_1.addError)(errors, fieldPath, registry_js_1.ERR_REF_UNREGISTERED);
                        continue;
                    }
                    try {
                        const found = yield registry.resolve(refType, fieldValue);
                        if (!found) {
                            (0, errors_js_1.addError)(errors, fieldPath, registry_js_1.ERR_REF_NOT_FOUND);
                            continue;
                        }
                    }
                    catch (e) {
                        if (e instanceof errors_js_1.MobilettoOrmReferenceError) {
                            (0, errors_js_1.addError)(errors, fieldPath, e.message);
                            continue;
                        }
                    }
                }
            }
            else {
                for (const validator of Object.keys(validators)) {
                    // @ts-ignore
                    if (typeof field[validator] !== "undefined") {
                        // @ts-ignore
                        if (!validators[validator](fieldValue, field[validator])) {
                            if (validator === exports.ERR_REQUIRED && typeof field.default !== "undefined") {
                                continue;
                            }
                            (0, errors_js_1.addError)(errors, fieldPath, validator);
                        }
                    }
                }
            }
            if (typeof errors[fieldName] === "undefined" && typeof thing[fieldName] !== "undefined") {
                if (typeof field.test === "object" && field.test.message && typeof field.test.valid === "function") {
                    try {
                        if (!field.test.valid(thing)) {
                            (0, errors_js_1.addError)(errors, fieldPath, field.test.message);
                        }
                    }
                    catch (e) {
                        (0, errors_js_1.addError)(errors, fieldPath, field.test.message);
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
                            (0, errors_js_1.addError)(errors, fieldPath, "unmodifiable");
                        }
                        else if (current) {
                            // value remains unchanged
                        }
                        else {
                            validated[fieldName] = yield (0, field_js_1.normalizedValue)(fields, fieldName, val);
                            // this is the primary field; rewrite the id
                            if (validated._meta) {
                                validated._meta.id = validated[fieldName];
                            }
                        }
                    }
                    else {
                        validated[fieldName] = yield (0, field_js_1.normalizedValue)(fields, fieldName, val);
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
exports.validateFields = validateFields;
