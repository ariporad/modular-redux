import 'babel/polyfill';
import { combineReducers, createStore, bindActionCreators } from 'redux';
import { set as setObj } from 'object-path';
import camelCase from 'lodash.camelcase';
import walkObject from './lib/walkObject.js';

let store;
let reducer = (state, action) => state;

const reducers = {};
const ActionTypes = {};
const ActionCreators = {};

export { ActionTypes, ActionTypes as actions, ActionTypes as actionTypes, ActionTypes as types };
export { ActionCreators, ActionCreators as creators, ActionCreators as create };

export function getReducer() {
  return reducer;
}

function updateReducer() {
  reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
}

function updateActionCreator(ActionCreator) {
  if (typeof ActionCreator !== 'function') return ActionCreator;
  if (!store.dispatch) return ActionCreator;

  ActionCreator.bound = bindActionCreators(ActionCreator, store.dispatch);
  return ActionCreator;
}

function updateActionCreators() {
  walkObject(ActionCreators, updateActionCreator);
}

export function getStore() {
  return store;
}

export function setStore(newStore) {
  store = newStore;
  updateReducer();
  updateActionCreators();
  return newStore;
}

export function addReducer(key, newReducer) {
  setObj(reducers, key, newReducer);
  updateReducer();
}

function addActionType(key, value = key, creator = () => ({ type: value })) {
  let create;
  let val;
  if (typeof key !== 'string') throw new Error('Key must be a string.');
  if (typeof value === 'function') {
    create = value;
    val = key;
  } else {
    val = value;
    create = creator;
  }
  if (typeof val !== 'string') throw new Error('Value must be a string.');
  const createKey = camelCase(key);
  const constKey = key.toUpperCase().replace(' ', '_');

  if (ActionCreators[createKey]) return ActionCreators[createKey];

  create.bound = updateActionCreator(create);

  ActionTypes[constKey] = val;
  ActionCreators[createKey] = create;

  return create;
}
export { addActionType, addActionType as addType, addActionType as ActionType };

store = createStore(getReducer());

export * from 'redux';
