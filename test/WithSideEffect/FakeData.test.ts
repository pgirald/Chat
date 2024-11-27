import * as fs from 'fs';
import { generateData } from '../src/persistence/FakeData';

test('Generate fake data', () => {
  const fd = generateData();
  console.log('----------------------FAKE DATA----------------------');
  fs.writeFileSync('test/fakeData.json', JSON.stringify(fd), { flag: 'w' });
  console.log('-----------------------------------------------------');
});
