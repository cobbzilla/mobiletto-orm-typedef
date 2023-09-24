import { MobilettoOrmFieldValue, MobilettoOrmRefResolver } from "./field.js";
import { MobilettoOrmObject } from "./constants.js";
export type MobilettoOrmTypeDefRegistryConfig = {
    name: string;
    default?: boolean;
};
export declare const ERR_REF_UNREGISTERED = "refUnregistered";
export declare const ERR_REF_UNKNOWN_ERROR = "refError";
export declare const ERR_REF_NOT_FOUND = "refNotFound";
export declare const ERR_REF_ALREADY_REGISTERED = "refAlreadyRegistered";
export declare class MobilettoOrmTypeDefRegistry {
    readonly name: string;
    readonly default: boolean;
    readonly resolvers: Record<string, MobilettoOrmRefResolver>;
    constructor(config: MobilettoOrmTypeDefRegistryConfig);
    register(typeDefName: string, resolver: MobilettoOrmRefResolver): void;
    isRegistered(typeDefName: string): boolean;
    resolve(typeDefName: string, id: MobilettoOrmFieldValue): Promise<MobilettoOrmObject | MobilettoOrmObject[]>;
}
