"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSwagger = void 0;
/**
 * Deep merges two Swagger/OpenAPI specification objects.
 * Concatenates arrays and merges objects.
 */
const mergeSwagger = (target, source) => {
    if (typeof target !== 'object' || target === null) {
        return source;
    }
    if (typeof source !== 'object' || source === null) {
        return target;
    }
    const output = { ...target };
    if (Array.isArray(target) && Array.isArray(source)) {
        return [...target, ...source];
    }
    Object.keys(source).forEach((key) => {
        if (Array.isArray(source[key])) {
            if (!output[key]) {
                output[key] = [];
            }
            // Ensure we don't have duplicates in arrays if they are simple types,
            // but for objects (like servers), we might want to just concat.
            // For Swagger tags/paths, concat is usually safe or we overwrite if key exists.
            // For this specific use case, we assume arrays should be concatenated.
            output[key] = [...(output[key] || []), ...source[key]];
        }
        else if (typeof source[key] === 'object' && source[key] !== null) {
            if (!output[key]) {
                output[key] = { ...source[key] };
            }
            else {
                output[key] = (0, exports.mergeSwagger)(output[key], source[key]);
            }
        }
        else {
            output[key] = source[key];
        }
    });
    return output;
};
exports.mergeSwagger = mergeSwagger;
