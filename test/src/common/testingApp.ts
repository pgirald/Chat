import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { FREER, MODELS } from '../../../src/persistence/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  fakePersistenceProviders,
  mockModelsFactory,
} from '../persistence/fakePersistenceProviders';
import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { FakePersistenceService } from '../persistence/fakePersistense.service';
import { AuthGuard } from '../../../src/auth/auth.guard';
import { PersistenceModule } from '../../../src/persistence/persistence.module';
import { FakePersistenceModule } from '../persistence/fakePersistence.module';
import { gatewayDeps } from '../../../src/gateway';
import { PersistenceService } from '../../../src/persistence/persistence.service';
import { SECRET, SECRET_EXPIRATION } from '../../../src/auth/constants';

export async function getTestingApp(
  moduleMeta?: ModuleMetadata,
  config?: (builder: TestingModuleBuilder) => void,
): Promise<[TestingModule, INestApplication<any>]> {
  const module: ModuleMetadata = {
    imports: [AppModule],
  };

  if (moduleMeta) {
    for (const key in moduleMeta) {
      if (module[key]) {
        module[key] = [...moduleMeta[key], ...module[key]];
      } else {
        module[key] = moduleMeta[key];
      }
    }
  }
  const builder = Test.createTestingModule(module)
    .overrideProvider(MODELS)
    .useFactory({ factory: mockModelsFactory })
    .overrideProvider(PersistenceService)
    .useClass(FakePersistenceService)
    .overrideProvider(ConfigService)
    .useValue({
      get(key: string): string | null {
        let value: string | null;
        switch (key) {
          case SECRET:
            value = 'My JWT secret';
            break;
          case SECRET_EXPIRATION:
            value = '1h';
            break;
          default:
            value = null;
        }
        return value;
      },
    });

  config?.(builder);

  const appModule = await builder.compile();

  const app = appModule.createNestApplication();
  app.useWebSocketAdapter(new gatewayDeps.adapter(app));
  await app.init();
  return [appModule, app];
}
