import {
  Lock,
  permissionsEnum,
  restrictionsEnum,
} from '../../../../src/persistence/Entities';
import { Tables } from '../contants';
import { generateClient } from './entitiesGenerators';
import { randElms, randInt } from 'js_utils';

export const admon = -1;

export const guest = -2;

export const blockedAdmon = -3;

export const blockedGuest = -4;

export function postGeneration(entities: Tables) {
  let clientsId = entities.Clients.sort((a, b) => a.id - b.id).at(-1).id;

  const blockedGuestObj = generateClient(++clientsId);

  const blockedAdmonObj = generateClient(++clientsId);

  const guestObj = generateClient(++clientsId);

  const admonObj = generateClient(++clientsId);

  entities.Clients.push(blockedGuestObj, blockedAdmonObj, guestObj, admonObj);

  let assignationsId = entities.Assignations.sort((a, b) => a.id - b.id).at(
    -1,
  ).id;

  for (const _admonObj of [admonObj, blockedAdmonObj]) {
    entities.Assignations.push(
      {
        id: ++assignationsId,
        client: _admonObj.id,
        permission: permissionsEnum.broadcast.id,
      },
      {
        id: ++assignationsId,
        client: _admonObj.id,
        permission: permissionsEnum.defaults.id,
      },
      {
        id: ++assignationsId,
        client: _admonObj.id,
        permission: permissionsEnum.userD_B.id,
      },
      {
        id: ++assignationsId,
        client: _admonObj.id,
        permission: permissionsEnum.userPrivilege.id,
      },
    );
  }

  for (const _blocked of [blockedGuestObj, blockedAdmonObj]) {
    entities.Locks.push(
      ...randElms(entities.Clients, randInt(2, 4)).map<Lock>((client) => ({
        restricted: _blocked.id,
        restrictor: client.id,
        restriction: restrictionsEnum.block.id,
      })),
    );
  }
}
