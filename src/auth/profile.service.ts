import { Injectable } from '@nestjs/common';

export interface Profile {
  id: number;
  username: string;
}

@Injectable()
export class ProfileService {
  private profile?: Profile;

  _cleanProfile() {
    this.profile = undefined;
  }

  _setProfile(profile: Profile) {
    this.profile = profile;
  }

  getProfile(): Profile {
    if (!this.profile) {
      throw new Error("The requester's profile is not avialable");
    }
    return this.profile;
  }
}
