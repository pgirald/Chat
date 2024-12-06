import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PersistenceModule } from '../persistence/persistence.module';
import { AppJwtAuthService } from '../common/AppJwtAuth.service';
import { HttpJwtExtractor } from './token_extractors/httpJwtExtractor.service';
import { TablesNames } from '../persistence/constants';
import { AppJwtModule } from '../common/appJwt.module';

@Module({
  imports: [PersistenceModule.forRoot([TablesNames.Clients]), AppJwtModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    HttpJwtExtractor,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
