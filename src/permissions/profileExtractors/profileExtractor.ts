import { ExecutionContext } from '@nestjs/common';
import { Profile } from '../../auth/token_extractors/JwtExtractor';
import { Permission } from '../../persistence/Entities';

export class ProfileExtractor {
  extract(context: ExecutionContext): Profile {
    throw new Error('Method not implemented.');
  }

  append(context: ExecutionContext, permissions:Permission[] ): void {
    throw new Error('Method not implemented.');
  }
}
