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

describe('Plain text tests', function() {

    it('empty string', function(done) {
        let tmpl = '';
        let expected = '';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('single line', function(done) {
        let tmpl = 'abc';
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('multiple lines', function(done) {
        let tmpl = '\n\nabc\ndef\n';
        let expected = '\n\nabc\ndef\n';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('multiple lines; preserves whitespace', function(done) {
        let tmpl = ' \t  \n\r\r\n   ab\t\tc \nd     ef\n';
        let expected = ' \t  \n\r\r\n   ab\t\tc \nd     ef\n';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts rounds braces', function(done) {
        let tmpl = 'abc (def)';
        let expected = 'abc (def)';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts square braces', function(done) {
        let tmpl = 'abc [def]';
        let expected = 'abc [def]';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('interprets double curly braces; open', function(done) {
        let tmpl = 'abc {{ def';
        let expected = 'abc { def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('interprets double curly braces; close', function(done) {
        let tmpl = 'abc def }}';
        let expected = 'abc def }';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('interprets double curly braces; both', function(done) {
        let tmpl = 'abc {{ def }}';
        let expected = 'abc { def }';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts one quote', function(done) {
        let tmpl = 'abc " def';
        let expected = 'abc " def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts two quotes', function(done) {
        let tmpl = 'abc " def"';
        let expected = 'abc " def"';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts backslash', function(done) {
        let tmpl = 'abc \\ def';
        let expected = 'abc \\ def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts double backslash', function(done) {
        let tmpl = 'abc \\\\ def';
        let expected = 'abc \\\\ def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts backslash and a character', function(done) {
        let tmpl = 'abc \\a def';
        let expected = 'abc \\a def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('accepts backslash and quote', function(done) {
        let tmpl = 'abc \\" def';
        let expected = 'abc \\" def';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('variable-like pattern', function(done) {
        let tmpl = 'var1.field.arr[0].field2["field3"]';
        let expected = 'var1.field.arr[0].field2["field3"]';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('unicode left-to-right', function(done) {
        let tmpl = 'Переменная, 变量, パラム, 변수, कपरिवर्तनी_यी, Ⅳ, my‿var⁀';
        let expected = 'Переменная, 变量, パラム, 변수, कपरिवर्तनी_यी, Ⅳ, my‿var⁀';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('unicode right-to-left', function(done) {
        let tmpl = 'متغير משתנה';
        let expected = 'متغير משתנה';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('unicode; bidirectional', function(done) {
        let tmpl = 'variable متغير משתנה  text 123 ١٢٣';
        let expected = 'variable متغير משתנה  text 123 ١٢٣';
        should.strictEqual(expected, render(tmpl));

        done();
    });

    it('unicode astral codepoints', function(done) {
        let tmpl = '💪 test 💰';
        let expected = '💪 test 💰';
        should.strictEqual(expected, render(tmpl));

        done();
    });

});
