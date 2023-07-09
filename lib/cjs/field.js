"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareTabIndexes = exports.normalized = exports.DEFAULT_FIELDS = exports.VALID_PRIMARY_TYPES = exports.VALID_FIELD_TYPES = void 0;
const util_js_1 = require("./util.js");
exports.VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];
exports.VALID_PRIMARY_TYPES = ["string", "number"];
exports.DEFAULT_FIELDS = {
    id: {
        required: true,
        updatable: false,
        normalize: util_js_1.fsSafeName,
        regex: /^[^%~]+$/gi,
    },
    ctime: {
        control: "label",
        type: "number",
        updatable: false,
        normalize: () => Date.now(),
        render: "datetime",
    },
    mtime: {
        control: "label",
        type: "number",
        normalize: () => Date.now(),
        render: "datetime",
    },
};
const normalized = (fields, fieldName, thing) => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            fields[fieldName].normalize(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            thing[fieldName];
};
exports.normalized = normalized;
const compareTabIndexes = (fields, f1, f2) => {
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
exports.compareTabIndexes = compareTabIndexes;
