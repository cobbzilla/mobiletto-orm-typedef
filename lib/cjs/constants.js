"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ID_INDEX_LEVELS = exports.DEFAULT_FIELD_INDEX_LEVELS = exports.DEFAULT_API_CONFIG = exports.AUTO_REDACT_CONTROLS = exports.NUMERIC_CONTROL_TYPES = exports.RESERVED_FIELD_NAMES = exports.VERSION_PREFIX = exports.DEFAULT_ALTERNATE_ID_FIELDS = exports.DEFAULT_MIN_WRITES = exports.DEFAULT_MAX_VERSIONS = void 0;
exports.DEFAULT_MAX_VERSIONS = 5;
exports.DEFAULT_MIN_WRITES = 0;
exports.DEFAULT_ALTERNATE_ID_FIELDS = ["name", "username", "email"];
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
