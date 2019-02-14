const path = require('path');

module.exports = {
    entry: ['./src/public/ez-string.js'],
    output: {
        filename: 'ez-string.js',
        path: path.resolve(__dirname, '../'),
        libraryTarget: 'umd'
    }
};