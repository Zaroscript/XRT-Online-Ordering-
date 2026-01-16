
import * as fs from 'fs';
import * as path from 'path';

const BASE_DIR = path.join(__dirname, '../src/swagger');
const INDEX_FILE = path.join(BASE_DIR, 'index.ts');

const components = ['schemas', 'responses', 'parameters', 'security'];
const modulesDir = path.join(BASE_DIR, 'modules');

// Helper to get exported name from filename
// Filename: User.schema.ts -> User
// Filename: auth.swagger.ts -> auth_paths (convention)
function toImportName(file: string, type: 'schema' | 'response' | 'parameter' | 'security' | 'module'): string {
  const base = file.split('.')[0];
  if (type === 'module') {
    return `${base.replace(/-/g, '_')}_paths`;
  }
  // schemas/responses/params/security exported as their name
  // e.g. User.schema.ts -> User
  return base;
}

let imports: string[] = [];
let schemaAssigns: string[] = [];
let responseAssigns: string[] = [];
let paramAssigns: string[] = [];
let securityAssigns: string[] = [];
let moduleSpreads: string[] = [];

// 1. Process Components
components.forEach(comp => {
  const dir = path.join(BASE_DIR, 'components', comp);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

  files.forEach(f => {
    const importName = toImportName(f, comp === 'security' ? 'security' : comp.slice(0, -1) as any);
    // import { User } from './components/schemas/User.schema';
    const relPath = `./components/${comp}/${f.replace('.ts', '')}`;
    imports.push(`import { ${importName} } from '${relPath}';`);

    if (comp === 'schemas') schemaAssigns.push(importName);
    if (comp === 'responses') responseAssigns.push(importName);
    if (comp === 'parameters') paramAssigns.push(importName);
    if (comp === 'security') securityAssigns.push(importName);
  });
});

// 2. Process Modules
if (fs.existsSync(modulesDir)) {
  const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.ts'));
  files.forEach(f => {
    const importName = toImportName(f, 'module');
    // import { auth_paths } from './modules/auth.swagger';
    const relPath = `./modules/${f.replace('.ts', '')}`;
    imports.push(`import { ${importName} } from '${relPath}';`);
    moduleSpreads.push(`...${importName}`);
  });
}

// 3. Import Env for Servers (assuming env is needed)
// import { env } from '../../shared/config/env';
// Adjust relative path: src/swagger/index.ts -> ../../shared/config/env
imports.push(`import { env } from '../shared/config/env';`);
imports.push(`import packageJson from '../../package.json';`);

// 4. Construct Content
const content = `// Auto-generated Swagger Spec
${imports.join('\n')}

export const specs = {
  openapi: '3.0.0',
  info: {
    title: 'XRT Customized System API',
    version: packageJson.version || '2.0.0',
    description: \`Enterprise-grade REST API built with Clean Architecture, TypeScript, and Node.js + Express + MongoDB.

## Architecture
This API follows Clean Architecture principles with strict separation of concerns:
- **Domain Layer**: Business logic (framework-agnostic)
- **Application Layer**: Express controllers, routes, and middlewares
- **Infrastructure Layer**: Database, external services, and implementations
- **Shared Layer**: Utilities, constants, and configuration

## Features
- 🔐 JWT Authentication with access & refresh tokens
- 👥 Complete User Management with RBAC
- 🏢 Multi-Business Support
- 📦 Category Management
- 🍕 Item Management with Modifier Groups
- 🎛️ Modifier Group & Modifier Management
- 🎭 Role-Based Access Control (RBAC)
- 🔒 Enterprise Security Features
- 📚 Comprehensive API Documentation

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\\\`Authorization: Bearer YOUR_ACCESS_TOKEN\\\`

## Response Format
All responses follow a consistent format:
- Success: \\\`{ "success": true, "message": "...", "data": {...} }\\\`
- Error: \\\`{ "success": false, "message": "Error description" }\\\`\`,
    contact: {
      name: 'API Support',
      email: 'support@xrt.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: process.env.PRODUCTION_URL || \`https://xrt-online-ordering.vercel.app\${env.API_BASE_URL}\`,
      description: 'Production',
    },
    {
      url: \`http://localhost:\${env.PORT}\${env.API_BASE_URL}\`,
      description: 'Development',
    },
  ],
  components: {
    securitySchemes: {
      ${securityAssigns.map(s => `${s}: { ...${s} }`).join(',\n      ')}
    },
    schemas: {
      ${schemaAssigns.join(',\n      ')}
    },
    responses: {
      ${responseAssigns.join(',\n      ')}
    },
    parameters: {
      ${paramAssigns.join(',\n      ')}
    }
  },
  paths: {
    ${moduleSpreads.join(',\n    ')}
  }
};
`;

fs.writeFileSync(INDEX_FILE, content);

console.log(`Generated ${INDEX_FILE}`);
