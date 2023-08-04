import { MobilettoOrmFieldIndexableValue, MobilettoOrmFieldValue, MobilettoOrmRefResolver } from "./field.js";
import { MobilettoOrmNotFoundError, MobilettoOrmReferenceError } from "./errors.js";
import { MobilettoOrmIdArg, MobilettoOrmObject } from "./constants.js";

export type MobilettoOrmTypeDefRegistryConfig = {
    name: string;
    strict?: boolean;
};

export const ERR_REF_UNREGISTERED = "refUnregistered";
export const ERR_REF_UNKNOWN_ERROR = "refError";
export const ERR_REF_NOT_FOUND = "refNotFound";
export const ERR_REF_ALREADY_REGISTERED = "refAlreadyRegistered";

export class MobilettoOrmTypeDefRegistry {
    readonly name: string;
    readonly strict: boolean;
    readonly resolvers: Record<string, MobilettoOrmRefResolver> = {};
    constructor(config: MobilettoOrmTypeDefRegistryConfig) {
        this.name = config.name;
        this.strict = config.strict || true;
    }

    register(typeDefName: string, resolver: MobilettoOrmRefResolver) {
        if (this.resolvers[typeDefName]) {
            if (this.strict) {
                throw new MobilettoOrmReferenceError(typeDefName, "", ERR_REF_ALREADY_REGISTERED);
            }
        }
        this.resolvers[typeDefName] = resolver;
    }

    isRegistered(typeDefName: string) {
        return !!this.resolvers[typeDefName];
    }

    async resolve(typeDefName: string, id: MobilettoOrmFieldValue): Promise<MobilettoOrmObject | MobilettoOrmObject[]> {
        if (!this.resolvers[typeDefName]) {
            throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNREGISTERED);
        }
        const isArray = Array.isArray(id);
        const ids = isArray ? id : [id];
        const expected = ids.length;
        const resolved: MobilettoOrmObject[] = [];
        const notFound: MobilettoOrmFieldIndexableValue[] = [];
        const errors: MobilettoOrmReferenceError[] = [];
        const promises = [];
        for (const i of ids) {
            promises.push(
                new Promise<void>((resolve) => {
                    try {
                        Promise.resolve(this.resolvers[typeDefName](i))
                            .then((r: MobilettoOrmObject | null | undefined) => {
                                if (typeof r === "undefined" || r == null) {
                                    notFound.push(i);
                                    resolve();
                                } else {
                                    resolved.push(r);
                                    resolve();
                                }
                            })
                            .catch((e) => {
                                if (e instanceof MobilettoOrmNotFoundError) {
                                    // expected, will re-throw below as MobilettoOrmReferenceError
                                    notFound.push(i);
                                } else {
                                    errors.push(
                                        new MobilettoOrmReferenceError(typeDefName, i, ERR_REF_UNKNOWN_ERROR, e)
                                    );
                                }
                                resolve();
                            });
                    } catch (e) {
                        if (e instanceof MobilettoOrmNotFoundError) {
                            // expected, will re-throw below as MobilettoOrmReferenceError
                            notFound.push(i);
                        } else {
                            errors.push(new MobilettoOrmReferenceError(typeDefName, i, ERR_REF_UNKNOWN_ERROR, e));
                        }
                        resolve();
                    }
                })
            );
        }
        await Promise.all(promises);
        if (errors.length > 0) {
            throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNKNOWN_ERROR, errors);
        }
        if (notFound.length > 0 || resolved.length !== expected) {
            throw new MobilettoOrmReferenceError(typeDefName, notFound, ERR_REF_NOT_FOUND);
        }
        return isArray ? resolved : resolved[0];
    }
}
