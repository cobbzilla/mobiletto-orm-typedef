"use strict";
// adapted from https://stackoverflow.com/a/34749873
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = exports.isObject = void 0;
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
const isObject = (item) => item && typeof item === "object" && !Array.isArray(item);
exports.isObject = isObject;
/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
const mergeDeep = (target, ...sources) => {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if ((0, exports.isObject)(target) && (0, exports.isObject)(source)) {
        for (const key in source) {
            if ((0, exports.isObject)(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                (0, exports.mergeDeep)(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return (0, exports.mergeDeep)(target, ...sources);
};
exports.mergeDeep = mergeDeep;
