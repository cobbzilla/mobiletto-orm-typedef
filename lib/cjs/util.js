"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rand = exports.sha = exports.fsSafeName = void 0;
const shasum_1 = __importDefault(require("shasum"));
const crypto_1 = __importDefault(require("crypto"));
const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
exports.fsSafeName = fsSafeName;
const sha = (val) => (0, shasum_1.default)(val, "SHA-256");
exports.sha = sha;
// adapted from https://stackoverflow.com/q/19387338
const d2h = (d) => (+d).toString(16);
const rand = (len) => {
    if (crypto_1.default && typeof crypto_1.default.randomBytes === "function") {
        return crypto_1.default
            .randomBytes(1 + len / 2)
            .toString("hex")
            .substring(0, len);
    }
    else if (window && window.crypto && typeof window.crypto.getRandomValues === "function") {
        const a = new Uint8Array(1 + len / 2);
        window.crypto.getRandomValues(a);
        let s = "";
        a.forEach((c) => (s += d2h(c)));
        return s;
    }
    else {
        throw Error("rand: no crypto random function available");
    }
};
exports.rand = rand;
