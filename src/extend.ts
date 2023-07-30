import { MobilettoOrmFieldDefConfigs } from "./field";
import { MobilettoOrmTypeDefConfig } from "./constants";

const mergeFields = (
    baseFields: MobilettoOrmFieldDefConfigs,
    overrideFields: MobilettoOrmFieldDefConfigs
): MobilettoOrmFieldDefConfigs => {
    const extFields: MobilettoOrmFieldDefConfigs = {};
    if (Object.keys(overrideFields).length === 0) {
        return baseFields;
    }
    const baseFieldNames = Object.keys(baseFields);
    for (const fieldName of baseFieldNames) {
        const overrideFieldConfig = typeof overrideFields[fieldName] !== "undefined" ? overrideFields[fieldName] : {};
        const baseFieldConfig = baseFields[fieldName];
        const fieldConfig = Object.assign({}, baseFieldConfig, overrideFieldConfig);
        if (fieldConfig.fields && Object.keys(fieldConfig.fields).length > 0) {
            if (overrideFieldConfig.fields && Object.keys(overrideFieldConfig.fields).length != 0) {
                if (!baseFieldConfig.fields) {
                    fieldConfig.fields = overrideFieldConfig.fields;
                } else {
                    fieldConfig.fields = mergeFields(baseFieldConfig.fields, overrideFieldConfig.fields);
                }
            }
        }
        extFields[fieldName] = fieldConfig;
    }
    for (const newFieldName of Object.keys(overrideFields).filter((k) => !baseFieldNames.includes(k))) {
        extFields[newFieldName] = overrideFields[newFieldName];
    }
    return extFields;
};

export const mergeConfigs = (
    baseConfig: MobilettoOrmTypeDefConfig,
    overrideConfig: MobilettoOrmTypeDefConfig
): MobilettoOrmTypeDefConfig => {
    const extConfig: MobilettoOrmTypeDefConfig = Object.assign({}, baseConfig, overrideConfig);
    if (overrideConfig.fields) {
        extConfig.fields = mergeFields(baseConfig.fields, overrideConfig.fields);
    }
    return extConfig;
};
