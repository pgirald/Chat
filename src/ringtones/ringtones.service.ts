import { Injectable } from '@nestjs/common';
import { Ringtone } from '../persistence/Entities';
import { Ringtone as Ringtonevw } from 'chat-api';

@Injectable()
export class RingtonesService {
  ringtone2view(ringtone: Ringtone): Ringtonevw {
    return { id: ringtone.id, name: ringtone.name, url: ringtone.url };
  }
}
