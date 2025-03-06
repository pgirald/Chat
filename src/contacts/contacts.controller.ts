import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ASSIGNATIONS,
  Models,
  RESTRICTED_CONTACTS,
  TablesNames,
} from '../persistence/constants';
import { CrudService } from '../common/crud/crud.services';
import { ContactsService } from './contacts.service';
import { AppValidationPipe } from '../common/AppValidation.pipe';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { ContactsPaginationDto } from './dto/contactsPagination.dto';

@Controller('contacts')
export class ContactsController {
  constructor(
    @Inject(TablesNames.Clients) private readonly clients: Models['Clients'],
    @Inject(TablesNames.Assignations)
    private readonly assignations: Models['Assignations'],
    @Inject(TablesNames.Locks)
    private readonly locks: Models['Locks'],
    private readonly contactsService: ContactsService,
  ) {}

  @Post('find')
  @UseGuards(PermissionsGuard)
  async findPage(
    @Body(AppValidationPipe) contactsPaginationDto: ContactsPaginationDto,
    @Request() req,
  ) {
    const [page, hasMore] = await this.contactsService.findConctactsPage(
      req,
      this.clients,
      this.assignations,
      this.locks,
      contactsPaginationDto,
    );

    const views = page.map(({ dataValues: client }) =>
      this.contactsService.client2view(client),
    );

    return [views, hasMore];
  }
}
