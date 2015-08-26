import 'babel/polyfill';
import { combineReducers, createStore } from 'redux';

let store;
let reducer = (state, action) => state;

const reducers = {};
export const types = {};

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
  reducers[key] = newReducer;
  updateReducer();
}

export function addType(key, value = key) {
  cleanKey = key.toUpperCase().replace(' ', '_');
  if (types[cleanKey]) return types[cleanKey];
  types[cleanKey] = value;
  return value;
}

store = createStore(getReducer());
