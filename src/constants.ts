import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { FieldValidators, TypeValidations } from "./validation.js";
import { MobilettoOrmTypeDefRegistry } from "./registry";

export const DEFAULT_MAX_VERSIONS = 5;
export const DEFAULT_MIN_WRITES = 0;

export const DEFAULT_ALTERNATE_ID_FIELDS: string[] = [];

export const VERSION_PREFIX = "v_";

export const RESERVED_FIELD_NAMES = ["redaction", "removed"];
export const NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
export const AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];

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

export type MobilettoApiPermission = { admin: true } | { owner: true } | { session: true } | { public: true };

export type MobilettoApiValidation = (
    caller: MobilettoOrmObject,
    target: MobilettoOrmObject | MobilettoOrmIdArg,
    opts?: Record<string, any>
) => Promise<boolean>;

export type MobilettoApiEndpointConfig = {
    permission: MobilettoApiPermission;
    validate?: MobilettoApiValidation;
};

export type MobilettoApiConfig = {
    lookup: MobilettoApiEndpointConfig;
    search: MobilettoApiEndpointConfig;
    create: MobilettoApiEndpointConfig;
    update: MobilettoApiEndpointConfig;
    delete: MobilettoApiEndpointConfig;
};

export const DEFAULT_API_CONFIG: MobilettoApiConfig = {
    lookup: { permission: { admin: true } },
    search: { permission: { admin: true } },
    create: { permission: { admin: true } },
    update: { permission: { admin: true } },
    delete: { permission: { admin: true } },
};

export type MobilettoOrmValidationOpts = {
    checkRefs?: boolean;
};

export type MobilettoOrmTypeDefConfig = {
    typeName?: string;
    registry?: MobilettoOrmTypeDefRegistry;
    singleton?: string;
    shortName?: string;
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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [prop: string]: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
};

export const DEFAULT_FIELD_INDEX_LEVELS = 1;
export const DEFAULT_ID_INDEX_LEVELS = 1;

export type MobilettoOrmPredicate = (thing: MobilettoOrmObject) => boolean;

export type MobilettoOrmApplyFunc = (thing: MobilettoOrmObject) => Promise<unknown>;

export const MobilettoNoopFunc: MobilettoOrmApplyFunc = () => Promise.resolve(null);

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

export const FIND_FIRST = { first: true };
export const FIND_REMOVED = { removed: true };
export const FIND_NOREDACT = { noRedact: true };
export const FIND_ALL: MobilettoOrmPredicate = () => true;

export type MobilettoOrmPurgeOpts = {
    force?: boolean;
};

export type MobilettoOrmPurgeResult = string | string[];
export type MobilettoOrmPurgeResults = MobilettoOrmPurgeResult[];

export const basename = (path: string) => {
    // strip trailing slashes, if any
    const p = path.endsWith("/") ? path.replace(/\/+$/, "") : path;
    const lastSlash = p.lastIndexOf("/");
    const base = lastSlash === -1 ? p : p.substring(lastSlash + 1);
    return base === "" ? "." : base;
};
