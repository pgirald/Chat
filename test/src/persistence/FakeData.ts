import { FAKES_FILE, Tables } from "./contants";
import * as fs from 'fs';

export const fakeData: Tables = JSON.parse(fs.readFileSync(FAKES_FILE).toString());