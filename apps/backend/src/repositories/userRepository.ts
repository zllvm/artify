import { Profile } from 'passport-google-oauth20';

import { User } from '../models/user.js';

export class UserRepository {
  private users = new Map<string, User>();

  findOrCreateFromGoogle(profile: Profile): User {
    let user = this.users.get(profile.id);
    if (!user) {
      const email = profile.emails?.[0]?.value ?? "";
      user = new User(profile.id, email, profile.displayName);
      this.users.set(user.id, user);
    }
    return user;
  }

  findById(id: string): User | null {
    return this.users.get(id) ?? null;
  }
}
