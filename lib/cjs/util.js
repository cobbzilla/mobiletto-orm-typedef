"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha = exports.fsSafeName = void 0;
const shasum_1 = __importDefault(require("shasum"));
const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
exports.fsSafeName = fsSafeName;
const sha = (val) => (0, shasum_1.default)(val, "SHA-256");
exports.sha = sha;
