import shasum from "shasum";
import crypto from "crypto";

export const fsSafeName = (name: string): string => encodeURIComponent(name).replace(/%/g, "~");

export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};

export const sha = (val: string | number | boolean) => shasum(val, "SHA-256");

export const randomstring = (len: number) => crypto.randomBytes(len).toString("hex").substring(0, len);
