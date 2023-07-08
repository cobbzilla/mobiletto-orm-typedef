import { MobilettoOrmInstance } from "./constants.js";
export declare const VALID_FIELD_TYPES: string[];
export type MobilettoOrmFieldType = "number" | "string" | "boolean" | "object" | "array";
export type MobilettoOrmFieldControl = "label" | "text" | "password" | "textarea" | "duration" | "timestamp" | "range" | "flag" | "select" | "multi";
export type MobilettoOrmFieldRender = "date" | "time" | "datetime";
export declare const VALID_PRIMARY_TYPES: string[];
export type MobilettoOrmFieldIndexableValue = string | number | boolean;
export type MobilettoOrmFieldValue = string | number | boolean | Record<string, any> | string[] | number[] | boolean[];
export type MobilettoOrmDefaultFieldOpts = {
    dummy?: boolean;
};
export type MobilettoOrmFieldItem = {
    value: MobilettoOrmFieldIndexableValue;
    label: string;
};
export type MobilettoOrmFieldDefConfig = {
    name?: string;
    type?: MobilettoOrmFieldType;
    control?: MobilettoOrmFieldControl;
    default?: MobilettoOrmFieldValue;
    required?: boolean;
    when?: (val: MobilettoOrmInstance) => boolean;
    primary?: boolean;
    updatable?: boolean;
    normalize?: (val: any) => any;
    regex?: RegExp;
    min?: number;
    max?: number;
    minValue?: number;
    maxValue?: number;
    values?: MobilettoOrmFieldIndexableValue[];
    labels?: string[];
    items?: MobilettoOrmFieldItem[];
    index?: boolean;
    redact?: boolean;
    tabIndex?: number;
    render?: MobilettoOrmFieldRender;
    fields?: Record<string, MobilettoOrmFieldDefConfig>;
    tabIndexes?: string[];
};
export type MobilettoOrmFieldDefConfigs = Record<string, MobilettoOrmFieldDefConfig>;
export declare const DEFAULT_FIELDS: MobilettoOrmFieldDefConfigs;
export declare const normalized: (fields: MobilettoOrmFieldDefConfigs, fieldName: string, thing: MobilettoOrmInstance) => MobilettoOrmFieldValue;
export declare const compareTabIndexes: (fields: MobilettoOrmFieldDefConfigs, f1: string, f2: string) => number;