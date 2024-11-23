import { ModelStatic, QueryTypes } from 'sequelize';
import * as fs from 'fs';
import {
  testingDbModels,
  testingSequelize,
} from '../src/persistence/Data_Source';
import { fakesFile, Tables } from '../src/persistence/contants';
import { TablesNames } from 'src/persistence/constants';

test.each<[string, boolean]>([[fakesFile, true]])(
  'Check connection',
  async (fakesFile, shouldSync) => {
    try {
      if (shouldSync) {
        await testingSequelize.authenticate();
        console.log('Connection has been established successfully.');
        //await testingSequelize.query(`EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';`);
        await testingSequelize.sync({ force: true });
        //await testingSequelize.query(`EXEC sp_msforeachtable 'ALTER TABLE ? CHECK CONSTRAINT all';`);
        console.log('Tables created successfully.');
      }
      const fakeData: object = JSON.parse(
        fs.readFileSync(fakesFile).toString(),
      );
      for (const tbl of Object.values(TablesNames)) {
        console.log(`Starting [${tbl}] population`);
        await (testingDbModels[tbl] as ModelStatic<never>).bulkCreate(
          fakeData[tbl],
        );
        console.log(`[${tbl}] was populated`);
      }
      console.log('Tables populated succesfully');
      const results = await testingSequelize.query(
        'DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS;',
        { type: QueryTypes.SELECT },
      );
      if (results.length === 0) {
        console.log(
          'The inserted data does not violate any existing constraint',
        );
      } else {
        console.log(
          'The in inserted data does violate some of the existing constraints:',
        );
        console.log(results);
      }
    } catch (error) {
      console.log('Something unexpected happened:\n\n', error);
    }
  },
  3600000,
);
