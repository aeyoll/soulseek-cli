#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const releaseType = process.argv[2];

if (!['major', 'minor', 'patch'].includes(releaseType)) {
  console.error('Usage: npm run bump -- <major|minor|patch>');
  process.exit(1);
}

execSync(`npm version ${releaseType} --no-git-tag-version`, { cwd: root, stdio: 'inherit' });

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const newVersion = pkg.version;

const cliPath = resolve(root, 'cli.js');
const cli = readFileSync(cliPath, 'utf8');
const updated = cli.replace(/^const VERSION = '.*';$/m, `const VERSION = '${newVersion}';`);
writeFileSync(cliPath, updated);

execSync(`git add package.json package-lock.json cli.js`, { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "chore: bump version to ${newVersion}"`, { cwd: root, stdio: 'inherit' });
execSync(`git tag ${newVersion}`, { cwd: root, stdio: 'inherit' });

console.log(`Bumped to ${newVersion}`);
