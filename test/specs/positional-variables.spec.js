'use strict';

/*global should render*/
// When runing in the browser, then 'render' and 'should' are already preloaded.
if (process) {
    // Running inside NodeJS
    let lib;
    // eslint-disable-next-line no-var
    var render;
    if (process.env.TEST_MODE === 'DEV') {
        // Use source code
        lib = require('../../src/private/raw-parser');
    }
    else if (process.env.TEST_MODE === 'GEN') {
        // Use source code
        lib = require('../../src/public/ez-string');
    }
    else {
        // use web-packed library
        lib = require('../../ez-string');
    }
    render = lib.render;
    require('should');
}

describe('Positional variables tests', function() {

    it('one argument; template consists only of a variable', function(done) {
        let tmpl = '{0}';
        let ctx = ['000'];
        let expected = '000';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; string', function(done) {
        let tmpl = 'triple-zero = {0}';
        let ctx = ['000'];
        let expected = 'triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; string; used in multiple places', function(done) {
        let tmpl = 'triple-zero = {0}; triple-zero = {0}';
        let ctx = ['000'];
        let expected = 'triple-zero = 000; triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('two arguments; strings; used in ascending order', function(done) {
        let tmpl = 'triple-zero = {0}; triple-one = {1}';
        let ctx = ['000', '111'];
        let expected = 'triple-zero = 000; triple-one = 111';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('two arguments; strings; used in descending order', function(done) {
        let tmpl = 'triple-one = {1}; triple-zero = {0}';
        let ctx = ['000', '111'];
        let expected = 'triple-one = 111; triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; octal-looking position', function(done) {
        let tmpl = 'triple-ten = {010}';
        let ctx = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999', '101010'];
        let expected = 'triple-ten = 101010';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; integer', function(done) {
        let tmpl = 'int = {0}';
        let ctx = [15];
        let expected = 'int = 15';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; boolean true', function(done) {
        let tmpl = 'boolean = {0}';
        let ctx = [true];
        let expected = 'boolean = true';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; boolean false', function(done) {
        let tmpl = 'boolean = {0}';
        let ctx = [false];
        let expected = 'boolean = false';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; float', function(done) {
        let tmpl = 'float = {0}';
        let ctx = [-1.25];
        let expected = 'float = -1.25';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; array', function(done) {
        let tmpl = 'array = {0}';
        let ctx = [['a', 'b']];
        let expected = 'array = a,b';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; object', function(done) {
        let tmpl = 'object = {0}';
        let ctx = [{a: 1, b: 2}];
        // rendering of objects by position is practically useless, but should not fail
        let expected = 'object = [object Object]';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; null', function(done) {
        let tmpl = 'null = {0}';
        let ctx = [null];
        let expected = 'null = null';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; undefined', function(done) {
        let tmpl = 'undefined = {0}';
        let ctx = [undefined];
        let expected = 'undefined = undefined';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; position is larger than number of parameters', function(done) {
        let tmpl = 'value at position 1 = {1}';
        let ctx = [1];
        let expected = 'value at position 1 = undefined';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; string; whitespace inside curly braces', function(done) {
        let tmpl = 'triple-zero = {\n\t   0\t\r   }';
        let ctx = ['000'];
        let expected = 'triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ...ctx));

        done();
    });

    it('one argument; negative position', function(done) {
        try {
            let tmpl = 'value = {-1}';
            let ctx = [1];
            render(tmpl, ...ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('Unrecognized text');
            msg.should.containEql('{-1}');
        }

        done();
    });

    it('one argument; float used as position', function(done) {
        try {
            let tmpl = 'value = {1.0}';
            let ctx = [1];
            render(tmpl, ...ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{1.0}');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 9, last_column: 10 }, err.hash.loc);
        }

        done();
    });

    it('one argument; using space between digits', function(done) {
        try {
            let tmpl = 'value = {0 1}';
            let ctx = [1, 2];
            render(tmpl, ...ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{0 1}');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 9, last_column: 10 }, err.hash.loc);
        }

        done();
    });
});