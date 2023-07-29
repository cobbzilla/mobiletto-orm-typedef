import shasum from "shasum";
import { v4 as uuidv4 } from "uuid";
export const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
export const OBJ_ID_SEP = "_MORM_";
export const OBJ_DIR_SUFFIX = "_MORM";
export const sha = (val) => shasum(`${val}`, "SHA256");
export const typedefHash = (val, debug) => (debug ? val : sha(val));
const insertAtIndex = (str, insert, index) => {
    return str.slice(0, index) + insert + str.slice(index);
};
export const typedefHashDirs = (val, debug, levels) => {
    if (debug)
        return `${val}${OBJ_DIR_SUFFIX}`;
    let s = sha(val);
    if (levels > 0) {
        for (let i = 0; i < levels; i++) {
            s = insertAtIndex(s, "/", 2 + 3 * i);
        }
    }
    return s + OBJ_DIR_SUFFIX;
};
export const generateId = (prefix) => `${prefix ? prefix + "_" : ""}${Date.now().toString(16).padStart(12, "0")}_${uuidv4().replace("-", "")}`.toLowerCase();
export const idRegex = (prefix) => new RegExp(`^${prefix ? prefix + "_" : ""}[a-f\\d]{12}_[\\da-f]{12}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12}$`, "i");
export const MIN_ID_LENGTH = generateId().length;
export const rand = (len = 10) => {
    let s = "";
    while (s.length < len) {
        s += sha(generateId());
    }
    return s.substring(0, len);
};
