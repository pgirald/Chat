import * as fs from 'fs';
import { stringify } from 'flatted';
import { FAKES_FILE, Tables } from '../src/persistence/contants';
import { generateViews } from '../src/persistence/fakeViews/fakeViewsGenerator';

test.each<[string, string]>([[FAKES_FILE, 'test/fakeViews.json']])(
  'Generate fake views',
  (fakesFile, outFile) => {
    const fakeViews = generateViews(
      JSON.parse(fs.readFileSync(fakesFile).toString()),
    );
    fs.writeFileSync(outFile, stringify(fakeViews), { flag: 'w' });
    console.log(
      '------------------------------------------File written succesfully------------------------------------------',
    );
  },
);
