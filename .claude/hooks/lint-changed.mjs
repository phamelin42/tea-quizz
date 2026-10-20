/**
 * Hook PostToolUse : passe ESLint et Prettier sur le seul fichier que Claude vient d'écrire.
 *
 * Repris de petit-bac et généralisé. Claude Code envoie sur stdin un JSON contenant
 * `tool_input.file_path`. Un code de sortie 2 renvoie stderr à Claude et l'oblige à corriger :
 * c'est ce qui transforme une convention écrite en garantie. Le hook ne bloque jamais sur
 * lui-même (charge utile inattendue, outils absents avant `npm install`).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const LINTABLE = /\.(ts|html)$/;
const FORMATTABLE = /\.(ts|html|scss|css|json|md|mjs|js|ya?ml)$/;
const IGNORED = /^(dist|node_modules|\.angular|coverage|test-results|playwright-report)[\\/]/;

let raw = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (typeof filePath !== 'string' || filePath.length === 0) process.exit(0);

const rel = isAbsolute(filePath) ? relative(ROOT, filePath) : filePath;
if (rel.startsWith('..') || IGNORED.test(rel)) process.exit(0);

const bin = (name) => join(ROOT, 'node_modules', '.bin', name);
const run = (name, args) =>
  spawnSync(bin(name), args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

const errors = [];

if (LINTABLE.test(rel) && existsSync(bin('eslint'))) {
  const eslint = run('eslint', [rel, '--max-warnings', '0']);
  if (eslint.status !== 0) errors.push(`ESLint :\n${eslint.stdout ?? ''}${eslint.stderr ?? ''}`);
}

if (FORMATTABLE.test(rel) && existsSync(bin('prettier'))) {
  // --ignore-unknown : un fichier exclu par .prettierignore ne doit pas bloquer.
  const prettier = run('prettier', ['--check', '--ignore-unknown', rel]);
  if (prettier.status !== 0) {
    errors.push(`Prettier : ${rel} n'est pas formaté (npx prettier --write ${rel}).`);
  }
}

if (errors.length === 0) process.exit(0);

process.stderr.write(
  `${rel} ne respecte pas les conventions :\n${errors.join('\n')}\n` +
    'Corrige avant de continuer, sans désactiver de règle (CLAUDE.commun.md § 4).\n',
);
process.exit(2);
