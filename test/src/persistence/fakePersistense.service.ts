import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Models,
  MODELS,
  TablesNames,
} from '../../../src/persistence/constants';

@Injectable()
export class FakePersistenceService {
  async releaseResources(models: Models) {}
}
