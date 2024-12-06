import { DynamicModule, Module, Provider } from '@nestjs/common';
import { fakePersistenceProviders } from './fakePersistenceProviders';
import { Models, MODELS } from '../../../src/persistence/constants';

@Module({})
export class FakePersistenceModule {
  static forRoot(models: (keyof Models)[]): DynamicModule {
    return {
      module: FakePersistenceModule,
      providers: [...fakePersistenceProviders],
      ...models.map<Provider>((model) => ({
        provide: model,
        inject: [MODELS],
        useFactory: (models: Models) => models[model],
      })),
    };
  }
}
