"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_REDACT_CONTROLS = exports.NUMERIC_CONTROL_TYPES = exports.RESERVED_FIELD_NAMES = exports.MIN_VERSION_STAMP_LENGTH = exports.versionStamp = exports.VERSION_SUFFIX_RAND_LEN = exports.OBJ_ID_SEP = exports.DEFAULT_ALTERNATE_ID_FIELDS = exports.DEFAULT_MIN_WRITES = exports.DEFAULT_MAX_VERSIONS = void 0;
const randomstring = __importStar(require("randomstring"));
exports.DEFAULT_MAX_VERSIONS = 5;
exports.DEFAULT_MIN_WRITES = 0;
exports.DEFAULT_ALTERNATE_ID_FIELDS = ["name", "username", "email"];
exports.OBJ_ID_SEP = "_MORM_";
exports.VERSION_SUFFIX_RAND_LEN = 16;
const versionStamp = () => `_${Date.now()}_${randomstring.generate(exports.VERSION_SUFFIX_RAND_LEN)}`;
exports.versionStamp = versionStamp;
exports.MIN_VERSION_STAMP_LENGTH = (0, exports.versionStamp)().length;
exports.RESERVED_FIELD_NAMES = ["redaction", "removed"];
exports.NUMERIC_CONTROL_TYPES = ["duration", "timestamp", "range"];
exports.AUTO_REDACT_CONTROLS = ["password", "hidden", "system"];
