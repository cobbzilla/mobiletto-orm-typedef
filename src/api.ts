import { MobilettoApiConfig, MobilettoApiEndpointConfig } from "./constants.js";

const DEFAULT_ENDPOINT_CONFIG: MobilettoApiEndpointConfig = { permission: { admin: true }, hasValidate: false };

const processEndpoint = (endpoint: MobilettoApiEndpointConfig | undefined): MobilettoApiEndpointConfig => {
    if (!endpoint) return DEFAULT_ENDPOINT_CONFIG;
    if (typeof endpoint.permission === "object") {
        const perm = JSON.parse(JSON.stringify(endpoint.permission));
        if (!perm.admin && !perm.owner) {
            endpoint.permission = { owner: true };
        }
    }
    endpoint.hasValidate = typeof endpoint.validate === "function";
    return endpoint;
};

export const processApiConfig = (apiConfig: MobilettoApiConfig): MobilettoApiConfig => {
    apiConfig.lookup = processEndpoint(apiConfig.lookup);
    apiConfig.search = processEndpoint(apiConfig.search);
    apiConfig.create = processEndpoint(apiConfig.create);
    apiConfig.update = processEndpoint(apiConfig.update);
    apiConfig.delete = processEndpoint(apiConfig.delete);
    return apiConfig;
};
