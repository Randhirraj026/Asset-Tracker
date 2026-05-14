require('dotenv').config({ override: true });
require('../src/config/env');

const { spawn } = require('child_process');
const path = require('path');

const prismaBin = path.resolve(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [prismaBin, ...args], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  env: process.env
});

child.on('exit', (code) => process.exit(code));
