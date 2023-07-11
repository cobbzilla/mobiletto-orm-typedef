"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomstring = exports.sha = exports.fsSafeName = void 0;
const shasum_1 = __importDefault(require("shasum"));
const crypto_1 = __importDefault(require("crypto"));
const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
exports.fsSafeName = fsSafeName;
const sha = (val) => (0, shasum_1.default)(val, "SHA-256");
exports.sha = sha;
const randomstring = (len) => crypto_1.default.randomBytes(len).toString("hex").substring(0, len);
exports.randomstring = randomstring;
