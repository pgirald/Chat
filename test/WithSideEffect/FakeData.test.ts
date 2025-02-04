import * as fs from 'fs';
import { generateData } from '../src/persistence/fakeData/FakeDataGenerator';
import { FAKES_FILE } from '../src/persistence/contants';

test('Generate fake data', () => {
  const fd = generateData();
  console.log('----------------------FAKE DATA----------------------');
  fs.writeFileSync(FAKES_FILE, JSON.stringify(fd), { flag: 'w' });
  console.log('-----------------------------------------------------');
});
