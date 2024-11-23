import { Module } from '@nestjs/common';
import { persistenceProviders } from './persistence.service';
import { MODELS } from './constants';

@Module({
  providers: [...persistenceProviders],
  exports: [MODELS],
})
export class PersistenceModule {}
