/* eslint-disable @typescript-eslint/no-explicit-any */

import { MobilettoOrmFieldValue } from "./field.js";

export class MobilettoOrmError extends Error {
    readonly err: any;
    constructor(message: string, err?: any) {
        super(`${message}: ${err ? err : ""}`);
        this.err = err;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

export class MobilettoOrmNotFoundError extends Error {
    readonly id: any;
    constructor(id: any) {
        super(`MobilettoOrmNotFoundError: ${id}`);
        this.id = id;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

export class MobilettoOrmSyncError extends Error {
    readonly id: any;
    constructor(id: any, message?: string) {
        super(message ? message : `MobilettoOrmSyncError: ${id}`);
        this.id = id;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any).__proto__ = actualProto;
        }
    }
}

export class MobilettoOrmReferenceError extends Error {
    readonly refType: string;
    readonly refId: MobilettoOrmFieldValue;
    readonly message: string;
    readonly cause?: any;
    constructor(refType: string, refId: MobilettoOrmFieldValue, message: string, cause?: any) {
        super(`${refType}: ${message}${cause ? ` (caused by ${cause})` : ""}`);
        this.refType = refType;
        this.refId = refId;
        this.message = message;
        this.cause = cause;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any).__proto__ = actualProto;
        }
    }
}

export type MobilettoOrmValidationErrors = Record<string, string[]>;

export class MobilettoOrmValidationError extends Error {
    readonly errors: MobilettoOrmValidationErrors;
    constructor(errors: MobilettoOrmValidationErrors) {
        super(JSON.stringify(errors));
        this.errors = errors;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

export const addError = (errors: MobilettoOrmValidationErrors, fieldPath: string, err: string) => {
    if (typeof errors[fieldPath] === "undefined") {
        errors[fieldPath] = [];
    }
    if (!errors[fieldPath].includes(err)) {
        errors[fieldPath].push(err);
    }
};

export const hasErrors = (errors: MobilettoOrmValidationErrors) => errors && Object.keys(errors).length > 0;
