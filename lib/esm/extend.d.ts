import { MobilettoOrmTypeDefConfig } from "./constants";
import { MobilettoOrmTypeDef } from "./typedef";
export declare const mergeConfigs: (baseConfig: MobilettoOrmTypeDefConfig, overrideConfig: MobilettoOrmTypeDefConfig) => MobilettoOrmTypeDefConfig;
export declare const hideTypeDefFields: (typeDef: MobilettoOrmTypeDef, fields: string[]) => MobilettoOrmTypeDef;
