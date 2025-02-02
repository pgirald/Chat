import { Injectable } from '@nestjs/common';
import {
  Assignation,
  Client,
  Lock,
  permissionsEnum,
  restrictionsEnum,
} from '../persistence/Entities';
import { Contact } from 'chat-api';

@Injectable()
export class Client2ViewService {
  convert(client: Client, locks: Lock[], assignations?: Assignation[]) {
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
      permissions: assignations && {
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
    } as Contact;
  }
}
