import 'babel/polyfill';
import { combineReducers, createStore } from 'redux';
import { set } from 'object-path';

let store;
let reducer = (state, action) => state;

const reducers = {};
const ActionTypes = {};

export { ActionTypes, ActionTypes as actions, ActionTypes as actionTypes, ActionTypes as types };

export function getReducer() {
  return reducer;
}

function updateReducer() {
  reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
}

export function getStore() {
  return store;
}

export function setStore(newStore) {
  store = newStore;
  updateReducer();
  return newStore;
}

export function addReducer(key, newReducer) {
  set(reducers, key, newReducer);
  updateReducer();
}

export function addType(key, value = key) {
  if (typeof key !== 'string') throw new Error('key must be a string');
  if (typeof value !== 'string') throw new Error('value must be a string');
  const cleanKey = key.toUpperCase().replace(' ', '_');
  if (ActionTypes[cleanKey]) return ActionTypes[cleanKey];
  ActionTypes[cleanKey] = value;
  return value;
}

store = createStore(getReducer());
