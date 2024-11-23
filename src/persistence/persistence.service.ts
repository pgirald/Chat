import { Sequelize } from 'sequelize';
import { dbmodels, sequelize } from './source';
import { Models, MODELS } from './constants';
import {
  INestApplication,
  Inject,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class PersistenceService implements OnApplicationShutdown {
  constructor(@Inject(MODELS) private readonly models: Models) {}

  async onApplicationShutdown(signal?: string) {
    await this.models.sequelize.close();
  }
}

export const persistenceProviders = [
  {
    provide: MODELS,
    useFactory: async () => {
      await sequelize.authenticate();
      return { sequelize, ...dbmodels };
    },
  },
  PersistenceService,
];
