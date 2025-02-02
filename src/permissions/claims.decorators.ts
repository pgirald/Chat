import { SetMetadata } from '@nestjs/common';
import { Permission, permissionsEnum } from 'src/persistence/Entities';
import { REQUIRED_PERMISSIONS } from './constants';

export const Permissions = (...roles: Permission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, roles);
