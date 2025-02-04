import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Op } from 'sequelize';
import {
  ASSIGNATIONS,
  Models,
  RESTRICTED_CONTACTS,
  RESTRICTOR_CONTACTS,
  TablesNames,
} from '../persistence/constants';
import { ContactsPaginationDto } from './contacts.dto';
import { CrudService } from '../common/crud/crud.services';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';
import { Client2ViewService } from './client2view.service';
import { AppValidationPipe } from '../common/AppValidation.pipe';
import { CURRENT_PERMISSIONS } from '../permissions/constants';
import { Permission, restrictionsEnum } from '../persistence/Entities';
import { PermissionsGuard } from '../permissions/permissions.guard';

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
  @UseGuards(PermissionsGuard)
  async findPage(
    @Body(AppValidationPipe) contactsPaginationDto: ContactsPaginationDto,
    @Request() req,
  ) {
    const [page, hasMore] = await this.crud.findPage(
      this.clients,
      contactsPaginationDto.paginationInfo,
      {
        include: [
          ...((req[CURRENT_PERMISSIONS] as Permission[]).includes(
            'userPrivilege',
          )
            ? [
                {
                  model: this.assignations,
                  as: ASSIGNATIONS,
                },
              ]
            : []),
          {
            model: this.locks,
            as: RESTRICTED_CONTACTS,
            required: false,
            where: {
              restrictor: {
                [Op.eq]: (req[PROFILE] as Profile).id,
              },
            },
          },
          {
            model: this.locks,
            as: RESTRICTOR_CONTACTS,
            required: false,
            where: {
              [Op.and]: [
                {
                  restricted: {
                    [Op.eq]: (req[PROFILE] as Profile).id,
                  },
                },
                {
                  restriction: {
                    [Op.eq]: restrictionsEnum.block.id,
                  },
                },
              ],
            },
            subQuery: true,
          },
        ],
        //subQuery: false,
        where: [
          {
            [`$${RESTRICTOR_CONTACTS}.restriction$`]: {
              [Op.is]: null,
            },
          },
          ...(contactsPaginationDto.filter
            ? [
                {
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
              ]
            : []),
        ],
      },
    );

    const views = page.map(({ dataValues: client }) =>
      this.client2view.convert(
        client,
        client[RESTRICTED_CONTACTS],
        client[ASSIGNATIONS],
      ),
    );

    return [views, hasMore];
  }
}
