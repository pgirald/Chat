import { ModelStatic, QueryTypes } from 'sequelize';
import * as fs from 'fs';
import { FAKES_FILE, Tables } from '../src/persistence/contants';
import { TablesNames } from '../../src/persistence/constants';
import { newMemorySqliteSequelize } from '../src/persistence/Data_Source';
import { defineModels } from '../../src/persistence/models';
import { newMssqlSequelize } from '../../src/persistence/source';

test.each<[string, boolean]>([[FAKES_FILE, true]])(
  'Check connection',
  async (fakesFile, shouldSync) => {
    // const testingSequelize = newMemorySqliteSequelize();
    try {
      const testingSequelize = newMssqlSequelize();
      const testingDbModels = defineModels(testingSequelize);

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
    } catch (e) {
      console.log(e);
    }
  },
  3600000,
);
