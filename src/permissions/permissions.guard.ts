import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Models, TablesNames } from '../persistence/constants';
import { Permission, permissionsEnum } from '../persistence/Entities';
import { PROFILE_EXTRACTOR, REQUIRED_PERMISSIONS } from './constants';
import { ProfileExtractor } from './profileExtractors/profileExtractor';
import { Op } from 'sequelize';
import { getKeys, typedKeys } from 'js_utils';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PROFILE_EXTRACTOR)
    private readonly profileExtractor: ProfileExtractor,
    @Inject(TablesNames.Assignations)
    private readonly assignation: Models['Assignations'],
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<Permission[]>(REQUIRED_PERMISSIONS, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const profile = this.profileExtractor.extract(context);

    const assignations = await this.assignation.findAll({
      where: { client: { [Op.eq]: profile.id } },
    });

    const canPass = requiredPermissions.every(
      (permission) =>
        !!assignations.find(
          (ass) => ass.dataValues.permission === permissionsEnum[permission].id,
        ),
    );

    if (canPass) {
      this.profileExtractor.append(
        context,
        assignations.map<Permission>((ass) =>
          typedKeys(permissionsEnum).find(
            (key) => permissionsEnum[key].id === ass.dataValues.permission,
          ),
        ),
      );
    }

    return canPass;
  }
}
