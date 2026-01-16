
import * as fs from 'fs';
import * as path from 'path';
import { specs } from '../src/swagger/index';

const ADMIN_PUBLIC_DIR = path.resolve(__dirname, '../../admin/public');
const OUTPUT_FILE = path.join(ADMIN_PUBLIC_DIR, 'swagger.json');

if (fs.existsSync(ADMIN_PUBLIC_DIR)) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(specs, null, 2));
    console.log(`[SUCCESS] Generated static Swagger JSON at: ${OUTPUT_FILE}`);
} else {
    console.error(`[ERROR] Admin public directory not found at: ${ADMIN_PUBLIC_DIR}`);
    process.exit(1);
}
