// reducers.js
import { combineReducers, createStore } from 'redux';

let store;
let reducer = (state, action) => state

const reducers = {};
export const types = {};

export function getReducer() {
	return reducer;
}

export function getStore() {
	return store;
}

export function setStore(newStore) {
	store = newStore;
	updateReducer();
	return newStore;
}

function updateReducer() {
	store.replaceReducer(combineReducers(reducers));
}

export function addReducer(key, reducer) {
	reducers[key] = reducer;
	updateReducer();
}

export function addType(key, value = key) {
	key = key.toUpperCase().replace(' ', '_');
	if (types[key]) return types[key];
	types[key] = value;
	return value;
}

store = setStore(createStore(getReducer()));



// index.js
import { addReducer, getStore } from './lib/reducers.js';

// ...

const store = getStore();

// ...


// SomeComponent.js
import React from 'react';
import { connect } from 'react-redux';

import { addReducer, addType, types } from '../reducers.js';

// ...
addType('SOMETHING_HAPPENED');
addReducer('something', (state, action) => {
	switch (action.type) {
	case types.SOMETHING_HAPPENED:
		return { ...state, action.payload.foo };
		break;
	default: 
		return state;
		break;
	}
})

// ...


