import { describe, expect, it } from '@jest/globals';
import { getKeys } from './ObjectsMeta';

it.each([
  [
    { name: 'Pablo', email: 'p@gmail.com' },
    { name: 'name', email: 'email' },
  ],
  [
    { one: 1, two: 2, three: NaN },
    { one: 'one', two: 'two', three: 'three' },
  ],
])('Test getKeys function', (obj, expected) => {
  const objKeys = getKeys(obj);
  for (const key in expected) {
    expect(objKeys[key] == expected[key]);
  }
});
