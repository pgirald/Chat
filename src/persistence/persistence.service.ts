import { Sequelize } from 'sequelize';
import { RELEASER, Models, MODELS } from './constants';
import {
  INestApplication,
  Inject,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PersistenceReleaserService } from './persistenceReleaser.service';

@Injectable()
export class PersistenceService implements OnApplicationShutdown {
  constructor(
    @Inject(MODELS) private readonly models: Models,
    @Inject(RELEASER) private readonly releaser: PersistenceReleaserService,
  ) {}

  async onApplicationShutdown(signal?: string) {
    await this.releaser.releaseResources(this.models);
  }
}
