import { MobilettoOrmObject } from "./constants.js";

export const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];

export type MobilettoOrmFieldType = "number" | "string" | "boolean" | "object" | "array";
export type MobilettoOrmFieldControl =
    | "label"
    | "text"
    | "password"
    | "hidden"
    | "textarea"
    | "duration"
    | "timestamp"
    | "range"
    | "flag"
    | "select"
    | "multi";

export type MobilettoOrmRawValue = string | number | boolean | null | undefined;

export type MobilettoOrmFieldRenderFunc = (
    v: MobilettoOrmRawValue,
    messages: Record<string, string>,
    title: string
) => string;
export type MobilettoOrmFieldRender = "date" | "time" | "datetime" | MobilettoOrmFieldRenderFunc;

export const VALID_PRIMARY_TYPES = ["string", "number"];

export type MobilettoOrmFieldIndexableValue = string | number | boolean;
/* eslint-disable @typescript-eslint/no-explicit-any */
export type MobilettoOrmFieldValue = string | number | boolean | Record<string, any> | string[] | number[] | boolean[];
/* eslint-enable @typescript-eslint/no-explicit-any */
export type MobilettoOrmDefaultFieldOpts = {
    dummy?: boolean;
};

export type MobilettoOrmFieldItem = {
    value: MobilettoOrmFieldIndexableValue;
    label?: string;
    rawLabel?: boolean;
};

export type MobilettoOrmNormalizeFunc = (val: unknown) => unknown;

export type MobilettoOrmCustomFieldTest = {
    message: string;
    valid: (v: Record<string, unknown>) => boolean;
};

export type MobilettoOrmFieldDefConfig = {
    name?: string;
    type?: MobilettoOrmFieldType;
    label?: string;
    control?: MobilettoOrmFieldControl;
    default?: MobilettoOrmFieldValue;
    required?: boolean;
    when?: (val: MobilettoOrmObject) => boolean;
    primary?: boolean;
    updatable?: boolean;
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

export type MobilettoOrmFieldDefConfigs = Record<string, MobilettoOrmFieldDefConfig>;

export const normalized = (
    fields: MobilettoOrmFieldDefConfigs,
    fieldName: string,
    thing: MobilettoOrmObject
): MobilettoOrmFieldValue => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
          fields[fieldName].normalize!(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
          thing[fieldName];
};

export const compareTabIndexes = (fields: MobilettoOrmFieldDefConfigs, f1: string, f2: string) => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    return typeof fields[f1].tabIndex === "number" && typeof fields[f2].tabIndex === "number"
        ? // @ts-ignore
          fields[f1].tabIndex - fields[f2].tabIndex
        : typeof fields[f1].tabIndex === "number"
        ? -1
        : typeof fields[f2].tabIndex === "number"
        ? 1
        : 0;
    /* eslint-enable @typescript-eslint/ban-ts-comment */
};
