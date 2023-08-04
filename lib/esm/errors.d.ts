import { MobilettoOrmFieldValue } from "./field";
export declare class MobilettoOrmError extends Error {
    readonly err: any;
    constructor(message: string, err?: any);
}
export declare class MobilettoOrmNotFoundError extends Error {
    readonly id: any;
    constructor(id: any);
}
export declare class MobilettoOrmSyncError extends Error {
    readonly id: any;
    constructor(id: any, message?: string);
}
export declare class MobilettoOrmReferenceError extends Error {
    readonly refType: string;
    readonly refId: MobilettoOrmFieldValue;
    readonly message: string;
    readonly cause?: any;
    constructor(refType: string, refId: MobilettoOrmFieldValue, message: string, cause?: any);
}
export type MobilettoOrmValidationErrors = Record<string, string[]>;
export declare class MobilettoOrmValidationError extends Error {
    readonly errors: MobilettoOrmValidationErrors;
    constructor(errors: MobilettoOrmValidationErrors);
}
export declare const addError: (errors: MobilettoOrmValidationErrors, fieldPath: string, err: string) => void;
export declare const hasErrors: (errors: MobilettoOrmValidationErrors) => boolean;
