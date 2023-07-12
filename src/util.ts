import shasum from "shasum";
import crypto from "crypto";

export const fsSafeName = (name: string): string => encodeURIComponent(name).replace(/%/g, "~");

export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};

export const sha = (val: string | number | boolean) => shasum(val, "SHA-256");

// adapted from https://stackoverflow.com/q/19387338
const d2h = (d: number | string): string => (+d).toString(16);

export const rand = (len: number): string => {
    if (crypto && typeof crypto.randomBytes === "function") {
        return crypto
            .randomBytes(1 + len / 2)
            .toString("hex")
            .substring(0, len);
    } else if (window && window.crypto && typeof window.crypto.getRandomValues === "function") {
        const a = new Uint8Array(1 + len / 2);
        window.crypto.getRandomValues(a);
        let s = "";
        a.forEach((c) => (s += d2h(c)));
        return s;
    } else {
        throw Error("rand: no crypto random function available");
    }
};
