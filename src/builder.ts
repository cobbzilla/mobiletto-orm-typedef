import { MobilettoOrmFieldDefConfigs } from "./field.js";
import { MobilettoOrmError } from "./errors.js";
import * as fs from "fs";

type TypeCodeDeclaration = {
    name: string;
    code: string;
};

const TYPENAME_SUFFIX = "Type";

const buildTypeFields = (name: string, fields: MobilettoOrmFieldDefConfigs, decls: TypeCodeDeclaration[]): void => {
    let code = `export type ${name}${TYPENAME_SUFFIX} = {\n`;
    let fieldCode = "";
    for (const fieldName of Object.keys(fields)) {
        const field = fields[fieldName];
        fieldCode += `    ${fieldName}`;
        let optional = !field.required;
        if (field.when && typeof field.when === "function") {
            optional = true;
        }
        if (optional) fieldCode += "?";
        fieldCode += ": ";
        if (field.type === "object") {
            if (field.fields && Object.keys(field.fields).length > 0) {
                const subTypeName = name + "_" + fieldName;
                fieldCode += subTypeName + TYPENAME_SUFFIX;
                buildTypeFields(subTypeName, field.fields, decls);
            } else {
                throw new MobilettoOrmError(`buildTypeFields: indeterminate fields for object: ${field.name}`);
            }
        } else if (field.type === "array") {
            let valueType;
            if (field.values && field.values.length && field.values.length > 0) {
                valueType = typeof field.values[0];
            } else if (field.items && field.items.length && field.items.length > 0) {
                valueType = typeof field.items[0].value;
            } else {
                throw new MobilettoOrmError(`buildTypeFields: indeterminate value type for array: ${field.name}`);
            }
            fieldCode += valueType + "[]";
        } else {
            fieldCode += field.type;
        }
        fieldCode += ";\n";
    }
    code += fieldCode + "};\n";
    decls.push({ name, code });
};

export const buildType = (name: string, fields: MobilettoOrmFieldDefConfigs, out?: string): string => {
    const decls: TypeCodeDeclaration[] = [];
    buildTypeFields(name, fields, decls);
    const code = decls.map((d) => d.code).join("\n");
    if (out) {
        fs.writeFileSync(out, code);
    }
    return code;
};
