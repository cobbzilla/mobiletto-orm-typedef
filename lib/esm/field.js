var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MobilettoOrmError } from "./errors.js";
export const VALID_FIELD_TYPES = [
    "string",
    "number",
    "boolean",
    "object",
    "string[]",
    "number[]",
    "boolean[]",
    "object[]",
];
export const VALID_PRIMARY_TYPES = ["string", "number"];
export const META_ID_FIELD = {
    name: "id",
    type: "string",
    unique: true,
    control: "label",
};
export const META_CTIME_FIELD = {
    name: "ctime",
    type: "number",
    control: "label",
    render: "datetime",
};
export const META_MTIME_FIELD = {
    name: "mtime",
    type: "number",
    control: "label",
    render: "datetime",
};
export const META_VERSION_FIELD = {
    name: "version",
    type: "string",
    unique: true,
    control: "label",
};
export const META_REMOVED_FIELD = {
    name: "removed",
    type: "boolean",
    control: "label",
};
export const META_FIELDS = {
    id: META_ID_FIELD,
    version: META_VERSION_FIELD,
    ctime: META_CTIME_FIELD,
    mtime: META_MTIME_FIELD,
    removed: META_REMOVED_FIELD,
};
export const metaField = (field) => {
    const norm = field.replace(/\./, "_");
    const underscore = norm.lastIndexOf("_");
    const f = underscore === -1 || underscore === norm.length - 1 ? norm : norm.substring(underscore + 1);
    if (META_FIELDS[f])
        return META_FIELDS[f];
    throw new MobilettoOrmError(`metaField(${field}): ${f} is not a valid meta field`);
};
export const normalized = (fields, fieldName, thing) => __awaiter(void 0, void 0, void 0, function* () {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            yield fields[fieldName].normalize(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            thing[fieldName];
});
export const normalizedValue = (fields, fieldName, val) => __awaiter(void 0, void 0, void 0, function* () {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            yield fields[fieldName].normalize(val)
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            val;
});
export const compareTabIndexes = (fields, f1, f2) => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    return typeof fields[f1].tabIndex === "number" && typeof fields[f2].tabIndex === "number"
        ? // @ts-ignore
            fields[f1].tabIndex - fields[f2].tabIndex
        : typeof fields[f1].tabIndex === "number"
            ? -1
            : typeof fields[f2].tabIndex === "number"
                ? 1
                : 0;
    /* eslint-enable @typescript-eslint/ban-ts-comment */
};
const FILTER_NESTED_ATTRS = ["primary", "unique", "index", "indexLevels"];
const filterNested = (field) => {
    return JSON.parse(JSON.stringify(field, (key, value) => {
        if (FILTER_NESTED_ATTRS.includes(key)) {
            return undefined; // Omit some keys
        }
        else {
            return value;
        }
    }));
};
export const nestFields = (fields) => {
    const nested = {};
    for (const fieldName in fields) {
        nested[fieldName] = filterNested(fields[fieldName]);
    }
    return nested;
};
//# sourceMappingURL=field.js.map