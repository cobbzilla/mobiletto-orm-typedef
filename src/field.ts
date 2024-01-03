import { MobilettoOrmIdArg, MobilettoOrmObject } from "./constants.js";
import { MobilettoOrmError } from "./errors.js";

export const VALID_FIELD_TYPES = [
    "string",
    "number",
    "boolean",
    "object",
    "string[]",
    "number[]",
    "boolean[]",
    "object[]",
];

export type MobilettoOrmFieldType =
    | "number"
    | "string"
    | "boolean"
    | "object"
    | "string[]"
    | "number[]"
    | "boolean[]"
    | "object[]";

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

export type MobilettoOrmFieldIndexableValue = MobilettoOrmFieldScalarValue | MobilettoOrmFieldScalarValue[];
export type MobilettoOrmFieldScalarValue = string | number | boolean;

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

export const META_ID_FIELD: MobilettoOrmFieldDefConfig = {
    name: "id",
    type: "string",
    unique: true,
    control: "label",
};
export const META_CTIME_FIELD: MobilettoOrmFieldDefConfig = {
    name: "ctime",
    type: "number",
    control: "label",
    render: "datetime",
};
export const META_MTIME_FIELD: MobilettoOrmFieldDefConfig = {
    name: "mtime",
    type: "number",
    control: "label",
    render: "datetime",
};
export const META_VERSION_FIELD: MobilettoOrmFieldDefConfig = {
    name: "version",
    type: "string",
    unique: true,
    control: "label",
};
export const META_REMOVED_FIELD: MobilettoOrmFieldDefConfig = {
    name: "removed",
    type: "boolean",
    control: "label",
};
export const META_FIELDS: Record<string, MobilettoOrmFieldDefConfig> = {
    id: META_ID_FIELD,
    version: META_VERSION_FIELD,
    ctime: META_CTIME_FIELD,
    mtime: META_MTIME_FIELD,
    removed: META_REMOVED_FIELD,
};

export const metaField = (field: string): MobilettoOrmFieldDefConfig => {
    const norm = field.replace(/\./, "_");
    const underscore = norm.lastIndexOf("_");
    const f = underscore === -1 || underscore === norm.length - 1 ? norm : norm.substring(underscore + 1);
    if (META_FIELDS[f]) return META_FIELDS[f];
    throw new MobilettoOrmError(`metaField(${field}): ${f} is not a valid meta field`);
};

export type MobilettoOrmFieldDefConfigs = Record<string, MobilettoOrmFieldDefConfig>;

export const normalized = async (
    fields: MobilettoOrmFieldDefConfigs,
    fieldName: string,
    thing: MobilettoOrmObject
): Promise<MobilettoOrmFieldValue> => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
          await fields[fieldName].normalize!(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
          thing[fieldName];
};

export const normalizedValue = async (
    fields: MobilettoOrmFieldDefConfigs,
    fieldName: string,
    val: MobilettoOrmFieldValue
): Promise<MobilettoOrmFieldValue> => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
          await fields[fieldName].normalize!(val)
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
          val;
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

const FILTER_NESTED_ATTRS = ["primary", "unique", "index", "indexLevels"];

const filterNested = (field: MobilettoOrmFieldDefConfig): MobilettoOrmFieldDefConfig => {
    return JSON.parse(
        JSON.stringify(field, (key, value) => {
            if (FILTER_NESTED_ATTRS.includes(key)) {
                return undefined; // Omit some keys
            } else {
                return value;
            }
        })
    );
};

export const nestFields = (fields: MobilettoOrmFieldDefConfigs): MobilettoOrmFieldDefConfigs => {
    const nested = {} as MobilettoOrmFieldDefConfigs;
    for (const fieldName in fields) {
        nested[fieldName] = filterNested(fields[fieldName]);
    }
    return nested;
};
