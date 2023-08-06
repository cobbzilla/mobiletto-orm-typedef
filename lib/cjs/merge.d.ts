/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export declare const isObject: (item: any) => boolean;
/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
export declare const mergeDeep: (target: Record<string, any>, ...sources: Record<string, any>[]) => Record<string, any>;
