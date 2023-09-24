import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { MobilettoOrmValidationErrors } from "./errors.js";
import { MobilettoOrmObject } from "./constants.js";
import { MobilettoOrmTypeDefRegistry } from "./registry.js";
export type FieldValidator = (val: any, arg: any) => boolean;
export type FieldValidators = Record<string, FieldValidator>;
export declare const FIELD_VALIDATORS: FieldValidators;
export type TypeValidation = {
    field: string;
    valid: (val: any) => Promise<boolean>;
    error?: string;
};
export type TypeValidations = Record<string, TypeValidation>;
export declare const ERR_REQUIRED = "required";
export declare const validateFields: (rootThing: MobilettoOrmObject, thing: MobilettoOrmObject, fields: MobilettoOrmFieldDefConfigs, current: MobilettoOrmObject | undefined, validated: MobilettoOrmObject, validators: FieldValidators, errors: MobilettoOrmValidationErrors, objPath: string, registry: MobilettoOrmTypeDefRegistry) => Promise<void>;
