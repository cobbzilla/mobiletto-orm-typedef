"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rand = exports.MIN_ID_LENGTH = exports.idRegex = exports.generateId = exports.typedefHashDirs = exports.typedefHash = exports.sha = exports.OBJ_DIR_SUFFIX = exports.OBJ_ID_SEP = exports.fsSafeName = void 0;
const shasum_1 = __importDefault(require("shasum"));
const uuid_1 = require("uuid");
const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
exports.fsSafeName = fsSafeName;
exports.OBJ_ID_SEP = "_MORM_";
exports.OBJ_DIR_SUFFIX = "_MORM";
const sha = (val) => (0, shasum_1.default)(`${val}`, "SHA256");
exports.sha = sha;
const typedefHash = (val, debug) => (debug ? val : (0, exports.sha)(val));
exports.typedefHash = typedefHash;
const insertAtIndex = (str, insert, index) => {
    return str.slice(0, index) + insert + str.slice(index);
};
const typedefHashDirs = (val, debug, levels) => {
    if (debug)
        return `${val}${exports.OBJ_DIR_SUFFIX}`;
    let s = (0, exports.sha)(val);
    for (let i = 0; i < levels; i++) {
        s = insertAtIndex(s, "/", 2 + i * 2);
    }
    return s + exports.OBJ_DIR_SUFFIX;
};
exports.typedefHashDirs = typedefHashDirs;
const generateId = (prefix) => `${prefix ? prefix + "_" : ""}${Date.now().toString(16).padStart(12, "0")}_${(0, uuid_1.v4)().replace("-", "")}`.toLowerCase();
exports.generateId = generateId;
const idRegex = (prefix) => new RegExp(`^${prefix ? prefix + "_" : ""}[a-f\\d]{12}_[\\da-f]{12}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12}$`, "i");
exports.idRegex = idRegex;
exports.MIN_ID_LENGTH = (0, exports.generateId)().length;
const rand = (len = 10) => {
    let s = "";
    while (s.length < len) {
        s += (0, exports.sha)((0, exports.generateId)());
    }
    return s.substring(0, len);
};
exports.rand = rand;
