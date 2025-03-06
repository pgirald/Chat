import { Module } from '@nestjs/common';
import { RingtonesService } from './ringtones.service';

@Module({
  providers: [RingtonesService],
})
export class RingtonesModule {}
