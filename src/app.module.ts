import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ContactsController } from './contacts/contacts.controller';
import { persistenceProviders } from './persistence/persistence.service';
import { PersistenceModule } from './persistence/persistence.module';
import { LanguageController } from '../test/src/common/language/language.controller';
import { LanguageGateway } from '../test/src/common/language/language.gateway';
import * as process from 'process';

process.env;

@Module({
  imports: [PersistenceModule],
  controllers: [AppController, ContactsController, LanguageController],
  providers: [AppService, ChatGateway, LanguageGateway],
})
export class AppModule {}
