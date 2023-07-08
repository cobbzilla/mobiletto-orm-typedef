/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fsSafeName } from "./util.js";
export const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];
export const VALID_PRIMARY_TYPES = ["string", "number"];
export const DEFAULT_FIELDS = {
    id: {
        required: true,
        updatable: false,
        normalize: fsSafeName,
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
export const normalized = (fields, fieldName, thing) => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            fields[fieldName].normalize(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            thing[fieldName];
};
export const compareTabIndexes = (fields, f1, f2) => {
    // @ts-ignore
    return typeof fields[f1].tabIndex === "number" && typeof fields[f2].tabIndex === "number"
        ? // @ts-ignore
            fields[f1].tabIndex - fields[f2].tabIndex
        : typeof fields[f1].tabIndex === "number"
            ? -1
            : typeof fields[f2].tabIndex === "number"
                ? 1
                : 0;
};
