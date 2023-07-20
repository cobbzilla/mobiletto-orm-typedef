export declare const fsSafeName: (name: string) => string;
export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};
export declare const sha: (val: string | number | boolean) => string;
export declare const generateId: (prefix?: string) => string;
export declare const idRegex: (prefix?: string) => RegExp;
export declare const MIN_ID_LENGTH: number;
export declare const rand: (len?: number) => string;
