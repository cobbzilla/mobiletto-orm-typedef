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
const win = typeof window !== "undefined" ? window : null;
const cr = typeof crypto_1.default !== "undefined" ? crypto_1.default : null;
const rand = (len) => {
    if (win && win.crypto && typeof win.crypto.getRandomValues === "function") {
        const a = new Uint8Array(1 + len / 2);
        win.crypto.getRandomValues(a);
        let s = "";
        a.forEach((c) => (s += d2h(c)));
        return s;
    }
    else if (cr && typeof cr.randomBytes === "function") {
        return cr
            .randomBytes(1 + len / 2)
            .toString("hex")
            .substring(0, len);
    }
    else {
        throw Error("rand: no crypto random function available");
    }
};
exports.rand = rand;
