import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Models,
  MODELS,
  TablesNames,
} from '../../../src/persistence/constants';

@Injectable()
export class FakePersistenceService {
  constructor(@Inject(MODELS) private readonly models: Models) {}
}
