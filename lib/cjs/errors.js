"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasErrors = exports.addError = exports.MobilettoOrmValidationError = exports.MobilettoOrmSyncError = exports.MobilettoOrmNotFoundError = exports.MobilettoOrmError = void 0;
class MobilettoOrmError extends Error {
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
exports.MobilettoOrmError = MobilettoOrmError;
class MobilettoOrmNotFoundError extends Error {
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
exports.MobilettoOrmNotFoundError = MobilettoOrmNotFoundError;
class MobilettoOrmSyncError extends Error {
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
exports.MobilettoOrmSyncError = MobilettoOrmSyncError;
class MobilettoOrmValidationError extends Error {
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
exports.MobilettoOrmValidationError = MobilettoOrmValidationError;
const addError = (errors, fieldPath, err) => {
    if (typeof errors[fieldPath] === "undefined") {
        errors[fieldPath] = [];
    }
    if (!errors[fieldPath].includes(err)) {
        errors[fieldPath].push(err);
    }
};
exports.addError = addError;
const hasErrors = (errors) => errors && Object.keys(errors).length > 0;
exports.hasErrors = hasErrors;
