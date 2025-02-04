import { FAKES_FILE, Tables } from '../contants';
import * as fs from 'fs';

export const fakeData: Tables = JSON.parse(
  fs.readFileSync(FAKES_FILE).toString(),
  (key, value) => (value === undefined ? null : value),
);

export const fakeClient = fakeData.Clients[0];
