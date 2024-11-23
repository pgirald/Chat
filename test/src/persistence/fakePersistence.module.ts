import { Module } from '@nestjs/common';
import { MODELS } from '../../../src/persistence/constants';
import { persistenceProviders } from './fakePersistense.service';

@Module({
  providers: [...persistenceProviders],
  exports: [MODELS],
})
export class FakePersistenceModule {}
