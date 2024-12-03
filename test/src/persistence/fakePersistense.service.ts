import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Models,
  MODELS,
  TablesNames,
} from '../../../src/persistence/constants';
import { ModelStatic, Sequelize } from 'sequelize';
import * as fs from 'fs';
import { fakesFile } from './contants';
import { testingDbModels, testingSequelize } from './Data_Source';
import { sequelize } from 'src/persistence/source';

// @Injectable()
// class PersistenceService implements OnApplicationShutdown {
//   constructor(@Inject(MODELS) private readonly models: Models) {}

//   async onApplicationShutdown(signal?: string) {
//     await this.models.sequelize.close();
//   }
// }

export const persistenceProviders = [
  {
    provide: MODELS,
    useFactory: async () => {
      if (_models) {
        return _models;
      }
      await testingSequelize.sync({ force: true, logging: false });
      console.log('Tables created successfully.');
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
      console.log('All table were successfully populated');
      _models = { sequelize: testingSequelize, ...testingDbModels };
      return _models;
    },
  },
  //PersistenceService,
];

let _models: Models | undefined;
