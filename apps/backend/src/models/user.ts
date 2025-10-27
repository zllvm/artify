import { IUser } from "@artify/shared";

export type UserRole = "admin" | "artist" | "viewer";

export class User implements IUser {
  constructor(
    public id: string,
    public email: string,
    public displayName: string,
    public token?: string,
    public role: UserRole = email.endsWith("@maxlabs.se") ? "admin" : "artist"
  ) {}

  isAdmin(): boolean {
    return this.role === "admin";
  }

  static from(obj: Partial<IUser>): User {
    if (!obj.id || !obj.email || !obj.displayName) {
      throw new Error("Invalid user object");
    }
    return new User(obj.id, obj.email, obj.displayName);
  }
}
