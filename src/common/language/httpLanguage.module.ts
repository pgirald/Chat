import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { LanguageGuard } from './language.Guard';
import { LanguageService } from './language.service';
import { HttpLangExtractorProvider } from './langExtractors/httpLangExtractor';
import { LanguageFilter } from './language.filter';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: LanguageGuard },
    { provide: APP_FILTER, useClass: LanguageFilter },
    LanguageService,
    HttpLangExtractorProvider,
  ],
  exports: [LanguageService],
})
export class HttpLanguageModule {}
