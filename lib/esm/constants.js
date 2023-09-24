export const DEFAULT_MAX_VERSIONS = 5;
export const DEFAULT_MIN_WRITES = 0;
export const DEFAULT_ALTERNATE_ID_FIELDS = [];
export const VERSION_PREFIX = "v_";
export const RESERVED_FIELD_NAMES = ["redaction", "removed"];
export const NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
export const AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];
export const DEFAULT_API_CONFIG = {
    lookup: { permission: { admin: true } },
    search: { permission: { admin: true } },
    create: { permission: { admin: true } },
    update: { permission: { admin: true } },
    delete: { permission: { admin: true } },
};
export const DEFAULT_FIELD_INDEX_LEVELS = 1;
export const DEFAULT_ID_INDEX_LEVELS = 1;
export const MobilettoNoopFunc = () => Promise.resolve(null);
export const FIND_FIRST = { first: true };
export const FIND_REMOVED = { removed: true };
export const FIND_NOREDACT = { noRedact: true };
export const FIND_ALL = () => true;
export const basename = (path) => {
    // strip trailing slashes, if any
    const p = path.endsWith("/") ? path.replace(/\/+$/, "") : path;
    const lastSlash = p.lastIndexOf("/");
    const base = lastSlash === -1 ? p : p.substring(lastSlash + 1);
    return base === "" ? "." : base;
};
export const isArrayType = (t) => (t && t.endsWith("[]") ? true : t ? false : null);
//# sourceMappingURL=constants.js.map