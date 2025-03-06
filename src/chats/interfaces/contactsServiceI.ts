import { Contact } from 'chat-api';
import { FindOptions } from 'sequelize';
import { Models } from 'src/persistence/constants';
import { Assignation, Client } from 'src/persistence/Entities';

export interface ContactsServiceI {
  getContactsQuery(
    req: any,
    assignations: Models['Assignations'],
    locks: Models['Locks'],
  ): FindOptions;

  client2view(client: Client): Contact;
}
