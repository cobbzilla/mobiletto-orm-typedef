import shasum from "shasum";

export const fsSafeName = (name: string): string => encodeURIComponent(name).replace(/%/g, "~");

export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};

export const sha = (val: string | number | boolean) => shasum(val, "SHA-256");
