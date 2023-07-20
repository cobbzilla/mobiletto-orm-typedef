import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { FieldValidators, TypeValidations } from "./validation.js";
import { MobilettoOrmLogger } from "./util.js";

export const DEFAULT_MAX_VERSIONS = 5;
export const DEFAULT_MIN_WRITES = 0;

export const DEFAULT_ALTERNATE_ID_FIELDS: string[] = ["name", "username", "email"];

export const VERSION_PREFIX = "V_";
export const OBJ_ID_SEP = "_MORM_";

export const RESERVED_FIELD_NAMES = ["redaction", "removed"];
export const NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
export const AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];

export type MobilettoOrmNewInstanceOpts = {
    dummy?: boolean;
    full?: boolean;
    typeName?: string;
    code?: string;
};

export type MobilettoOrmTypeDefConfig = {
    typeName: string;
    singleton?: string;
    idPrefix?: string;
    primary?: string;
    basePath?: string;
    alternateIdFields?: string[];
    fields: MobilettoOrmFieldDefConfigs;
    tableFields?: string[];
    maxVersions?: number;
    minWrites?: number;
    validators?: FieldValidators;
    validations?: TypeValidations;
    logger?: MobilettoOrmLogger;
};

export type MobilettoOrmObjectMetadata = {
    id: string;
    version: string;
    removed?: boolean;
    ctime: number;
    mtime: number;
};

export type MobilettoOrmObject = {
    _meta?: MobilettoOrmObjectMetadata;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [prop: string]: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
};
