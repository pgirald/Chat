import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ContactsController } from './contacts.controller';
import { CrudService } from '../common/crud/crud.services';
import { ContactsService } from './contacts.service';
import { CrudModule } from '../common/crud/crud.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { HttpProfileExtractor } from '../permissions/profileExtractors/httpProfileExtractor.service';

@Module({
  imports: [
    PersistenceModule.forRoot(['Clients', 'Locks', 'Assignations']),
    PermissionsModule.forRoot(new HttpProfileExtractor()),
    CrudModule,
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
