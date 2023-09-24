var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MobilettoOrmNotFoundError, MobilettoOrmReferenceError } from "./errors.js";
export const ERR_REF_UNREGISTERED = "refUnregistered";
export const ERR_REF_UNKNOWN_ERROR = "refError";
export const ERR_REF_NOT_FOUND = "refNotFound";
export const ERR_REF_ALREADY_REGISTERED = "refAlreadyRegistered";
export class MobilettoOrmTypeDefRegistry {
    constructor(config) {
        this.resolvers = {};
        this.name = config.name;
    }
    register(typeDefName, resolver) {
        if (this.resolvers[typeDefName]) {
            throw new MobilettoOrmReferenceError(typeDefName, "", ERR_REF_ALREADY_REGISTERED);
        }
        this.resolvers[typeDefName] = resolver;
    }
    isRegistered(typeDefName) {
        return !!this.resolvers[typeDefName];
    }
    resolve(typeDefName, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.resolvers[typeDefName]) {
                throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNREGISTERED);
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
                            if (e instanceof MobilettoOrmNotFoundError) {
                                // expected, will re-throw below as MobilettoOrmReferenceError
                                notFound.push(i);
                            }
                            else {
                                errors.push(new MobilettoOrmReferenceError(typeDefName, i, ERR_REF_UNKNOWN_ERROR, e));
                            }
                            resolve();
                        });
                    }
                    catch (e) {
                        if (e instanceof MobilettoOrmNotFoundError) {
                            // expected, will re-throw below as MobilettoOrmReferenceError
                            notFound.push(i);
                        }
                        else {
                            errors.push(new MobilettoOrmReferenceError(typeDefName, i, ERR_REF_UNKNOWN_ERROR, e));
                        }
                        resolve();
                    }
                }));
            }
            yield Promise.all(promises);
            if (errors.length > 0) {
                throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNKNOWN_ERROR, errors);
            }
            if (notFound.length > 0 || resolved.length !== expected) {
                throw new MobilettoOrmReferenceError(typeDefName, notFound, ERR_REF_NOT_FOUND);
            }
            return isArray ? resolved : resolved[0];
        });
    }
}
//# sourceMappingURL=registry.js.map