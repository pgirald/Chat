import { Contact } from 'chat-api';
import { Client } from 'src/persistence/Entities';

export interface ContactsServiceI {
  client2view(client: Client): Contact;
}
