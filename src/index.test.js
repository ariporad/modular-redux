import 'babel/polyfill';
import 'source-map-support/register';
import proxyquire from 'proxyquire';
import { expect } from 'chai';

proxyquire.noPreserveCache();

let combinedReducers = [];
let reducers;

function createStore(reducer) {
  reducers = [reducer];
  return {
    isStore: true,
    replaceReducer: r => {
      if (typeof r !== 'function') throw new Error('Reducer must be a function');
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
  });

  describe('action types', () => {
    let redux;
    beforeEach(() => {
      redux = proxyquire('./index', {});
    });

    it('.types, .actionTypes, and .actions should all be equal', () => {
      expect(redux.types).to.eql(redux.actionTypes);
      expect(redux.types).to.eql(redux.actions);
    });

    it('should add a property to .types with key when addType is called', () => {
      redux.addType('ACTION_1', 'ACTION_1');
      expect(redux.types.ACTION_1).to.exist;
    });

    it('the value should default to the key', () => {
      redux.addType('ACTION_1');
      expect(redux.types.ACTION_1).to.eql('ACTION_1');
    });

    it('should convert the key to uppercase, and spaces to _s', () => {
      redux.addType('action 1');
      expect(redux.types.ACTION_1).to.exist;
      expect(redux.types['action 1']).to.not.exist;
    });

    it('should convert *not* convert the value to uppercase', () => {
      redux.addType('action 1');
      expect(redux.types.ACTION_1).to.eql('action 1');
    });

    it('should allow completly diffrent keys and values', () => {
      redux.addType('ACTION_1', 'foo');
      expect(redux.types.ACTION_1).to.eql('foo');
    });

    it('only allow strings as keys or values', () => {
      expect(() => redux.addType({ 'foo': 'bar'}, 'baz')).to.throw();
      expect(() => redux.addType('FOO', 3)).to.throw();
      expect(() => redux.addType('foo bar', false)).to.throw();
      expect(() => redux.addType('foo bar baz', null)).to.throw();
    });
  });
});
