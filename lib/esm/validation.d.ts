import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { MobilettoOrmValidationErrors } from "./errors.js";
import { MobilettoOrmObject } from "./constants.js";
import { MobilettoOrmTypeDefRegistry } from "./registry.js";
export type FieldValidator = (val: any, arg: any) => boolean;
export type FieldValidators = Record<string, FieldValidator>;
export declare const FIELD_VALIDATORS: FieldValidators;
export type TypeValidation = {
    field: string;
    valid: (val: any) => boolean | Promise<boolean>;
    error?: string;
};
export type TypeValidations = Record<string, TypeValidation>;
export declare const ERR_REQUIRED = "required";
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
export declare const validateFields: (arg: ValidateFieldsArg) => Promise<void>;
