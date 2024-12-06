import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SECRET, SECRET_EXPIRATION } from '../auth/constants';
import { AppJwtAuthService } from './AppJwtAuth.service';
import { ENV } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(SECRET),
        signOptions: { expiresIn: configService.get(SECRET_EXPIRATION) },
      }),
    }),
  ],
  providers: [AppJwtAuthService /*,{ provide: ENV, useValue: '.env' }*/],
  exports: [JwtModule, ConfigModule, AppJwtAuthService],
})
export class AppJwtModule {}
