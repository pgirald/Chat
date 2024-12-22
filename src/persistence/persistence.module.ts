import { DynamicModule, Inject, Module, Provider } from '@nestjs/common';
import { FREER, Models, MODELS, TablesNames } from './constants';
import { PersistenceService } from './persistence.service';
import { newMssqlSequelize } from './source';
import { defineModels } from './models';

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
        { provide: FREER, useClass: PersistenceService },
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
