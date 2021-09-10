import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(__dirname, '..', '..');

export function pathResolve(...relativePath) {
  return path.resolve(rootDir, ...relativePath);
}