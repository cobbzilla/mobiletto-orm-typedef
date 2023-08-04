"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobilettoOrmTypeDefRegistry = exports.ERR_REF_ALREADY_REGISTERED = exports.ERR_REF_NOT_FOUND = exports.ERR_REF_UNKNOWN_ERROR = exports.ERR_REF_UNREGISTERED = void 0;
const errors_js_1 = require("./errors.js");
exports.ERR_REF_UNREGISTERED = "refUnregistered";
exports.ERR_REF_UNKNOWN_ERROR = "refError";
exports.ERR_REF_NOT_FOUND = "refNotFound";
exports.ERR_REF_ALREADY_REGISTERED = "refAlreadyRegistered";
class MobilettoOrmTypeDefRegistry {
    constructor(config) {
        this.resolvers = {};
        this.name = config.name;
    }
    register(typeDefName, resolver) {
        if (this.resolvers[typeDefName]) {
            throw new errors_js_1.MobilettoOrmReferenceError(typeDefName, "", exports.ERR_REF_ALREADY_REGISTERED);
        }
        this.resolvers[typeDefName] = resolver;
    }
    isRegistered(typeDefName) {
        return !!this.resolvers[typeDefName];
    }
    resolve(typeDefName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.resolvers[typeDefName]) {
                throw new errors_js_1.MobilettoOrmReferenceError(typeDefName, id, exports.ERR_REF_UNREGISTERED);
            }
            const isArray = Array.isArray(id);
            const ids = isArray ? id : [id];
            const expected = ids.length;
            const resolved = [];
            const notFound = [];
            const errors = [];
            const promises = [];
            for (const i of ids) {
                promises.push(new Promise((resolve) => {
                    try {
                        Promise.resolve(this.resolvers[typeDefName](i))
                            .then((r) => {
                            if (typeof r === "undefined" || r == null) {
                                notFound.push(i);
                                resolve();
                            }
                            else {
                                resolved.push(r);
                                resolve();
                            }
                        })
                            .catch((e) => {
                            if (e instanceof errors_js_1.MobilettoOrmNotFoundError) {
                                // expected, will re-throw below as MobilettoOrmReferenceError
                                notFound.push(i);
                            }
                            else {
                                errors.push(new errors_js_1.MobilettoOrmReferenceError(typeDefName, i, exports.ERR_REF_UNKNOWN_ERROR, e));
                            }
                            resolve();
                        });
                    }
                    catch (e) {
                        if (e instanceof errors_js_1.MobilettoOrmNotFoundError) {
                            // expected, will re-throw below as MobilettoOrmReferenceError
                            notFound.push(i);
                        }
                        else {
                            errors.push(new errors_js_1.MobilettoOrmReferenceError(typeDefName, i, exports.ERR_REF_UNKNOWN_ERROR, e));
                        }
                        resolve();
                    }
                }));
            }
            yield Promise.all(promises);
            if (errors.length > 0) {
                throw new errors_js_1.MobilettoOrmReferenceError(typeDefName, id, exports.ERR_REF_UNKNOWN_ERROR, errors);
            }
            if (notFound.length > 0 || resolved.length !== expected) {
                throw new errors_js_1.MobilettoOrmReferenceError(typeDefName, notFound, exports.ERR_REF_NOT_FOUND);
            }
            return isArray ? resolved : resolved[0];
        });
    }
}
exports.MobilettoOrmTypeDefRegistry = MobilettoOrmTypeDefRegistry;
