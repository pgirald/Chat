import { Sequelize } from 'sequelize';
import { FREER, Models, MODELS } from './constants';
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
