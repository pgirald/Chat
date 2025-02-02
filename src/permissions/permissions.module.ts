import { DynamicModule, Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ProfileExtractor } from './profileExtractors/profileExtractor';
import { PROFILE_EXTRACTOR } from './constants';
import { PermissionsGuard } from './permissions.guard';
import { TablesNames } from '../persistence/constants';

@Module({})
export class PermissionsModule {
  static forRoot(profileExtractor: ProfileExtractor): DynamicModule {
    return {
      module: PermissionsModule,
      imports: [PersistenceModule.forRoot(['Assignations'])],
      providers: [
        { provide: PROFILE_EXTRACTOR, useValue: profileExtractor },
        PermissionsGuard,
      ],
      exports: [PROFILE_EXTRACTOR, PermissionsGuard],
    };
  }
}
