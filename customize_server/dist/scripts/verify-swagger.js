"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_1 = require("../src/swagger");
console.log('Swagger Spec Loaded Successfully');
console.log('Title:', swagger_1.specs.info.title);
console.log('Version:', swagger_1.specs.info.version);
console.log('Path Count:', Object.keys(swagger_1.specs.paths).length);
console.log('Schema Count:', Object.keys(swagger_1.specs.components.schemas).length);
if (Object.keys(swagger_1.specs.paths).length === 0) {
    console.error('ERROR: No paths found!');
    process.exit(1);
}
if (Object.keys(swagger_1.specs.components.schemas).length === 0) {
    console.error('ERROR: No schemas found!');
    process.exit(1);
}
