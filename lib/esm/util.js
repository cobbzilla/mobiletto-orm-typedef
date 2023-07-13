import shasum from "shasum";
import { v4 as uuidv4 } from "uuid";
export const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
export const sha = (val) => shasum(val, "SHA256");
export const generateId = (prefix) => `${prefix ? prefix + "_" : ""}${Date.now().toString(16).padStart(12, "0")}_${uuidv4().replace("-", "")}`.toLowerCase();
export const MIN_ID_LENGTH = generateId().length;
export const rand = (len = 10) => {
    let s = "";
    while (s.length < len) {
        s += sha(generateId());
    }
    return s.substring(0, len);
};
