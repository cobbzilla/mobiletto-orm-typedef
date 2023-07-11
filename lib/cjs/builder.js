"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildType = void 0;
const errors_js_1 = require("./errors.js");
const fs = __importStar(require("fs"));
const TYPENAME_SUFFIX = "Type";
const buildTypeFields = (name, fields, decls) => {
    let code = `export type ${name}${TYPENAME_SUFFIX} = {\n`;
    let fieldCode = "";
    for (const fieldName of Object.keys(fields)) {
        const field = fields[fieldName];
        fieldCode += `    ${fieldName}`;
        let optional = !field.required;
        if (field.when && typeof field.when === "function") {
            optional = true;
        }
        if (optional)
            fieldCode += "?";
        fieldCode += ": ";
        if (field.type === "object") {
            if (field.fields && Object.keys(field.fields).length > 0) {
                const subTypeName = name + "_" + fieldName;
                fieldCode += subTypeName + TYPENAME_SUFFIX;
                buildTypeFields(subTypeName, field.fields, decls);
            }
            else {
                throw new errors_js_1.MobilettoOrmError(`buildTypeFields: indeterminate fields for object: ${field.name}`);
            }
        }
        else if (field.type === "array") {
            let valueType;
            if (field.values && field.values.length && field.values.length > 0) {
                valueType = typeof field.values[0];
            }
            else if (field.items && field.items.length && field.items.length > 0) {
                valueType = typeof field.items[0].value;
            }
            else {
                throw new errors_js_1.MobilettoOrmError(`buildTypeFields: indeterminate value type for array: ${field.name}`);
            }
            fieldCode += valueType + "[]";
        }
        else {
            fieldCode += field.type;
        }
        fieldCode += ";\n";
    }
    code += fieldCode + "};\n";
    decls.push({ name, code });
};
const buildType = (name, fields, out) => {
    const decls = [];
    buildTypeFields(name, fields, decls);
    const code = decls.map((d) => d.code).join("\n");
    if (out) {
        fs.writeFileSync(out, code);
    }
    return code;
};
exports.buildType = buildType;
