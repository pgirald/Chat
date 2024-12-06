import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ContactsController } from './contacts.controller';

@Module({
  imports: [PersistenceModule.forRoot(['Clients'])],
  controllers: [ContactsController],
})
export class ContactsModule {}
