import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import {
  FREER,
  Models,
  MODELS,
  TablesNames,
} from '../../../src/persistence/constants';
import { ModelStatic, Sequelize } from 'sequelize';
import * as fs from 'fs';
import { fakesFile } from './contants';
import { FakePersistenceService } from './fakePersistense.service';
import { newMemorySqliteSequelize } from './Data_Source';
import { defineModels } from '../../../src/persistence/models';

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
  const testingSequelize = newMemorySqliteSequelize();
  const testingDbModels = defineModels(testingSequelize);
  await testingSequelize.sync({ force: true, logging: false });
  //console.log('Tables created successfully.');
  const fakeData: object = JSON.parse(fs.readFileSync(fakesFile).toString());
  for (const tbl of Object.values(TablesNames)) {
    //console.log(`Starting [${tbl}] population`);
    await (testingDbModels[tbl] as ModelStatic<never>).bulkCreate(
      fakeData[tbl],
    );
    //console.log(`[${tbl}] was populated`);
  }
  //console.log('All table were successfully populated');
  _models = { sequelize: testingSequelize, ...testingDbModels };
  return _models;
}

let _models: Models | undefined;
