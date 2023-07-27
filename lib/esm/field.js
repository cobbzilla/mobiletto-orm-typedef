export const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];
export const VALID_PRIMARY_TYPES = ["string", "number"];
export const normalized = (fields, fieldName, thing) => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            fields[fieldName].normalize(thing[fieldName])
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            thing[fieldName];
};
export const normalizedValue = (fields, fieldName, val) => {
    return fields[fieldName] && typeof fields[fieldName].normalize === "function"
        ? /* eslint-disable @typescript-eslint/no-non-null-assertion */
            fields[fieldName].normalize(val)
        : /* eslint-enable @typescript-eslint/no-non-null-assertion */
            val;
};
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
