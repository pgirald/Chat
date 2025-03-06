import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { HttpProfileExtractor } from '../permissions/profileExtractors/httpProfileExtractor.service';
import { CrudModule } from '../common/crud/crud.module';
import {
  CONTACTS_SERVICE,
  MESSAGES_SERVICE,
  RINGTONES_SERVICE,
} from './constants';
import { ContactsService } from '../contacts/contacts.service';
import { RingtonesService } from '../ringtones/ringtones.service';
import { MessagesService } from '../messages/messages.service';

@Module({
  imports: [
    PersistenceModule.forRoot([
      'Clients',
      'Subscriptions',
      'Chats',
      'Messages',
      'Attachments',
      'Assignations',
      'Ringtones',
      'Locks',
      'sequelize',
    ]),
    PermissionsModule.forRoot(new HttpProfileExtractor()),
    CrudModule,
  ],

  controllers: [ChatsController],
  providers: [
    ChatsService,
    { provide: CONTACTS_SERVICE, useClass: ContactsService },
    { provide: RINGTONES_SERVICE, useClass: RingtonesService },
    { provide: MESSAGES_SERVICE, useClass: MessagesService },
  ],
})
export class ChatsModule {}
