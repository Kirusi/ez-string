'use strict';

const RawParser = require('./raw-parser');
const path = require('path');
const fs = require('fs');

// Construct path for generated parser's source location
let srcDir = path.join(__dirname, '..', '..', 'generated');
fs.mkdirSync(srcDir, { recursive: true });
let srcPath = path.join(srcDir, 'generated-parser.js');

/* Prolog of generated source code is incompatible with webpack
   We will replace it with a simpler version */
let prolog = `
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.parser = parser;
    exports.Parser = parser.Parser;
    exports.parse = function () { return parser.parse.apply(parser, arguments); };
}`;

let srcCode = RawParser.generateCode();

/* Write generated source code into a file. Replace for prolog
   First line of generated prolog contains the word 'export' */
let stream = fs.createWriteStream(srcPath);
try {
    let lines = srcCode.split('\n');
    for (let line of lines) {
        if (line.includes('export')) {
            break;
        }
        stream.write(`${line}\n`);
    }
    stream.write(prolog);
}
finally {
    stream.end(); // close stream
}
