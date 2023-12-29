import { MobilettoOrmTypeDefConfig } from "./constants.js";
import { MobilettoOrmTypeDef } from "./typedef.js";
export declare const mergeConfigs: (baseConfig: MobilettoOrmTypeDefConfig, overrideConfig: MobilettoOrmTypeDefConfig) => MobilettoOrmTypeDefConfig;
export declare const hideTypeDefFields: (typeDef: MobilettoOrmTypeDef, fields: string[]) => MobilettoOrmTypeDef;
