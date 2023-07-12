import shasum from "shasum";
import { v4 as uuidv4 } from "uuid";

export const fsSafeName = (name: string): string => encodeURIComponent(name).replace(/%/g, "~");

export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};

export const sha = (val: string | number | boolean) => shasum(val, "SHA256");

export const generateId = (prefix?: string) =>
    `${prefix ? prefix + "_" : ""}${Date.now().toString(16)}_${uuidv4().replace("-", "")}`.toLowerCase();

export const MIN_ID_LENGTH = generateId().length;

export const rand = (len: number): string => {
    let s = "";
    while (s.length < len) {
        s += sha(generateId());
    }
    return s.substring(0, len);
};
