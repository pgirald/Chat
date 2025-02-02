import { faker } from '@faker-js/faker';
import { range } from 'js_utils';
import * as fs from 'fs';

test('temp', () => {
  const fakeClients = range(1, 100).map((id) => ({
    id: id,
    email: faker.internet.email(),
    name: faker.datatype.boolean() ? faker.person.firstName : undefined,
    phone_number: faker.phone.number(),
    username: `${faker.internet.userName()}`,
  }));

  fs.writeFileSync('fakeClients.json', JSON.stringify(fakeClients), {
    flag: 'w',
  });
});
