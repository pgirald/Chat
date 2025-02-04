import {
  FREER,
  Models,
  MODELS,
  TablesNames,
} from '../../../src/persistence/constants';
import { ModelStatic, QueryTypes } from 'sequelize';
import { FakePersistenceService } from './fakePersistense.service';
import { defineModels } from '../../../src/persistence/models';
import { newMssqlSequelize } from '../../../src/persistence/source';
import * as fs from 'fs';
import { FAKES_FILE } from './contants';
import { fakeData } from './fakeData/fakeData';
import { newMemorySqliteSequelize } from './Data_Source';

export const fakePersistenceProviders = [
  {
    provide: MODELS,
    useFactory: mockModelsFactory,
  },
  { provide: FREER, useClass: FakePersistenceService },
];

export async function mockModelsFactory() {
  if (_models) {
    return _models;
  }
  //const testingSequelize = newMssqlSequelize();
  const testingSequelize = newMemorySqliteSequelize();
  const testingDbModels = defineModels(testingSequelize);
  try {
    await testingSequelize.sync({ force: true, logging: false });
  } catch (e) {
    console.log(e);
  }
  //console.log('Tables created successfully.');

  for (const tbl of Object.values(TablesNames)) {
    //console.log(`Starting [${tbl}] population`);
    await (testingDbModels[tbl] as ModelStatic<never>).bulkCreate(
      (fakeData as any)[tbl],
      { logging: false },
    );
    //console.log(`[${tbl}] was populated`);
  }
  //console.log('All table were successfully populated');
  _models = { sequelize: testingSequelize, ...testingDbModels } as Models;
  return _models;
}

let _models: Models | undefined;
