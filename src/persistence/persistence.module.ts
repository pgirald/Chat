import { DynamicModule, Inject, Module, Provider } from '@nestjs/common';
import {
  RELEASER,
  Models,
  MODELS,
} from './constants';
import { PersistenceService } from './persistence.service';
import { newMssqlSequelize } from './source';
import { defineModels } from './models';
import { PersistenceReleaserService } from './persistenceReleaser.service';

@Module({})
export class PersistenceModule {
  static forRoot(models: (keyof Models)[]): DynamicModule {
    return {
      module: PersistenceModule,
      providers: [
        {
          provide: MODELS,
          useFactory: async () => {
            const sequelize = newMssqlSequelize();
            const dbmodels = defineModels(sequelize);
            await sequelize.authenticate();
            return { sequelize, ...dbmodels } as Models;
          },
        },
        PersistenceService,
        { provide: RELEASER, useClass: PersistenceReleaserService },
        ...models.map<Provider>((model) => ({
          provide: model,
          inject: [MODELS],
          useFactory: (models: Models) => models[model],
        })),
      ],
      exports: models,
    };
  }
}
