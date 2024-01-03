import { MobilettoOrmIdArg, MobilettoOrmObject } from "./constants.js";
export declare const VALID_FIELD_TYPES: string[];
export type MobilettoOrmFieldType = "number" | "string" | "boolean" | "object" | "string[]" | "number[]" | "boolean[]" | "object[]";
export type MobilettoOrmFieldControl = "label" | "text" | "password" | "hidden" | "textarea" | "duration" | "timestamp" | "range" | "flag" | "select" | "multi";
export type MobilettoOrmRawValue = string | number | boolean | null | undefined;
export type MobilettoOrmFieldRenderFunc = (v: MobilettoOrmRawValue, messages: Record<string, string>, title: string) => string;
export type MobilettoOrmFieldRender = "date" | "time" | "datetime" | MobilettoOrmFieldRenderFunc;
export declare const VALID_PRIMARY_TYPES: string[];
export type MobilettoOrmFieldIndexableValue = MobilettoOrmFieldScalarValue | MobilettoOrmFieldScalarValue[];
export type MobilettoOrmFieldScalarValue = string | number | boolean;
export type MobilettoOrmFieldValue = string | number | boolean | Record<string, any> | string[] | number[] | boolean[];
export type MobilettoOrmDefaultFieldOpts = {
    dummy?: boolean;
};
export type MobilettoOrmFieldItem = {
    value: MobilettoOrmFieldIndexableValue;
    label?: string;
    rawLabel?: boolean;
    hint?: string;
};
export type MobilettoOrmNormalizeFunc = (val: MobilettoOrmFieldValue) => Promise<MobilettoOrmFieldValue>;
export type MobilettoOrmCustomFieldTest = {
    message: string;
    valid: (v: Record<string, unknown>) => boolean;
};
export type MobilettoOrmRefSpec = {
    refType?: string;
};
export type MobilettoOrmRefResolver = (id: MobilettoOrmIdArg) => MobilettoOrmObject | Promise<MobilettoOrmObject>;
export type MobilettoOrmFieldDefConfig = {
    name?: string;
    type?: MobilettoOrmFieldType;
    ref?: MobilettoOrmRefSpec;
    inFileName?: boolean;
    label?: string;
    control?: MobilettoOrmFieldControl;
    default?: MobilettoOrmFieldValue;
    required?: boolean;
    when?: (val: MobilettoOrmObject) => boolean;
    primary?: boolean;
    updatable?: boolean;
    transient?: boolean;
    normalize?: MobilettoOrmNormalizeFunc;
    test?: MobilettoOrmCustomFieldTest;
    regex?: RegExp;
    min?: number;
    max?: number;
    minValue?: number;
    maxValue?: number;
    values?: MobilettoOrmFieldIndexableValue[];
    labels?: string[];
    items?: MobilettoOrmFieldItem[];
    index?: boolean;
    indexLevels?: number;
    unique?: boolean;
    redact?: boolean;
    tabIndex?: number;
    render?: MobilettoOrmFieldRender;
    fields?: Record<string, MobilettoOrmFieldDefConfig>;
    tabIndexes?: string[];
};
export declare const META_ID_FIELD: MobilettoOrmFieldDefConfig;
export declare const META_CTIME_FIELD: MobilettoOrmFieldDefConfig;
export declare const META_MTIME_FIELD: MobilettoOrmFieldDefConfig;
export declare const META_VERSION_FIELD: MobilettoOrmFieldDefConfig;
export declare const META_REMOVED_FIELD: MobilettoOrmFieldDefConfig;
export declare const META_FIELDS: Record<string, MobilettoOrmFieldDefConfig>;
export declare const metaField: (field: string) => MobilettoOrmFieldDefConfig;
export type MobilettoOrmFieldDefConfigs = Record<string, MobilettoOrmFieldDefConfig>;
export declare const normalized: (fields: MobilettoOrmFieldDefConfigs, fieldName: string, thing: MobilettoOrmObject) => Promise<MobilettoOrmFieldValue>;
export declare const normalizedValue: (fields: MobilettoOrmFieldDefConfigs, fieldName: string, val: MobilettoOrmFieldValue) => Promise<MobilettoOrmFieldValue>;
export declare const compareTabIndexes: (fields: MobilettoOrmFieldDefConfigs, f1: string, f2: string) => number;
export declare const nestFields: (fields: MobilettoOrmFieldDefConfigs) => MobilettoOrmFieldDefConfigs;
