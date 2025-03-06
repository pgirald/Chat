import { Injectable } from '@nestjs/common';
import {
  Assignation,
  Client,
  Lock,
  Permission,
  permissionsEnum,
  restrictionsEnum,
} from '../persistence/Entities';
import { Contact } from 'chat-api';
import { Attributes, FindOptions, Includeable, ModelCtor, Op } from 'sequelize';
import {
  ASSIGNATIONS,
  Models,
  RESTRICTED_CONTACTS,
  RESTRICTOR_CONTACTS,
  SeqModels,
} from '../persistence/constants';
import { CURRENT_PERMISSIONS } from '../permissions/constants';
import { Profile, PROFILE } from '../auth/token_extractors/JwtExtractor';
import { CrudService } from '../common/crud/crud.services';
import { ContactsPaginationDto } from './dto/contactsPagination.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly crud: CrudService) {}

  client2view(client: Client) {
    return {
      id: client.id,
      email: client.email,
      blocked: client[RESTRICTED_CONTACTS].some(
        (lock) => lock.restriction === restrictionsEnum.block.id,
      ),
      muted: client[RESTRICTED_CONTACTS].some(
        (lock) => lock.restriction === restrictionsEnum.mute.id,
      ),
      firstName: client.first_name,
      lastName: client.last_name,
      username: client.username,
      aboutMe: client.about_me,
      img: client.img,
      phoneNumber: client.phone_number,
      permissions: client[ASSIGNATIONS] && {
        broadcast: client[ASSIGNATIONS].some(
          (assignation) =>
            assignation.permission === permissionsEnum.broadcast.id,
        ),
        defaults: client[ASSIGNATIONS].some(
          (assignation) =>
            assignation.permission === permissionsEnum.defaults.id,
        ),
        userDeletionBan: client[ASSIGNATIONS].some(
          (assignation) =>
            assignation.permission === permissionsEnum.userD_B.id,
        ),
        userPrivileges: client[ASSIGNATIONS].some(
          (assignation) =>
            assignation.permission === permissionsEnum.userPrivilege.id,
        ),
      },
    } as Contact;
  }

  getContactsQuery(
    req: any,
    assignations: Models['Assignations'],
    locks: Models['Locks'],
    filter?: string,
  ): FindOptions {
    return {
      include: [
        ...(((req[CURRENT_PERMISSIONS] || []) as Permission[]).includes(
          'userPrivilege',
        )
          ? [
              {
                model: assignations,
                as: ASSIGNATIONS,
                required: false,
              },
            ]
          : []),
        {
          model: locks,
          as: RESTRICTED_CONTACTS,
          required: false,
          where: {
            restrictor: {
              [Op.eq]: (req[PROFILE] as Profile).id,
            },
          },
        },
      ],
    };
  }

  findConctactsPage(
    req: any,
    clients: Models['Clients'],
    assignations: Models['Assignations'],
    locks: Models['Locks'],
    contactsPaginationDto: ContactsPaginationDto,
  ): Promise<[SeqModels['Clients'][], boolean]> {
    const query = this.getContactsQuery(
      req,
      assignations,
      locks,
      contactsPaginationDto.filter,
    );

    (query.include as Includeable[]).push({
      model: locks,
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
    });

    const filteredQuery = {
      ...query,
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
    };

    return this.crud.findPage(
      clients,
      contactsPaginationDto.paginationInfo,
      filteredQuery,
    );
  }
}
