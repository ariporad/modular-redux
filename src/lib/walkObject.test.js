/**
 * Created by Ari on 8/27/15.
 */
import walkObject from './walkObject.js';
import { expect } from 'chai';

describe('walkObject', () => {
  it('should walk the object recursively', () => {
    const obj = {
      propA: 1,
      propB: 'thing',
      propC: ['a', 'b', 'c'],
      propD: {
        thingA: 'pizza',
        thingB: {
          pasta: true,
        },
        thingC: ['x', 'y', 'z'],
        thingD: false,
      },
    };
    const expectedItems = [1,
                           'thing',
                           'a',
                           'b',
                           'c',
                           'pizza',
                           true,
                           'x',
                           'y',
                           'z',
                           false];
    const actualItems = [];

    const handler = (thing) => {
      actualItems.push(thing);
      return thing;
    };

    walkObject(obj, handler);
    expect(actualItems).to.deep.equal(expectedItems);
  });
});
