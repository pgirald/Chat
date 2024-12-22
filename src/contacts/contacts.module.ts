import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ContactsController } from './contacts.controller';
import { CrudService } from '../common/crud/crud.services';

@Module({
  imports: [PersistenceModule.forRoot(['Clients', 'Locks', 'Assignations'])],
  providers: [CrudService],
  controllers: [ContactsController],
})
export class ContactsModule {}
