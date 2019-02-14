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

describe('Named scalar variables tests', function() {

    it('one argument; template consists only of a variable', function(done) {
        let tmpl = '{a}';
        let ctx = {a: 'aaa'};
        let expected = 'aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string', function(done) {
        let tmpl = 'a = {a}';
        let ctx = {a: 'aaa'};
        let expected = 'a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; strings', function(done) {
        let tmpl = 'b = {b}; a = {a}';
        let ctx = {a: 'aaa', b: 'bbb'};
        let expected = 'b = bbb; a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with underscore', function(done) {
        let tmpl = 'value = {_1a}';
        let ctx = {_1a: '111'};
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with dollar sign', function(done) {
        let tmpl = 'value = {$1a}';
        let ctx = {$1a: '111'};
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with dollar sign which look like jison internal variables', function(done) {
        let tmpl = 'value1 = {$1}; value2 = {$2}; value$ = {$$}';
        let ctx = {$1: '111', $2: '222', $$: '333'};
        let expected = 'value1 = 111; value2 = 222; value$ = 333';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with uppercase letter', function(done) {
        let tmpl = 'value = {A1a}';
        let ctx = {A1a: '111'};
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    // eslint-disable-next-line max-len
    it('one argument; name contains underscore, dollar sign, number, uppercase and lowercase characters in second and latter positions', function(done) {
        let tmpl = 'value = {a_$1aA}';
        let ctx = {a_$1aA: '111'};
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; whitespace inside curly braces', function(done) {
        let tmpl = 'a = {  \t\ra\n  \t}';
        let ctx = {a: 'aaa'};
        let expected = 'a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; with adjacent escaped opening curly brace', function(done) {
        let tmpl = 'a = {{{a}';
        let ctx = {a: 'aaa'};
        let expected = 'a = {aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; with adjacent escaped closing curly brace', function(done) {
        let tmpl = 'a = {a}}}';
        let ctx = {a: 'aaa'};
        let expected = 'a = aaa}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name contains an invalid character', function(done) {
        let tmpl = 'value = {a-A}';
        let ctx = {'a-A': '111'};
        try {
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('Unrecognized text');
            msg.should.containEql('{a-A}');
        }

        done();
    });

    it('one argument; name contains an escaped curly brace', function(done) {
        let tmpl = 'value = {a\\}A}';
        let ctx = {'a-A': '111'};
        try {
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('Unrecognized text');
            msg.should.containEql('{a\\}A}');
        }

        done();
    });

    it('one argument; missing closing curly brace', function(done) {
        try {
            let tmpl = 'value = {a';
            let ctx = {a: 'a1'};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a');
            msg.should.containEql('Expecting \'}\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 9, last_column: 10 }, err.hash.loc);
        }

        done();
    });
});

describe('Named variables with indices', function() {

    it('three arguments; specified by array indices', function(done) {
        let tmpl = 'a0 = {a[0]}; a1 = {a[1]}; b0 = {b[0]}';
        let ctx = {a: ['a00', 'a11'], b: ['b00']};
        let expected = 'a0 = a00; a1 = a11; b0 = b00';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; nested arrays; 2 and 3 nesting levels', function(done) {
        let tmpl = 'a_1_0 = {a[1][0]}; b_0_1_2 = {b[0][1][2]}';
        let ctx = {
            a: [
                [1, 2],
                [3, 4]
            ],
            b: [
                [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                [[11, 12, 13], [14, 15, 16], [17, 18, 19]],
                [[21, 22, 23], [24, 25, 26], [27, 28, 29]]
            ]
        };
        let expected = 'a_1_0 = 3; b_0_1_2 = 6';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; octal-looking position', function(done) {
        let tmpl = 'a[010] = {a[010]}';
        let ctx = {
            a: ['a0_', 'a1_', 'a2_', 'a3_', 'a4_', 'a5_', 'a6_', 'a7_', 'a8_', 'a9_', 'a10_']
        };
        let expected = 'a[010] = a10_';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; negative index', function(done) {
        try {
            let tmpl = 'value = {a[-1]}';
            let ctx = {a: ['a00', 'a11'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('Unrecognized text');
            msg.should.containEql('{a[-1]}');
        }

        done();
    });

    it('one argument; index is a float number', function(done) {
        try {
            let tmpl = 'value = {a[2.0]}';
            let ctx = {a: ['a00', 'a11', 'a12'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a[2.0]}');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 11, last_column: 12 }, err.hash.loc);
        }

        done();
    });

    it('one argument; index contains a space between digits', function(done) {
        try {
            let tmpl = 'value = {a[0 1]}';
            let ctx = {a: ['a00', 'a11', 'a12'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a[0 1]}');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 11, last_column: 12 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing closing bracket', function(done) {
        try {
            let tmpl = 'value = {a[0}';
            let ctx = {a: ['a00', 'a11', 'a12'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a[0}');
            msg.should.containEql('Expecting \']\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 11, last_column: 12 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing closing curly brace', function(done) {
        try {
            let tmpl = 'value = {a[0]';
            let ctx = {a: ['a00', 'a11', 'a12'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a[0]');
            msg.should.containEql('Expecting \'}\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 12, last_column: 13 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing opening curly brace', function(done) {
        try {
            let tmpl = 'value = a[0]}';
            let ctx = {a: ['a00', 'a11', 'a12'], b: ['b00']};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('a[0]}');
        }

        done();
    });
});

describe('Named variables with fields', function() {
    it('three arguments; specified by field name', function(done) {
        let tmpl = 'ac = {a.c}; ad = {a.d}; be = {b.e}';
        let ctx = {
            a: {c: 'ac1', d: 'ad2'},
            b: {e: 'be3', f: 'bf4'}
        };
        let expected = 'ac = ac1; ad = ad2; be = be3';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; specified by field name; field name begins with undesrcore', function(done) {
        let tmpl = 'a._ = {a._}';
        let ctx = {
            a: {_: '18'}
        };
        let expected = 'a._ = 18';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; specified by field name; field name begins with dollar sign', function(done) {
        let tmpl = 'a.$ = {a.$}';
        let ctx = {
            a: {$: '18'}
        };
        let expected = 'a.$ = 18';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; specified by field name; field name begins with uppercase letter', function(done) {
        let tmpl = 'a.Za = {a.Za}';
        let ctx = {
            a: {Za: '18'}
        };
        let expected = 'a.Za = 18';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    // eslint-disable-next-line max-len
    it('one argument; specified by field name; field name contains underscore, dollar sign, number, uppercase and lowercase characters in second and latter positions', function(done) {
        let tmpl = 'a.a_$1aA = {a.a_$1aA}';
        let ctx = {
            a: {a_$1aA: '23'}
        };
        let expected = 'a.a_$1aA = 23';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; nested objects; 2 and 3 levels', function(done) {
        let tmpl = 'ace = {a.c.e}; bfjk = {b.f.j.k}';
        let ctx = {
            a: {
                c: {d: 'acd1', e: 'ace2'}
            },
            b: {
                f: {
                    g: {h: 'bfgh3', i: 'bfgi4'},
                    j: {k: 'bfjk5', l: 'bfjl6'}
                }
            }
        };
        let expected = 'ace = ace2; bfjk = bfjk5';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; field name contains an invalid character', function(done) {
        let tmpl = 'value = {a.b#c}';
        let ctx = {a: {'a.b#c': '111'}};
        try {
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('Unrecognized text');
            msg.should.containEql('{a.b#c}');
        }

        done();
    });

    it('one argument; missing closing curly brace', function(done) {
        try {
            let tmpl = 'value = {a.b';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a.b');
            msg.should.containEql('Expecting \'}\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 11, last_column: 12 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing opening curly brace', function(done) {
        try {
            let tmpl = 'value = a.b}';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Lexical error');
            msg.should.containEql('a.b}');
        }

        done();
    });
});

describe('Named variables using quoted field names', function() {

    it('three arguments; specified by field name', function(done) {
        let tmpl = 'ac = {a["c"]}; ad = {a["d"]}; be = {b["e"]}';
        let ctx = {
            a: {c: 'ac1', d: 'ad2'},
            b: {e: 'be3', f: 'bf4'}
        };
        let expected = 'ac = ac1; ad = ad2; be = be3';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('three arguments; using characters disallowed in plain field names', function(done) {
        let tmpl = 'ac = {a["#c"]}; ad = {a["d!"]}; be = {b["-e"]}';
        let ctx = {
            a: {'#c': 'ac1', 'd!': 'ad2'},
            b: {'-e': 'be3', 'f+': 'bf4'}
        };
        let expected = 'ac = ac1; ad = ad2; be = be3';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; using digits in field names', function(done) {
        let tmpl = 'a["1"] = {a["1"]}; a["010"] = {a["010"]}';
        let ctx = {
            a: {'1': '11', '010': '1010'},
        };
        let expected = 'a["1"] = 11; a["010"] = 1010';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('three arguments; using square brackets in field names', function(done) {
        let tmpl = 'a["["] = {a["["]}; a["]"] = {a["]"]}; a["[ ]"] = {a["[ ]"]}';
        let ctx = {
            a: {'[': 11, ']': 22, '[ ]': 33},
        };
        let expected = 'a["["] = 11; a["]"] = 22; a["[ ]"] = 33';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('three arguments; using parentheses in field names', function(done) {
        let tmpl = 'a["("] = {a["("]}; a[")"] = {a[")"]}; a["( )"] = {a["( )"]}';
        let ctx = {
            a: {'(': 11, ')': 22, '( )': 33},
        };
        let expected = 'a["("] = 11; a[")"] = 22; a["( )"] = 33';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('three arguments; using curly braces in field names', function(done) {
        // Curly braces in text portion of the template are escaped by doubling
        let tmpl = 'a["{{"] = {a["{"]}; a["}}"] = {a["}"]}; a["{{ }}"] = {a["{ }"]}';
        let ctx = {
            a: {'{': 11, '}': 22, '{ }': 33},
        };
        let expected = 'a["{"] = 11; a["}"] = 22; a["{ }"] = 33';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; using quotes in field names', function(done) {
        let tmpl = 'a["""] = {a["\\""]}';
        let ctx = {
            a: {'"': 11},
        };
        let expected = 'a["""] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; using a backslash in field name', function(done) {
        // 4 bakslashes are converted into 2 by JavaScript. 2 backslahes are converted into one by template engine
        let tmpl = 'a["\\"] = {a["\\\\"]}';
        let ctx = {
            a: {'\\': 11, '\\\\': 12},
        };
        let expected = 'a["\\"] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; using two backslashes in field name', function(done) {
        // 8 bakslashes are converted into 4 by JavaScript. 4 backslahes are converted into two by template engine
        let tmpl = 'a["\\\\"] = {a["\\\\\\\\"]}';
        let ctx = {
            a: {'\\': 11, '\\\\': 12},
        };
        let expected = 'a["\\\\"] = 12';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; backslash followed by a character', function(done) {
        let tmpl = 'a["\\a"] = {a["\\\\a"]}';
        let ctx = {
            a: {'\\a': 11},
        };
        let expected = 'a["\\a"] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; backslash followed by a character is not mistaken for a special notation', function(done) {
        let tmpl = 'a["\\n"] = {a["\\\\n"]}';
        let ctx = {
            a: {'\\n': 11, '\n': 12},
        };
        let expected = 'a["\\n"] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; backslash followed by period', function(done) {
        let tmpl = 'a["\\."] = {a["\\\\."]}';
        let ctx = {
            a: {'\\.': 11},
        };
        let expected = 'a["\\."] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; field name contains escpaed quote', function(done) {
        let tmpl = 'a["a""] = {a["a\\""]}; a["a"""] = {a["a\\"\\""]}';
        let ctx = {
            a: {'a"': 11, 'a""': 12},
        };
        let expected = 'a["a""] = 11; a["a"""] = 12';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; field name contains period', function(done) {
        let tmpl = 'a["a.b"] = {a["a.b"]}';
        let ctx = {
            a: {'a.b': 11, b: 12},
        };
        let expected = 'a["a.b"] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; field name contains whitespace', function(done) {
        let tmpl = 'a["  \t\r\t  \n"] = {a["  \t\r\t  \n"]}';
        let ctx = {
            a: {'  \t\r\t  \n': 11},
        };
        let expected = 'a["  \t\r\t  \n"] = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; unicode; left-to-right', function(done) {
        let tmpl = 'value = {a["Переменная, 变量, パラム, 변수, कपरिवर्तनी_यी, Ⅳ, my‿var⁀"]}';
        let ctx = {
            a: {'Переменная, 变量, パラム, 변수, कपरिवर्तनी_यी, Ⅳ, my‿var⁀': 11},
        };
        let expected = 'value = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; unicode; right-to-left', function(done) {
        let tmpl = 'value = {a["متغير משתנה"]}';
        let ctx = {
            a: {'متغير משתנה': 11},
        };
        let expected = 'value = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; unicode; bidirectional', function(done) {
        let tmpl = 'value = {a["variable متغير משתנה  text 123 ١٢٣"]}';
        let ctx = {
            a: {'variable متغير משתנה  text 123 ١٢٣': 11},
        };
        let expected = 'value = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; unicode; astral codepoints', function(done) {
        let tmpl = 'value = {a["💪 test 💰"]}';
        let ctx = {
            a: {'💪 test 💰': 11},
        };
        let expected = 'value = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; empty string', function(done) {
        let tmpl = 'value = {a[""]}';
        let ctx = {
            a: {'': 11},
        };
        let expected = 'value = 11';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; missing closing curly brace', function(done) {
        try {
            let tmpl = 'value = {a["b"]';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a["b"');
            msg.should.containEql('Expecting \'}\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 14, last_column: 15 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing closing bracket', function(done) {
        try {
            let tmpl = 'value = {a["b"}';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a["b"}');
            msg.should.containEql('Expecting \']\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 13, last_column: 14 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing closing bracket and closing curly brace', function(done) {
        try {
            let tmpl = 'value = {a["b"';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a["b"');
            msg.should.containEql('Expecting \']\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 13, last_column: 14 }, err.hash.loc);
        }

        done();
    });

    it('one argument; missing closing quote', function(done) {
        try {
            let tmpl = 'value = {a["b]}';
            let ctx = {a: {b: 'b00'}};
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a["b]}');
            msg.should.containEql('Expecting \'QUOTE\'');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 12, last_column: 15 }, err.hash.loc);
        }

        done();
    });
});

describe('Named variables mixing fields and indices', function() {
    it('one argument mixing fields and indicies', function(done) {
        let tmpl = 'a[1].f.g[2] = {a[1].f.g[2]}';
        let ctx = {
            a: [
                {c: 'a0c1', d: 'a0d2'},
                {e: 'a0e3', f: {
                    g: [10, 11, 12]}
                },
            ]
        };
        let expected = 'a[1].f.g[2] = 12';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument mixing fields and indicies with whitespace inside curly braces', function(done) {
        let tmpl = 'a[1].f.g[2] = { a[\t1]\r.\nf   . g [\t\t2 ]\n}';
        let ctx = {
            a: [
                {c: 'a0c1', d: 'a0d2'},
                {e: 'a0e3', f: {
                    g: [10, 11, 12]}
                },
            ]
        };
        let expected = 'a[1].f.g[2] = 12';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one arguments mixing fields and indicies', function(done) {
        let tmpl = 'a[1].f.g[2][" a "] = {a[1].f.g[2][" a "]}';
        let ctx = {
            a: [
                {c: 'a0c1', d: 'a0d2'},
                {e: 'a0e3', f: {
                    g: [
                        10, 11, {
                            ' a ': 'A with spaces'
                        }
                    ]}
                },
            ]
        };
        let expected = 'a[1].f.g[2][" a "] = A with spaces';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one arguments mixing fields and indicies with whitespace inside curly braces', function(done) {
        let tmpl = 'a[1].f.g[2][" a "] = { a[\t1]\r.\nf   . g [\t\t2 ]\n[" a "\t]\r}';
        let ctx = {
            a: [
                {c: 'a0c1', d: 'a0d2'},
                {e: 'a0e3', f: {
                    g: [
                        10, 11, {
                            ' a ': 'A with spaces'
                        }
                    ]}
                },
            ]
        };
        let expected = 'a[1].f.g[2][" a "] = A with spaces';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });
});