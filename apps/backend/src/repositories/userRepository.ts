import { Profile } from "passport-google-oauth20";

import { AUser } from "../models/user.js";

export class UserRepository {
  private users = new Map<string, AUser>();

  findOrCreateFromGoogle(profile: Profile): AUser {
    let user = this.users.get(profile.id);
    if (!user) {
      const email = profile.emails?.[0]?.value ?? "";
      user = new AUser(profile.id, email, profile.displayName);
      this.users.set(user.id, user);
    }
    return user;
  }

  get(id: string): AUser | null {
    return this.users.get(id) ?? null;
  }

  set(user: AUser): void {
    this.users.set(user.id, user);
  }

  has(id: string): boolean {
    return this.users.has(id);
  }

  delete(id: string): void {
    this.users.delete(id);
  }

  all(): AUser[] {
    return Array.from(this.users.values());
  }
}
