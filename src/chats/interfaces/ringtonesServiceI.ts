import { Contact } from 'chat-api';
import { FindOptions } from 'sequelize';
import { Models } from 'src/persistence/constants';
import { Assignation, Client, Ringtone } from 'src/persistence/Entities';
import { Ringtone as Ringtonevw } from 'chat-api';

export interface RingtonesServiceI {
  ringtone2view(ringtone: Ringtone): Ringtonevw;
}
