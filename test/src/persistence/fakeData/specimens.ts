import {
  Lock,
  permissionsEnum,
  restrictionsEnum,
} from '../../../../src/persistence/Entities';
import { Tables } from '../contants';
import { generateClient } from './entitiesGenerators';
import { randElms, randInt, unique } from 'js_utils';

export const admon = -1;

export const guest = -2;

export const blockedAdmon = -3;

export const blockedGuest = -4;

export const noChatsUser = -5;

export function postGeneration(entities: Tables) {
  const lastId = entities.Clients.sort((a, b) => a.id - b.id).at(-1).id;

  const admonObj = entities.Clients.at(admon);

  const guestObj = entities.Clients.at(guest);

  const blockedAdmonObj = entities.Clients.at(blockedAdmon);

  const blockedGuestObj = entities.Clients.at(blockedGuest);

  entities.Clients.splice(
    entities.Clients.length + noChatsUser + 1,
    0,
    generateClient(lastId + 1),
  );

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

  entities.Assignations = unique(
    entities.Assignations,
    (ass1, ass2) =>
      ass1.client === ass2.client && ass1.permission === ass2.permission,
  );

  entities.Assignations = entities.Assignations.filter(
    (ass) => ass.client !== guestObj.id && ass.client !== blockedGuestObj.id,
  );

  for (const _blocked of [blockedGuestObj, blockedAdmonObj]) {
    entities.Locks.push(
      ...randElms(entities.Clients, randInt(2, 4)).map<Lock>((client) => ({
        restricted: _blocked.id,
        restrictor: client.id,
        restriction: restrictionsEnum.block.id,
      })),
    );
  }

  entities.Locks = unique(
    entities.Locks,
    (lock1, lock2) =>
      lock1.restricted === lock2.restricted &&
      lock1.restrictor === lock2.restrictor &&
      lock1.restriction === lock2.restriction,
  );
}
