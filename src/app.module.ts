import { Module, ModuleMetadata } from '@nestjs/common';
import { LanguageService } from './common/language/language.service';
import { HttpLangExtractorProvider } from './common/language/langExtractors/httpLangExtractor';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ContactsModule } from './contacts/contacts.module';
import { HttpLanguageModule } from './common/language/httpLanguage.module';
import { AppValidationPipe } from './common/AppValidation.pipe';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    { module: HttpLanguageModule, global: true },
    AuthModule,
    ChatModule,
    ContactsModule,
  ],
  providers: [AppValidationPipe],
})
export class AppModule {}
