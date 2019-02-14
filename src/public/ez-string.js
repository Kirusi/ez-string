'use strict';

const GeneratedParser = require('../../generated/generated-parser');

/**
 * Renders a template by substituting variable placeholders with provided data.
 *
 * @param {string} template - string with positional or named parameters enclosed in curly braces
 * @param  {...any} args - either multiple values when using positional parameters,
 *                         or a single objects with names of the fields corresponding to the names used in the template
 * @returns {string} - template string with interpolated variables
 *
 * @example
 * const render = require('ez-string');
 * let book;
 *
 * // Format using variable's position
 * book = render('One of my favorite books is "{0}" by {1}.', 'The Name of the Wind', 'Patrick Rothfuss');
 * // book = 'One of my favorite books is "The Name of the Wind" by Patrick Rothfuss.'
 *
 * // Format using variable's name
 * // Variable names must use A-Za-z0-9$_
 * book = render('One of my favorite books is "{title}" by {author}.',
 *      { title: 'The Name of the Wind', author: 'Patrick Rothfuss'});
 * // book = 'One of my favorite books is "The Name of the Wind" by Patrick Rothfuss.'
 *
 * // Curly braces are escaped by using double braces
 * let example;
 * example = render('{{title}}');
 * // example = '{title}'
 *
 * // One can use array indices
 * book = render('"{arr[0]}" was first published in {arr[1]}.',
 *      { arr: ['The Hobbit', 1937]});
 * // book = '"The Hobbit" was first published in 1937.'
 *
 * // One can use object properties.
 * // Properties with names consisting of A-Za-z0-9$_ can be accessed using property notation
 * // Properties with other names can be accessed using index notation
 * book = render('"{book.title}" was written by {book.author["first name"]} {book.author["last name"]}. It was published in {book.year}.', {
 *          book: {
 *              title: 'Marina',
 *              year : 1999,
 *              author: {
 *                  'first name': 'Carlos',
 *                  'last name': 'Zafon'
 *              }
 *          }
 *      });
 *  // book = '"Marina" was written by Carlos Zafon. It was published in 1999.'
 *
 * // If a property name contains a quote character or backslash, they need to be escaped.
 * // Quotes are prepended by a backslash
 * // Backslashes need to be doubled
 * example = render('{data["\\\\"]}', {
 *      data: {'\\': 'backslash'}
 * });
 * // example = 'backslash'
 * example = render('{data["\\""]}', {
 *      data: {'"': 'quote'}
 * });
 * // example = 'quote'
 */
function render(template, ...args) {
    /* Parser object is not re-entrant.
       Instantiation of generated parser is light and fast. Create a new instance for every call. */
    const parser = new GeneratedParser.Parser();
    parser.yy.ctx = args;
    let result = parser.parse(template);
    return result;
}

module.exports = {
    render
};
