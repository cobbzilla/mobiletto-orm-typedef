import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { FieldValidators, TypeValidations } from "./validation.js";
export declare const DEFAULT_MAX_VERSIONS = 5;
export declare const DEFAULT_MIN_WRITES = 0;
export declare const DEFAULT_ALTERNATE_ID_FIELDS: string[];
export declare const VERSION_PREFIX = "v_";
export declare const RESERVED_FIELD_NAMES: string[];
export declare const NUMERIC_CONTROL_TYPES: string[];
export declare const AUTO_REDACT_CONTROLS: string[];
export type MobilettoOrmNewInstanceOpts = {
    dummy?: boolean;
    full?: boolean;
    typeName?: string;
    code?: string;
};
export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};
export type MobilettoApiPermission = {
    admin: true;
} | {
    owner: true;
} | {
    session: true;
} | {
    public: true;
};
export type MobilettoApiConfig = {
    lookup: MobilettoApiPermission;
    search: MobilettoApiPermission;
    create: MobilettoApiPermission;
    update: MobilettoApiPermission;
    delete: MobilettoApiPermission;
};
export declare const DEFAULT_API_CONFIG: MobilettoApiConfig;
export type MobilettoOrmTypeDefConfig = {
    typeName: string;
    singleton?: string;
    idPrefix?: string;
    primary?: string;
    basePath?: string;
    indexLevels?: number;
    alternateIdFields?: string[];
    fields: MobilettoOrmFieldDefConfigs;
    apiConfig?: MobilettoApiConfig;
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
export type MobilettoOrmPredicate = (thing: MobilettoOrmObject) => boolean;
export type MobilettoOrmApplyFunc = (thing: MobilettoOrmObject) => Promise<unknown>;
export declare const MobilettoNoopFunc: MobilettoOrmApplyFunc;
export type MobilettoOrmFindOpts = {
    first?: boolean;
    removed?: boolean;
    noRedact?: boolean;
    predicate?: MobilettoOrmPredicate;
    apply?: MobilettoOrmApplyFunc;
    applyResults?: Record<string, unknown>;
    noCollect?: boolean;
    idPath?: boolean;
};
export declare const FIND_FIRST: {
    first: boolean;
};
export declare const FIND_REMOVED: {
    removed: boolean;
};
export declare const FIND_NOREDACT: {
    noRedact: boolean;
};
export declare const FIND_ALL: MobilettoOrmPredicate;
export type MobilettoOrmPurgeOpts = {
    force?: boolean;
};
export type MobilettoOrmPurgeResult = string | string[];
export type MobilettoOrmPurgeResults = MobilettoOrmPurgeResult[];
export declare const basename: (path: string) => string;
