export const DEFAULT_MAX_VERSIONS = 5;
export const DEFAULT_MIN_WRITES = 0;
export const DEFAULT_ALTERNATE_ID_FIELDS = [];
export const VERSION_PREFIX = "v_";
export const RESERVED_FIELD_NAMES = ["redaction", "removed"];
export const NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
export const AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];
export const DEFAULT_API_CONFIG = {
    lookup: { admin: true },
    search: { admin: true },
    create: { admin: true },
    update: { admin: true },
    delete: { admin: true },
};
export const DEFAULT_FIELD_INDEX_LEVELS = 1;
export const DEFAULT_ID_INDEX_LEVELS = 1;
export const MobilettoMatchAll = () => true;
export const MobilettoNoopFunc = (thing) => Promise.resolve(null);
export const FIND_FIRST = { first: true };
export const FIND_REMOVED = { removed: true };
export const FIND_NOREDACT = { noRedact: true };
