import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ContactsController } from './contacts/contacts.controller';
import { persistenceProviders } from './persistence/persistence.service';
import { PersistenceModule } from './persistence/persistence.module';
import * as process from "process";

process.env

@Module({
  imports: [PersistenceModule],
  controllers: [AppController, ContactsController],
  providers: [AppService, ChatGateway],
})
export class AppModule {
  
}
