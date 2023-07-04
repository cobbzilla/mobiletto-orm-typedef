export declare class MobilettoOrmError extends Error {
    private readonly err;
    constructor(message: string, err?: any);
}
export declare class MobilettoOrmNotFoundError extends Error {
    private readonly id;
    constructor(id: any);
}
export declare class MobilettoOrmSyncError extends Error {
    private readonly id;
    constructor(id: any, message?: string);
}
export type ValidationErrors = Record<string, string[]>;
export declare class MobilettoOrmValidationError extends Error {
    private readonly errors;
    constructor(errors: ValidationErrors);
}
export declare const addError: (errors: ValidationErrors, fieldPath: string, err: string) => void;
