"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_1 = require("../src/swagger");
const paths = swagger_1.specs.paths;
console.log('--- Swagger Structure Debug ---');
// Helper to check if value is array
const isArray = (val) => Array.isArray(val);
Object.entries(paths).forEach(([pathKey, pathItem]) => {
    // pathItem could have parameters at path level
    if (pathItem.parameters && !isArray(pathItem.parameters)) {
        console.error(`ERROR: Path [${pathKey}] 'parameters' is not an array!`, pathItem.parameters);
    }
    const operations = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    operations.forEach(method => {
        if (pathItem[method]) {
            const op = pathItem[method];
            // Check tags
            if (op.tags && !isArray(op.tags)) {
                console.error(`ERROR: Path [${pathKey}] Method [${method}] 'tags' is not an array!`, op.tags);
            }
            // Check security
            if (op.security && !isArray(op.security)) {
                console.error(`ERROR: Path [${pathKey}] Method [${method}] 'security' is not an array!`, op.security);
            }
            // Check parameters
            if (op.parameters) {
                if (!isArray(op.parameters)) {
                    console.error(`ERROR: Path [${pathKey}] Method [${method}] 'parameters' is not an array!`, op.parameters);
                }
                else {
                    op.parameters.forEach((param, idx) => {
                        if (!param.name)
                            console.error(`ERROR: Path [${pathKey}] Method [${method}] Param [${idx}] missing 'name'`);
                        if (!param.in)
                            console.error(`ERROR: Path [${pathKey}] Method [${method}] Param [${idx}] missing 'in'`);
                        // Check for bad ref usage in schema if simple param
                        if (param.schema && param.schema.$ref) {
                            // This is allowed but worth checking if it's malformed
                        }
                    });
                }
            }
            // Check requestBody
            if (op.requestBody) {
                if (op.requestBody.content) {
                    Object.entries(op.requestBody.content).forEach(([contentType, mediaType]) => {
                        if (!mediaType.schema) {
                            console.error(`ERROR: Path [${pathKey}] Method [${method}] ContentType [${contentType}] missing 'schema'`);
                        }
                    });
                }
            }
        }
    });
});
// Check securitySchemes
if (swagger_1.specs.components && swagger_1.specs.components.securitySchemes) {
    const output = JSON.stringify(swagger_1.specs.components.securitySchemes, null, 2);
    console.log('SecuritySchemes:', output);
    Object.entries(swagger_1.specs.components.securitySchemes).forEach(([key, val]) => {
        if (isArray(val)) {
            console.error(`ERROR: SecurityScheme [${key}] is an array!`);
        }
        if (typeof val !== 'object') {
            console.error(`ERROR: SecurityScheme [${key}] is not an object!`);
        }
    });
}
else {
    console.error('ERROR: components.securitySchemes is missing!');
}
console.log('--- Debug Complete ---');
