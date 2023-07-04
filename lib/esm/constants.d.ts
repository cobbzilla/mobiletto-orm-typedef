export declare const DEFAULT_MAX_VERSIONS = 5;
export declare const DEFAULT_MIN_WRITES = 0;
export declare const DEFAULT_ALTERNATE_ID_FIELDS: string[];
export declare const OBJ_ID_SEP = "_MORM_";
export declare const VERSION_SUFFIX_RAND_LEN = 16;
export declare const versionStamp: () => string;
export declare const MIN_VERSION_STAMP_LENGTH: number;
export declare const RESERVED_FIELD_NAMES: string[];
export declare const NUMERIC_CONTROL_TYPES: string[];
export declare const AUTO_REDACT_CONTROLS: string[];
export type MobilettoOrmInstance = Record<string, any>;
export type MobilettoOrmNewInstanceOpts = {
    dummy?: boolean;
    full?: boolean;
};
