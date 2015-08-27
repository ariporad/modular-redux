import 'babel/polyfill';
import 'source-map-support/register';
import proxyquire from 'proxyquire';
import { expect } from 'chai';
import * as realRedux from 'redux';

proxyquire.noPreserveCache();

let combinedReducers = [];
let reducers;

function createStore(reducer) {
  reducers = [reducer];
  return {
    isStore: true,
    replaceReducer: r => {
      if (typeof r !==
          'function') {
        throw new Error('Reducer must be a function');
      }
      reducers.push(r);
    },
  };
}

function populateReducers(redux, num = 3) {
  for (let i = 0; i < num; i++) {
    redux.addReducer(`key${i}`, (state, action) => state);
  }
}

// This has to be done to test if the reducer is changed on storeSet. Otherwise,
// combineReduces is called again, and a new instance is returned, which !==
const combinedReducer = (state, action) => state;

describe('modular-redux', () => {
  describe('reducers', () => {
    let redux;
    beforeEach(() => {
      combinedReducers = [];
      redux = proxyquire('./index', {
        redux: {
          createStore,
          combineReducers: (rs) => {
            combinedReducers.push(rs);
            return combinedReducer;
          },
        },
      });
    });

    it('should automatically create a store', () => {
      expect(redux.getStore().isStore).to.eql(true);
    });

    it('should update the store\'s reducer whenever a reducer is added', () => {
      populateReducers(redux);
      expect(reducers).to.have.lengthOf(4); // Inital reducer is included;
    });

    it('getReducer should return the store\'s (current) reducer', () => {
      expect(redux.getReducer()).to.eql(reducers[0]);
      populateReducers(redux);
      expect(redux.getReducer()).to.equal(reducers.pop());
    });

    it('should combine reducers', () => {
      populateReducers(redux);
      expect(Object.keys(combinedReducers.pop())).to.have.lengthOf(3);
    });

    it('when given a new store, it should set the reducer', () => {
      populateReducers(redux);
      const expectedReducer = reducers.pop();

      redux.setStore(createStore((state, action) => state));

      expect(reducers).to.have.lengthOf(2);
      expect(reducers.pop()).to.eql(expectedReducer);
    });

    it('if given a new store, getStore should return it', () => {
      const store = createStore((state, action) => state);
      redux.setStore(store);
      expect(redux.getStore()).to.eql(store);
    });

    it('should correctly handle object paths', () => {
      const r = (state, action) => state;
      redux.addReducer('obj.paths.are.cool', r);
      const rs = combinedReducers.pop();
      expect(() => rs.obj.paths.are.cool).to.not.throw(); // in case it's
                                                          // undefined
      expect(rs.obj.paths.are.cool).to.eql(r);
    });
  });

  describe('ActionTypes', () => {
    let redux;
    beforeEach(() => {
      redux = proxyquire('./index', {});
    });

    it('.types, .actions, .actionTypes, and, .ActionTypes should all be equal',
       () => {
         expect(redux.ActionTypes).to.eql(redux.types);
         expect(redux.ActionTypes).to.eql(redux.actions);
         expect(redux.ActionTypes).to.eql(redux.actionTypes);
       });

    it('should add a property to .types with key when addActionType is called',
       () => {
         redux.addActionType('ACTION_1', 'ACTION_1');
         expect(redux.types.ACTION_1).to.exist;
       });

    it('the value should default to the key', () => {
      redux.addActionType('ACTION_1');
      expect(redux.types.ACTION_1).to.eql('ACTION_1');
    });

    it('should convert the key to uppercase, and spaces to _s', () => {
      redux.addActionType('action 1');
      expect(redux.types.ACTION_1).to.exist;
      expect(redux.types['action 1']).to.not.exist;
    });

    it('should convert *not* convert the value to uppercase', () => {
      redux.addActionType('action 1');
      expect(redux.types.ACTION_1).to.eql('action 1');
    });

    it('should allow completly diffrent keys and values', () => {
      redux.addActionType('ACTION_1', 'foo');
      expect(redux.types.ACTION_1).to.eql('foo');
    });

    it('only allow strings as keys or values', () => {
      expect(() => redux.addActionType({ 'foo': 'bar' }, 'baz')).to.throw();
      expect(() => redux.addActionType('FOO', 3)).to.throw();
      expect(() => redux.addActionType('foo bar', false)).to.throw();
      expect(() => redux.addActionType('foo bar baz', null)).to.throw();
    });

    it('should export addActionType as .addType and .ActionType', () => {
      expect(redux.addActionType).to.eql(redux.addType);
      expect(redux.addActionType).to.eql(redux.ActionType);
    });
  });

  describe('ActionCreators', () => {
    let redux;
    beforeEach(() => {
      redux = proxyquire('./index', {});
    });

    it('.ActionCreators, .creators and .create should all be the same', () => {
      expect(redux.ActionCreators).to.eql(redux.creators);
      expect(redux.ActionCreators).to.eql(redux.create);
    });

    it('should put the creator on .ActionTypes.<key to camelcase>', () => {
      const creator = () => ({ type: 'something happened', payload: 'OK' });
      redux.addActionType('something happened', 'something happened', creator);
      expect(redux.ActionCreators.somethingHappened).to.exist;
      expect(redux.ActionCreators.somethingHappened).to.eql(creator);
    });

    it('should handle addActionType(key, constructor)', () => {
      const creator = () => ({ type: 'FOO_BAR' });
      redux.addActionType('FOO_BAR', creator);
      expect(redux.ActionTypes.FOO_BAR).to.eql('FOO_BAR');
      expect(redux.ActionCreators.fooBar).to.eql(creator);
    });

    it('should default to a creator that returns { type: type }', () => {
      redux.addActionType('FOO_BAR');
      expect(redux.ActionCreators.fooBar()).to.deep.equal({ type: 'FOO_BAR' });

      redux.addActionType('FOO_BAR_BAZ', 'qux quux');
      expect(redux.ActionCreators.fooBarBaz()).to.deep.equal({ type: 'qux quux' });
    });

    it('each ActionCreator should have a .bound property', () => {
      redux.addActionType('FOO_BAR_BAZ_QUX');
      expect(redux.ActionCreators.fooBarBazQux.bound).to.exist;

      const dispatched = [];

      // We need at least 1 reducer or redux complains
      redux.addReducer('foo', (state = 0, action) => state);

      const store = redux.getStore();
      store.dispatch = action => dispatched.push(action);
      redux.setStore(store);

      redux.ActionCreators.fooBarBazQux.bound();

      expect(dispatched[0]).to.deep.equal({ type: 'FOO_BAR_BAZ_QUX' });
    });
  });

  it('should export all of redux\'s exports', () => {
    const redux = proxyquire('./index', {});

    const filterExports = e => e.filter(k => k.charAt(0) !== '_');

    const realReduxExports = filterExports(Object.keys(realRedux));
    const modularReduxExports = filterExports(Object.keys(redux));

    expect(modularReduxExports).to.include(...realReduxExports);
  });
});
