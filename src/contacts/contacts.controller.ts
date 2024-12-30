import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { Op } from 'sequelize';
import {
  ASSIGNATIONS,
  Models,
  RESTRICTED_LOCKS,
  TablesNames,
} from '../persistence/constants';
import { ContactsPaginationDto } from './contacts.dto';
import { CrudService } from '../common/crud/crud.services';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';
import { Client2ViewService } from './client2view.service';
import { AppValidationPipe } from '../common/AppValidation.pipe';

@Controller('contacts')
export class ContactsController {
  constructor(
    @Inject(TablesNames.Clients) private readonly clients: Models['Clients'],
    @Inject(TablesNames.Assignations)
    private readonly assignations: Models['Assignations'],
    @Inject(TablesNames.Locks)
    private readonly locks: Models['Locks'],
    private readonly crud: CrudService,
    private readonly client2view: Client2ViewService,
  ) {}

  @Post('find')
  async findPage(
    @Body(AppValidationPipe) contactsPaginationDto: ContactsPaginationDto,
    @Request() req,
  ) {
    const [page, hasMore] = await this.crud.findPage(
      this.clients,
      contactsPaginationDto.paginationInfo,
      {
        where: contactsPaginationDto.filter && {
          [Op.or]: [
            {
              username: {
                [Op.like]: `%${contactsPaginationDto.filter}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${contactsPaginationDto.filter}%`,
              },
            },
          ],
        },
        include: [
          {
            model: this.assignations,
            as: ASSIGNATIONS,
          },
          {
            model: this.locks,
            as: RESTRICTED_LOCKS,
            required: false,
            where: {
              restrictor: {
                [Op.eq]: (req[PROFILE] as Profile).id,
              },
            },
          },
        ],
      },
    );

    const views = page.map(({ dataValues: client }) =>
      this.client2view.convert(
        client,
        client[RESTRICTED_LOCKS],
        client[ASSIGNATIONS],
      ),
    );

    return [views, hasMore];
  }
}
