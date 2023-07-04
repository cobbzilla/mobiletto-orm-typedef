"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_REDACT_CONTROLS = exports.NUMERIC_CONTROL_TYPES = exports.RESERVED_FIELD_NAMES = exports.MIN_VERSION_STAMP_LENGTH = exports.versionStamp = exports.VERSION_SUFFIX_RAND_LEN = exports.OBJ_ID_SEP = exports.DEFAULT_ALTERNATE_ID_FIELDS = exports.DEFAULT_MIN_WRITES = exports.DEFAULT_MAX_VERSIONS = void 0;
const randomstring_1 = __importDefault(require("randomstring"));
exports.DEFAULT_MAX_VERSIONS = 5;
exports.DEFAULT_MIN_WRITES = 0;
exports.DEFAULT_ALTERNATE_ID_FIELDS = [
    "name",
    "username",
    "email",
];
exports.OBJ_ID_SEP = "_MORM_";
exports.VERSION_SUFFIX_RAND_LEN = 16;
const versionStamp = () => `_${Date.now()}_${randomstring_1.default.generate(exports.VERSION_SUFFIX_RAND_LEN)}`;
exports.versionStamp = versionStamp;
exports.MIN_VERSION_STAMP_LENGTH = (0, exports.versionStamp)().length;
exports.RESERVED_FIELD_NAMES = ["redaction", "removed"];
exports.NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
exports.AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];
