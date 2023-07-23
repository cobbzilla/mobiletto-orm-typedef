import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { FieldValidators, TypeValidations } from "./validation.js";
import { MobilettoOrmLogger } from "./util.js";
export declare const DEFAULT_MAX_VERSIONS = 5;
export declare const DEFAULT_MIN_WRITES = 0;
export declare const DEFAULT_ALTERNATE_ID_FIELDS: string[];
export declare const VERSION_PREFIX = "v_";
export declare const OBJ_ID_SEP = "_MORM_";
export declare const RESERVED_FIELD_NAMES: string[];
export declare const NUMERIC_CONTROL_TYPES: string[];
export declare const AUTO_REDACT_CONTROLS: string[];
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
    indexLevels?: number;
    alternateIdFields?: string[];
    fields: MobilettoOrmFieldDefConfigs;
    tableFields?: string[];
    maxVersions?: number;
    minWrites?: number;
    validators?: FieldValidators;
    validations?: TypeValidations;
    logger?: MobilettoOrmLogger;
    debug?: boolean;
};
export type MobilettoOrmIdArg = string | MobilettoOrmObject;
export type MobilettoOrmObjectMetadata = {
    id: string;
    version: string;
    removed?: boolean;
    ctime: number;
    mtime: number;
};
export type MobilettoOrmObject = {
    _meta?: MobilettoOrmObjectMetadata;
    [prop: string]: any;
};
export declare const DEFAULT_FIELD_INDEX_LEVELS = 1;
export declare const DEFAULT_ID_INDEX_LEVELS = 1;
