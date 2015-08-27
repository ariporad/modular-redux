# modular-redux
---
[![npm version](https://badge.fury.io/js/modular-redux.svg)](http://badge.fury.io/js/modular-redux) [![Build Status](https://travis-ci.org/ariporad/modular-redux.svg)](https://travis-ci.org/ariporad/modular-redux) [![Coverage Status](https://coveralls.io/repos/ariporad/modular-redux/badge.svg?branch=master&service=github)](https://coveralls.io/github/ariporad/modular-redux?branch=master) [![Dependency Status](https://david-dm.org/ariporad/modular-redux.svg)](https://david-dm.org/ariporad/modular-redux) [![devDependency Status](https://david-dm.org/ariporad/modular-redux/dev-status.svg)](https://david-dm.org/ariporad/modular-redux#info=devDependencies) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

---

## Why?
I wanted to build an application that was completly modular. Usually, the code for one feature (with React/Redux), is in
a css file (ex. /css/sidebar/myfeature.css), in a test file (ex. /tests/sidebar/myfeature.js), in the HTML
(ex. /partials/sidebar.html), in the file with the actual code (ex. /src/sidebar/myfeature.js), and in the centralized
Redux configuration file (where you setup the action types and the reducer). If you wanted to remove that feature, you
have to remove it from all those places. Chances are you'll forget at least one of them, (or part of the css was in the
wrong place, because that's never happened), and Tada! Technical debt is born! I've mostly gotten around this by using a
few tools: [Browserify](http://browserify.org/) (although I'm considering switching to [Webpack](http://webpack.github.io/)),
[Radium](http://projects.formidablelabs.com/radium/), to put [CSS in JS](http://ariporad.link/cssinjs), and another
project of mine (with a terible name, suggestions welcome): [auto-load-dir](http://ariporad.link/auto-load-dir).
Auto-load-dir let's you pass in a directory, and a handler to be called once with every javascript file in that library.
I've used it to automatically load routes or models or whatever from a folder. And I really wanted to use redux, but
I didn't want to have a global config file. This project actually was just an example that I was writing for an issue I
was planning on filing with redux to ask what the prefered way to do this was, and I just kept on itterating on it till I liked it.

Also, Redux has a _global_ reducer, and virtually requires a global list of action types. Weren't we always told not to
use globals? (This is part of the problem with CSS. If you haven't seen it already, [@vjeux has an amazing presentation on it](http://ariporad.link/cssinjs)).
Modular-redux takes the global out of Redux, allowing you to have good, modular code.

The ultimate goal of this project (and my other ones too), is to allow you to write (at least part of your codebase)
so that if you just remove the single javascript file, the test (which is next to it), and the import statement,
there will be no trace that the file ever existed. No far-flung css, no code in the reducer or action type files, nothing.

---

## Installation

    npm i -S modular-redux

## Usage
modular-redux is a drop in replacement for redux. As a convenience, all redux exports are exported as well.

```javascript
import * as redux from 'modular-redux'; // All redux exports are exported as a convenience.

redux.getStore().disbatch({ type: 'SOMETHING_HAPPENED' }); // modular-redux creates a store by default.

// But you can use your own too
let createStoreWithMiddleware = redux.applyMiddleware(logger, crashReporter)(redux.createStore);
const store = createStoreWithMiddleware(redux.getReducer()); // The reducer will be overwritten anyway
redux.setStore(store);
redux.getStore() === store; // true

// modular-redux keeps track of your action types, to avoid global-ness at all costs.
redux.addType('FOO'); // redux.types.FOO now equals FOO

redux.addType('BAR', 'BAZ') // The value doesn't have to match the key

redux.addType('qux quux', 'garply'); // 'qux quux' will be converted to 'QUX_QUUX'
redux.addType('WALDO', 'fred plugh'); // The value won't be.

// types can be accessed on redux.ActionTypes:
console.log(redux.ActionTypes) // { FOO: 'FOO', BAR:'BAZ', QUX_QUUX: 'garply', 'WALDO': 'fred plugh'}

// They can also be accessed on redux.types, redux.actions and redux.actionTypes:
redux.ActionTypes === redux.types === redux.actions === redux.actionTypes // true

// modular-redux also let's you use action creators, they're available on redux.ActionCreators in camelCase
redux.ActionCreators.foo(); // { type: 'FOO' }
redux.ActionCreators.quxQuux(); // { type: 'garply' }

// They're also available on redux.create and redux.creators:
redux.ActionCreators === redux.create === redux.creators // true

// You can also define your own ActionCreator:
redux.addType('ADD_TODO', (text) => ({ type: redux.ActionTypes.ADD_TODO, text });
redux.create.addTodo('Use modular-redux'); // { type: 'ADD_TODO', text: 'Use modular-redux' }

// For state shape: { foo: [], 'qux': { 'quux': 0 } }

// Add reducers. They're combined with redux.combineReducers.
addReducer('foo', (state = [], action) => {
	switch (action.type) {
	case redux.types.FOO:
		return [...state, action.payload];
		break;
	default:
		return state;
		break;
	}
});

// paths are fine too
addReducer('qux.quux', (state = 0, action) => {
	switch (action.type) {
	case redux.ActionTypes.QUX_QUUX:
		return state + action.payload;
		break;
	default:
		return state;
		break;
	}
});

store.dispatch({ type: actionTypes.FOO, payload: ['bar', 'baz', 'qux'] });
store.getState(); // { foo: ['bar', 'baz', 'qux'], qux: { quux: 0 } }


// someOtherFile.js
// And the best bit is that you can totaly use the actionTypes and the store in other files too!
import { getStore, actionTypes } from 'modular-redux';

const store = getStore();

store.dispatch({ type: actionTypes.QUX_QUUX, payload: 10 });

store.getState(); // { foo: ['bar', 'baz', 'qux'], qux: { quux: 10 } }
```

---

## Contributing

PRs are welcome! Please make sure to write tests and keep the code coverage up.

Build it (run babel):

    npm run build

Clean it:

    npm run clean

Run the tests:

    npm run test

Run code coverage:

    npm run coverage


---

## License

[MIT: http://ariporad.mit-license.org](http://ariporad.mit-license.org) 
