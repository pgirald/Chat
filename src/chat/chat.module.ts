import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SECRET, SECRET_EXPIRATION } from '../auth/constants';
import { ChatGateway } from './chat.gateway';
import { EMITTER } from './constants';
import { SocketIoJwtExtractor } from '../auth/token_extractors/socketIoJwtExtractor.service';
import { AppJwtAuthService } from '../common/AppJwtAuth.service';
import { LanguageService } from '../common/language/language.service';
import { IoLangExtractorProvider } from '../common/language/langExtractors/socketIoLangExtractor';
import { SocketIoEmitter } from './SocketIoEmitter.service';
import { AppJwtModule } from '../common/appJwt.module';
import { gatewayDeps } from '../gateway';

@Module({
  imports: [AppJwtModule],
  providers: [
    ChatGateway,
    { provide: EMITTER, useClass: gatewayDeps.emitterClass },
    SocketIoJwtExtractor,
    LanguageService,
    IoLangExtractorProvider,
  ],
})
export class ChatModule {}
