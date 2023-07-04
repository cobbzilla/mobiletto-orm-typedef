import { MobilettoOrmInstance } from "./constants.js";
import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { ValidationErrors } from "./errors.js";
export type FieldValidator = (val: any, arg: any) => boolean;
export type FieldValidators = Record<string, FieldValidator>;
export declare const FIELD_VALIDATORS: FieldValidators;
export type TypeValidation = {
    field: string;
    valid: (val: any) => Promise<boolean>;
    error: string | undefined;
};
export type TypeValidations = Record<string, TypeValidation>;
export declare const validateFields: (rootThing: MobilettoOrmInstance, thing: MobilettoOrmInstance, fields: MobilettoOrmFieldDefConfigs, current: MobilettoOrmInstance, validated: MobilettoOrmInstance, validators: FieldValidators, errors: ValidationErrors, objPath: string) => void;
