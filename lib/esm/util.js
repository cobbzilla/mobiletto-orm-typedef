import shasum from "shasum";
import crypto from "crypto";
export const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
export const sha = (val) => shasum(val, "SHA-256");
export const randomstring = (len) => crypto.randomBytes(len).toString("hex").substring(0, len);
