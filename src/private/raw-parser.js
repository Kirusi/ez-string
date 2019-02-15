'use strict';
const fs = require('fs');
const Parser = require('jison').Parser;

let grammar = {
    'lex': {
        'startConditions': {'expr': 1, 'string': 2},
        'macros': {
            'esc': '\\\\',
            'int': '[0-9]+',
        },
        // === LEXER RULES ===
        'rules': [
            // PLAIN TEXT RULES

            /* Anything but curly braces is accepted as is.
               Parentheses need special handling starting with Node 10*/
            [['INITIAL'], '(?:[^\\{\\}]|\\n|[\\(\\)])+', 'return \'TEXT\';'],
            // double quotes are converted into single quotes
            [['INITIAL'], '{{', 'yytext=\'\\{\'; return \'TEXT\';'],
            [['INITIAL'], '}}', 'yytext=\'\\}\'; return \'TEXT\';'],

            // EXPRESSION RULES

            // opening curly brace: switch to expression parsing mode
            [['INITIAL'], '\\{', 'this.begin(\'expr\'); return \'{\';'],
            // closing curly brace: expression is complete. Switch back to plain text mode
            [['expr'], '\\}', 'this.popState(); return \'}\';'],

            // whitespace inside curlies is ignored
            [['expr'], '\\s+', '/* skip whitespace */'],
            [['expr'], '{int}', 'return \'NUMBER\';'],
            /* Proper regex for JavaScript identifiers requires unicode support in the regex engine
               node.js currently doesn't support it
               /^[\\$\\_\\p{L}\\p{Nl}][\\$\\_\\p{L}\\p{Nl}\\p{Mn}\\p{Mc}\\p{Nd}\\p{Pc}]*$/
               Until such support is implemented the parser recognizes field identifiers that contain:
               dollar-sign, underscore, latin characters and digits
            */
            [['expr'], '[\\$\\_A-Za-z][\\$\\_A-Za-z0-9]*', 'return \'ID\';'],
            // period: must be followed by a field name
            [['expr'], '\\.', 'return \'.\';'],
            // brackets: envelope an index or a field name
            [['expr'], '\\[', 'return \'\\[\';'],
            [['expr'], '\\]', 'return \'\\]\';'],

            // IRREGULAR IDENTIFIER RULES

            /* opening quote: we expect an irregular field name to be enveloped in quotes.
               Switch to irregular identifier parsing mode */
            [['expr'], '\\"', 'this.begin(\'string\'); return \'QUOTE\';'],
            // closing quote: switch back to expression parsing mode
            [['string'], '\\"', 'this.popState(); return \'QUOTE\';'],
            /* anything but backslashes and quotes is allowed and accepted as is.
               Parentheses need special handling starting with Node 10*/
            [['string'], '(:?[^"{esc}]|[\\(\\)])+', 'return \'STRING\';'],
            // double escape: is converted to a single escape
            [['string'], '{esc}{esc}', 'yytext = \'\\\\\'; return \'STRING\';'],
            // <escape> + <quote> is converted into a quote character
            [['string'], '{esc}"', 'yytext = \'"\'; return \'STRING\';'],
            // <escape> + <char> is accepted as is
            [['string'], '{esc}.', 'return \'STRING\';'],

            // End of parsed text
            ['$', 'return \'EOF\';']
        ]
    },

    // === PARSER RULES ===
    'bnf': {
        'contents': [
            [ 'content EOF', '{ return $1; }' ],
            [ 'EOF', '{ return ""; }' ],
        ],
        'content': [
            // template starts with text
            ['TEXT', '{ $$ = $1; }'],
            // template starts with a variable value
            ['{ value }', '{ $$ = $2; }'],
            // append text to a template
            ['content TEXT', '{ $$ = $1 + $2; }'],
            // append variable value to a template
            ['content { value }', '{ $$ = $1 + $3; }'],
        ],
        'value': [
            // positional parameter
            [ 'NUMBER', '{ let argPos = parseInt($1, 10); $$=yy.ctx[argPos]; }' ],
            // parameter is specified by name with possible fields and indices
            [ 'expr', '{ $$=yy.stack; yy.stack=undefined; }' ],
        ],
        'expr': [
            // variable name
            ['ID', '{ yy.stack=yy.ctx[0][$1]; }'],
            // array index
            ['expr [ NUMBER ]', '{ let argPos = parseInt($3, 10); yy.stack=yy.stack[argPos]; }'],
            // object field
            ['expr . ID', '{ yy.stack=yy.stack[$3]; }'],
            // irregular field name enclosed in quotes
            ['expr [ QUOTE identifier QUOTE ]', '{ yy.stack=yy.stack[$4]; }'],
            ['expr [ QUOTE QUOTE ]', '{ yy.stack=yy.stack[""]; }'] //empty identifier
        ],
        'identifier': [
            // concatenate identifier consisting of multiple parts, such as escaped quotes
            ['STRING', '{ $$ = $1; }'],
            ['identifier STRING', '{ $$ = $1 + $2; }'],
        ]
    }
};

/* using a global parser instance
   Instantiation of parser is quite heavy and requires a significant amount of RAM
   This is very different for generated parser code. */
let parser = new Parser(grammar);

/**
 * Parser class uses the grammar defintion above.
 * It can be used for testing, but one must use the generated parser code for production purposes
 */
class RawParser {
    /**
     * Render template using Parser library
     * @param {*} template - string with positional or named parameters enclosed in curly braces
     * @param  {...any} args - either multiple values when using positional parameters,
     *                         or a single objects with names of the fields corresponding to the names used in the template
     */
    static render(template, ...args) {
        parser.yy.ctx = args;
        let result = parser.parse(template);
        return result;
    }

    /**
     * Generate source code for a standalone parser
     */
    /* istanbul ignore next */
    static generateCode() {
        let parserSource = parser.generate();
        return parserSource;
    }
}

module.exports = RawParser;