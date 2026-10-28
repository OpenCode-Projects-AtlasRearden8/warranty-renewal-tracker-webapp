'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.src.html'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, 'warranty-core.js'), 'utf8');

const out = html.replace(
  /\/\* == warranty-core\.js is inlined here by build\.js == \*\/\s*\/\/ BEGIN CORE[\s\S]*?\/\/ END CORE/,
  function () {
    return '/* == warranty-core.js is inlined here by build.js == */\n// BEGIN CORE\n' + core + '// END CORE';
  }
);

if (!out.includes('BEGIN CORE')) throw new Error('inline markers not found');
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('Built index.html (' + out.length + ' bytes)');
