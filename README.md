# ez-string
A string template renderer for JavaScript without memory leaks. It supports referencing variables by position, by name. One can access properties and array elements.

## Example

```js
const render = require('ez-string');
let book;

// Format using variable's position
book = render('One of my favorite books is "{0}" by {1}.', 'The Name of the Wind', 'Patrick Rothfuss');
// book = 'One of my favorite books is "The Name of the Wind" by Patrick Rothfuss.'

// Format using variable's name
// Variable names must use A-Za-z0-9$_
book = render('One of my favorite books is "{title}" by {author}.',
    { title: 'The Name of the Wind', author: 'Patrick Rothfuss'});
// book = 'One of my favorite books is "The Name of the Wind" by Patrick Rothfuss.'

// Curly braces are escaped by using double braces
let example;
example = render('{{title}}');
// example = '{title}'

// One can use array indices
book = render('"{arr[0]}" was first published in {arr[1]}.',
    { arr: ['The Hobbit', 1937]});
// book = '"The Hobbit" was first published in 1937.'

// One can use object properties.
// Properties with names consisting of A-Za-z0-9$_ can be accessed using property notation
// Properties with other names can be accessed using index notation
book = render('"{book.title}" was written by {book.author["first name"]} {book.author["last name"]}. It was published in {book.year}.', { 
        book: {
            title: 'Marina',
            year : 1999,
            author: {
                'first name': 'Carlos',
                'last name': 'Zafon'
            }
        }
    });
// book = '"Marina" was written by Carlos Zafon. It was published in 1999.'

// If a property name contains a quote character or backslash, they need to be escaped.
// Quotes are prepended by a backslash
// Backslashes need to be doubled
example = render('{data["\\\\"]}', {
    data: {'\\': 'backslash'}
});
// example = 'backslash'
example = render('{data["\\""]}', {
    data: {'"': 'quote'}
});
// example = 'quote'
```

## Installation

Using NodeJS:
```shell
$ npm i --save ez-string
```

```js
const render = require('ez-string');
let book;

// Format using variable's position
book = render('One of the best books by {author} is "{title}".', {
    author: 'Stephen King',
    title: '11/22/63'
});
// book = 'One of the best books by Stephen King is "11/22/63".'
```

In a browser:
```html
<!-- Load library which is UMD packed -->
<script src="ez-string.js"></script>

<script>
    const render = require('ez-string');
    let book;

    // Format using variable's position
    book = render('One of the best books by {author} is "{title}".', {
        author: 'Stephen King',
        title: '11/22/63'
    });
    // book = 'One of the best books by Stephen King is "11/22/63".'
</script>
```

## Why ez-string
 
The most important reason is that this library doesn't leak memory.

 Many of the existing template renderers perform a two-step process. They compile a string template into a JavaScript function and then execute it while passing context data. However, most users of such libraries rarely cache the resulting compiled function. Instead they may compile the same template again and again. Due to inticacies of NodeJS memory garbage collection. Such pattern usually results in a memory leak, as described by [Meteor developers.](https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156)

Library documentation is [here.](https://kirusi.github.io/ez-string/docs/index.html)
