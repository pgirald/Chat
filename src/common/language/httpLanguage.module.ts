import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LanguageGuard } from './language.Guard';
import { LanguageService } from './language.service';
import { HttpLangExtractorProvider } from './langExtractors/httpLangExtractor';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: LanguageGuard },
    LanguageService,
    HttpLangExtractorProvider,
  ],
  exports: [LanguageService],
})
export class HttpLanguageModule {}
