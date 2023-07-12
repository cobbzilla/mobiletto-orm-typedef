import shasum from "shasum";
import crypto from "crypto";
export const fsSafeName = (name) => encodeURIComponent(name).replace(/%/g, "~");
export const sha = (val) => shasum(val, "SHA-256");
// adapted from https://stackoverflow.com/q/19387338
const d2h = (d) => (+d).toString(16);
export const rand = (len) => {
    if (crypto && typeof crypto.randomBytes === "function") {
        return crypto
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
