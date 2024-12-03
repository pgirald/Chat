import { ExecutionContext } from '@nestjs/common';

export type Profile = {
  id: number;
  username: string;
};

export const PROFILE = 'profile';

export class JwtExtractor<T> {
  extract(request: T): string | undefined {
    throw new Error('Method not implemented.');
  }

  append(request: T, profile: Profile): void {
    throw new Error('Method not implemented.');
  }
}
