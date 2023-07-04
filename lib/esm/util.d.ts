export declare const fsSafeName: (name: string) => string;
export type MobilettoOrmLogger = {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
};
export declare const sha: (val: string | number | boolean) => string;
