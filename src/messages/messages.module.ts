import { Module } from '@nestjs/common';
import { CONTACTS_SERVICE } from './constants';
import { ContactsService } from '../contacts/contacts.service';

@Module({
  providers: [{ provide: CONTACTS_SERVICE, useClass: ContactsService }],
})
export class Messages {}
