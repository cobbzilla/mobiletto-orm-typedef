import { MobilettoOrmRefResolver } from "./field.js";
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

    async resolve(typeDefName: string, id: MobilettoOrmIdArg): Promise<MobilettoOrmObject> {
        if (!this.resolvers[typeDefName]) {
            throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNREGISTERED);
        }
        let resolved;
        try {
            resolved = await this.resolvers[typeDefName](id);
        } catch (e) {
            if (e instanceof MobilettoOrmNotFoundError) {
                // expected, will re-throw below as MobilettoOrmReferenceError
            } else {
                throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_UNKNOWN_ERROR, e);
            }
        }
        if (!resolved) throw new MobilettoOrmReferenceError(typeDefName, id, ERR_REF_NOT_FOUND);
        return resolved;
    }
}
