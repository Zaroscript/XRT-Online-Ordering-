"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Adjusted paths relative to customize_server/scripts/
const SWAGGER_FILE = path.join(__dirname, '../config/swagger.ts');
const OUTPUT_DIR = path.join(__dirname, '../src/swagger');
// Ensure output directories exist
const dirs = [
    'modules',
    'components/schemas',
    'components/responses',
    'components/parameters',
    'components/security',
];
dirs.forEach(d => fs.mkdirSync(path.join(OUTPUT_DIR, d), { recursive: true }));
const sourceCode = fs.readFileSync(SWAGGER_FILE, 'utf-8');
const sourceFile = ts.createSourceFile(SWAGGER_FILE, sourceCode, ts.ScriptTarget.Latest, true);
function findSpecsObject(node) {
    let found;
    node.forEachChild(child => {
        if (ts.isVariableStatement(child)) {
            child.declarationList.declarations.forEach(decl => {
                if (ts.isIdentifier(decl.name) && decl.name.text === 'specs' && decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
                    found = decl.initializer;
                }
            });
        }
    });
    return found;
}
const specsObj = findSpecsObject(sourceFile);
if (!specsObj) {
    console.error("Could not find 'specs' object export in swagger.ts");
    process.exit(1);
}
// Helpers
function getProperty(obj, name) {
    const prop = obj.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === name);
    return prop?.initializer;
}
function writeComponentFile(type, name, content) {
    const subDir = type === 'security' ? 'components/security' : `components/${type}`;
    const fileName = name.replace(/[^a-zA-Z0-9-]/g, '_');
    const filePath = path.join(OUTPUT_DIR, subDir, `${fileName}.${type === 'schemas' ? 'schema' : type === 'parameters' ? 'param' : type === 'responses' ? 'response' : 'security'}.ts`);
    // Only export the object directly
    // Fix: The text includes tokens like 'User: { ... }'. We want just '{ ... }'.
    // But usage of 'prop.initializer.getText()' gets the initializer value, which is '{ ... }'.
    // However, formatting might be weird if we just dump text.
    // We prefer 'export const Name = { ... };'
    const fileContent = `export const ${name} = ${content};\n`;
    fs.writeFileSync(filePath, fileContent);
    console.log(`Generated ${filePath}`);
}
// Extract Components
const componentsNode = getProperty(specsObj, 'components');
if (componentsNode && ts.isObjectLiteralExpression(componentsNode)) {
    const schemas = getProperty(componentsNode, 'schemas');
    if (schemas && ts.isObjectLiteralExpression(schemas)) {
        schemas.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                writeComponentFile('schemas', prop.name.text, prop.initializer.getText());
            }
        });
    }
    const responses = getProperty(componentsNode, 'responses');
    if (responses && ts.isObjectLiteralExpression(responses)) {
        responses.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                writeComponentFile('responses', prop.name.text, prop.initializer.getText());
            }
        });
    }
    const parameters = getProperty(componentsNode, 'parameters');
    if (parameters && ts.isObjectLiteralExpression(parameters)) {
        parameters.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                writeComponentFile('parameters', prop.name.text, prop.initializer.getText());
            }
        });
    }
    const securitySchemes = getProperty(componentsNode, 'securitySchemes');
    if (securitySchemes && ts.isObjectLiteralExpression(securitySchemes)) {
        securitySchemes.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                writeComponentFile('security', prop.name.text, prop.initializer.getText());
            }
        });
    }
}
// Extract Paths
const pathsNode = getProperty(specsObj, 'paths');
if (pathsNode && ts.isObjectLiteralExpression(pathsNode)) {
    const groupedPaths = {};
    pathsNode.properties.forEach(prop => {
        if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.name) && ts.isObjectLiteralExpression(prop.initializer)) {
            const pathUrl = prop.name.text;
            const pathObj = prop.initializer;
            let tags = [];
            pathObj.properties.forEach(methodProp => {
                if (tags.length > 0)
                    return;
                if (ts.isPropertyAssignment(methodProp) && ts.isObjectLiteralExpression(methodProp.initializer)) {
                    const tagsProp = getProperty(methodProp.initializer, 'tags');
                    if (tagsProp && ts.isArrayLiteralExpression(tagsProp)) {
                        tagsProp.elements.forEach(el => {
                            if (ts.isStringLiteral(el))
                                tags.push(el.text);
                        });
                    }
                }
            });
            const moduleName = tags.length > 0 ? tags[0].toLowerCase().replace(/[^a-z0-9]/g, '-') : 'misc';
            if (!groupedPaths[moduleName])
                groupedPaths[moduleName] = [];
            // We explicitly construct the key-value pair as string
            groupedPaths[moduleName].push(`'${pathUrl}': ${pathObj.getText()}`);
        }
    });
    Object.entries(groupedPaths).forEach(([moduleName, pathStrings]) => {
        const filePath = path.join(OUTPUT_DIR, 'modules', `${moduleName}.swagger.ts`);
        const content = `export const ${moduleName.replace(/-/g, '_')}_paths = {\n${pathStrings.join(',\n')}\n};\n`;
        fs.writeFileSync(filePath, content);
        console.log(`Generated ${filePath}`);
    });
}
