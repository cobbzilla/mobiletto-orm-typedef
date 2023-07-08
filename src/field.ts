/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { fsSafeName } from "./util.js";
import { MobilettoOrmInstance } from "./constants.js";

export const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];

export type MobilettoOrmFieldType = "number" | "string" | "boolean" | "object" | "array";
export type MobilettoOrmFieldControl =
    | "label"
    | "text"
    | "password"
    | "textarea"
    | "duration"
    | "timestamp"
    | "range"
    | "flag"
    | "select"
    | "multi";
export type MobilettoOrmFieldRender = "date" | "time" | "datetime";

export const VALID_PRIMARY_TYPES = ["string", "number"];

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

export const DEFAULT_FIELDS: MobilettoOrmFieldDefConfigs = {
    id: {
        required: true,
        updatable: false,
        normalize: fsSafeName,
        regex: /^[^%~]+$/gi,
    },
    ctime: {
        control: "label",
        type: "number",
        updatable: false,
        normalize: () => Date.now(),
        render: "datetime",
    },
    mtime: {
        control: "label",
        type: "number",
        normalize: () => Date.now(),
        render: "datetime",
    },
};

export const normalized = (
    fields: MobilettoOrmFieldDefConfigs,
    fieldName: string,
    thing: MobilettoOrmInstance
): MobilettoOrmFieldValue => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
          fields[fieldName].normalize!(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
          thing[fieldName];
};

export const compareTabIndexes = (fields: MobilettoOrmFieldDefConfigs, f1: string, f2: string) => {
    // @ts-ignore
    return typeof fields[f1].tabIndex === "number" && typeof fields[f2].tabIndex === "number"
        ? // @ts-ignore
          fields[f1].tabIndex - fields[f2].tabIndex
        : typeof fields[f1].tabIndex === "number"
        ? -1
        : typeof fields[f2].tabIndex === "number"
        ? 1
        : 0;
};
