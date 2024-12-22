import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { Attributes, Op, WhereOptions } from 'sequelize';
import {
  ASSIGNATIONS,
  Models,
  PERMISSIONS,
  RESTRICTED_LOCKS,
  TablesNames,
} from '../persistence/constants';
import { ContactsPaginationDto } from './contacts.dto';
import { CrudService } from '../common/crud/crud.services';
import { Contact } from 'chat-api';
import { ET } from '../persistence/Interfaces';
import {
  Assignation,
  Client,
  Lock,
  Named,
  permissionsEnum,
  restrictionsEnum,
} from '../persistence/Entities';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';

@Controller('contacts')
export class ContactsController {
  constructor(
    @Inject(TablesNames.Clients) private readonly clients: Models['Clients'],
    @Inject(TablesNames.Assignations)
    private readonly assignations: Models['Assignations'],
    @Inject(TablesNames.Locks)
    private readonly locks: Models['Locks'],
    private readonly crud: CrudService,
  ) {}

  @Post('find')
  async findPage(
    @Body(ValidationPipe) contactsPaginationDto: ContactsPaginationDto,
    @Request() req,
  ) {
    const [page, hasMore] = await this.crud.findPage(
      this.clients,
      contactsPaginationDto.paginationInfo,
      {
        where: contactsPaginationDto.filter && {
          username: { [Op.like]: `%${contactsPaginationDto.filter}%` },
          [`$${RESTRICTED_LOCKS}.restrictor$`]: {
            [Op.eq]: (req[PROFILE] as Profile).id,
          },
        },
        include: [
          {
            model: this.assignations,
            as: ASSIGNATIONS,
          },
          {
            model: this.locks,
            as: RESTRICTED_LOCKS,
          },
        ],
      },
    );
    let locks: Lock[];
    let assignations: Assignation[];

    const views = page.map<Contact>(({ dataValues: client }) => {
      locks = client[RESTRICTED_LOCKS];
      assignations = client[ASSIGNATIONS];

      return {
        id: client.id,
        email: client.email,
        blocked: locks.some(
          (lock) => lock.restriction === restrictionsEnum.block.id,
        ),
        muted: locks.some(
          (lock) => lock.restriction === restrictionsEnum.mute.id,
        ),
        firstName: client.first_name,
        lastName: client.last_name,
        username: client.username,
        aboutMe: client.about_me,
        img: client.img,
        phoneNumber: client.phone_number,
        permissions: {
          broadcast: assignations.some(
            (assignation) =>
              assignation.permission === permissionsEnum.broadcast.id,
          ),
          defaults: assignations.some(
            (assignation) =>
              assignation.permission === permissionsEnum.defaults.id,
          ),
          userDeletionBan: assignations.some(
            (assignation) =>
              assignation.permission === permissionsEnum.userD_B.id,
          ),
          userPrivileges: assignations.some(
            (assignation) =>
              assignation.permission === permissionsEnum.userPrivilege.id,
          ),
        },
      };
    });

    return [views, hasMore];
  }
}
