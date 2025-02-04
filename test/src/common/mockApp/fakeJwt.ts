import { JwtService } from '@nestjs/jwt';
import { FAKE_EXPIRATION, FAKE_SECRET } from './constants';
import { fakeClient } from '../../persistence/fakeData/fakeData';
import { Client } from '../../../../src/persistence/Entities';

const jwtService = new JwtService({ secret: FAKE_SECRET });

export const fakeJwt = getFakeJwt(fakeClient);

export function getFakeJwt(client: Client) {
  return jwtService.sign(
    {
      username: client.username,
      id: client.id,
    },
    { expiresIn: FAKE_EXPIRATION },
  );
}
