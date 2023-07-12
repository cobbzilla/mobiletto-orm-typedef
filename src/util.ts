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

const win = typeof window !== "undefined" ? window : null;
const cr = typeof crypto !== "undefined" ? crypto : null;

export const rand = (len: number): string => {
    if (win && win.crypto && typeof win.crypto.getRandomValues === "function") {
        const a = new Uint8Array(1 + len / 2);
        win.crypto.getRandomValues(a);
        let s = "";
        a.forEach((c) => (s += d2h(c)));
        return s;
    } else if (cr && typeof cr.randomBytes === "function") {
        return cr
            .randomBytes(1 + len / 2)
            .toString("hex")
            .substring(0, len);
    } else {
        throw Error("rand: no crypto random function available");
    }
};
