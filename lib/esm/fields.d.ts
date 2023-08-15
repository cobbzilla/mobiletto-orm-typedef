import { MobilettoOrmFieldControl, MobilettoOrmFieldDefConfig, MobilettoOrmFieldDefConfigs, MobilettoOrmFieldType } from "./field.js";
import { MobilettoOrmTypeDef } from "./typedef.js";
export declare const determineFieldControl: (fieldName: string, field: MobilettoOrmFieldDefConfig, fieldType: MobilettoOrmFieldType) => MobilettoOrmFieldControl;
export declare const determineFieldType: (fieldName: string, field: MobilettoOrmFieldDefConfig) => MobilettoOrmFieldType;
export declare const FIELD_NAME_REGEX: RegExp;
export declare const processFields: (fields: MobilettoOrmFieldDefConfigs, objPath: string, typeDef: MobilettoOrmTypeDef) => void;
