"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basename = exports.FIND_ALL = exports.FIND_NOREDACT = exports.FIND_REMOVED = exports.FIND_FIRST = exports.MobilettoNoopFunc = exports.DEFAULT_ID_INDEX_LEVELS = exports.DEFAULT_FIELD_INDEX_LEVELS = exports.DEFAULT_API_CONFIG = exports.AUTO_REDACT_CONTROLS = exports.NUMERIC_CONTROL_TYPES = exports.RESERVED_FIELD_NAMES = exports.VERSION_PREFIX = exports.DEFAULT_ALTERNATE_ID_FIELDS = exports.DEFAULT_MIN_WRITES = exports.DEFAULT_MAX_VERSIONS = void 0;
exports.DEFAULT_MAX_VERSIONS = 5;
exports.DEFAULT_MIN_WRITES = 0;
exports.DEFAULT_ALTERNATE_ID_FIELDS = [];
exports.VERSION_PREFIX = "v_";
exports.RESERVED_FIELD_NAMES = ["redaction", "removed"];
exports.NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
exports.AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];
exports.DEFAULT_API_CONFIG = {
    lookup: { admin: true },
    search: { admin: true },
    create: { admin: true },
    update: { admin: true },
    delete: { admin: true },
};
exports.DEFAULT_FIELD_INDEX_LEVELS = 1;
exports.DEFAULT_ID_INDEX_LEVELS = 1;
const MobilettoNoopFunc = () => Promise.resolve(null);
exports.MobilettoNoopFunc = MobilettoNoopFunc;
exports.FIND_FIRST = { first: true };
exports.FIND_REMOVED = { removed: true };
exports.FIND_NOREDACT = { noRedact: true };
const FIND_ALL = () => true;
exports.FIND_ALL = FIND_ALL;
const basename = (path) => {
    // strip trailing slashes, if any
    const p = path.endsWith("/") ? path.replace(/\/+$/, "") : path;
    const lastSlash = p.lastIndexOf("/");
    const base = lastSlash === -1 ? p : p.substring(lastSlash + 1);
    return base === "" ? "." : base;
};
exports.basename = basename;
