/* eslint-disable @typescript-eslint/no-explicit-any */
export class MobilettoOrmError extends Error {
    constructor(message, err) {
        super(`${message}: ${err ? err : ""}`);
        this.err = err;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
export class MobilettoOrmNotFoundError extends Error {
    constructor(id) {
        super(`MobilettoOrmNotFoundError: ${id}`);
        this.id = id;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
export class MobilettoOrmSyncError extends Error {
    constructor(id, message) {
        super(message ? message : `MobilettoOrmSyncError: ${id}`);
        this.id = id;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.__proto__ = actualProto;
        }
    }
}
export class MobilettoOrmReferenceError extends Error {
    constructor(refType, refId, message, cause) {
        super(`${refType}: ${message}${cause ? ` (caused by ${cause})` : ""}`);
        this.refType = refType;
        this.refId = refId;
        this.message = message;
        this.cause = cause;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.__proto__ = actualProto;
        }
    }
}
export class MobilettoOrmValidationError extends Error {
    constructor(errors) {
        super(JSON.stringify(errors));
        this.errors = errors;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
export const addError = (errors, fieldPath, err) => {
    if (typeof errors[fieldPath] === "undefined") {
        errors[fieldPath] = [];
    }
    if (!errors[fieldPath].includes(err)) {
        errors[fieldPath].push(err);
    }
};
export const hasErrors = (errors) => errors && Object.keys(errors).length > 0;
//# sourceMappingURL=errors.js.map