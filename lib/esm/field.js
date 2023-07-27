var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const VALID_FIELD_TYPES = ["string", "number", "boolean", "object", "array"];
export const VALID_PRIMARY_TYPES = ["string", "number"];
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
