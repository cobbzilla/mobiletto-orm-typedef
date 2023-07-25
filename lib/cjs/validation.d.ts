import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { MobilettoOrmValidationErrors } from "./errors.js";
import { MobilettoOrmObject } from "./constants.js";
export type FieldValidator = (val: any, arg: any) => boolean;
export type FieldValidators = Record<string, FieldValidator>;
export declare const FIELD_VALIDATORS: FieldValidators;
export type TypeValidation = {
    field: string;
    valid: (val: any) => Promise<boolean>;
    error: string | undefined;
};
export type TypeValidations = Record<string, TypeValidation>;
export declare const validateFields: (rootThing: MobilettoOrmObject, thing: MobilettoOrmObject, fields: MobilettoOrmFieldDefConfigs, current: MobilettoOrmObject | undefined, validated: MobilettoOrmObject, validators: FieldValidators, errors: MobilettoOrmValidationErrors, objPath: string) => void;
