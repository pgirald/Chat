import { faker } from '@faker-js/faker';
import { Client } from '../../../../src/persistence/Entities';
import { DEFAULT_PASSWORD } from '../contants';
import * as bcrypt from 'bcrypt';

const password = bcrypt.hashSync(DEFAULT_PASSWORD, bcrypt.genSaltSync());

export function generateClient(id: number) {
  return {
    id: id,
    email: faker.internet.email(),
    first_name: faker.datatype.boolean() ? faker.person.firstName() : undefined,
    last_name: faker.datatype.boolean() ? faker.person.lastName() : undefined,
    phone_number: faker.phone.number(),
    username: faker.internet.userName(),
    password: password,
    about_me: faker.word.words({ count: { min: 0, max: 10 } }) || undefined,
    img: faker.datatype.boolean() ? faker.internet.url() : undefined,
  };
}
