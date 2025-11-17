import config from "../config/environment.js";

export type UserRole = "admin" | "artist" | "viewer";

export interface IUser {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  isAuthenticated: boolean;
  tokenExpiresAt?: Date;
  isPinterestConnected: boolean;
  role: "admin" | "artist" | "viewer";
}

export class AUser implements IUser {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public displayName?: string,
    public token?: string,
    public isAuthenticated: boolean = false,
    public tokenExpiresAt?: Date,
    public pinterestToken?: string,
    public isPinterestConnected: boolean = false,
    public role: UserRole = config.app.adminEmails.includes(email)
      ? "admin"
      : "artist"
  ) {}

  isAdmin(): boolean {
    return this.role === "admin";
  }

  connectPinterest(token: string) {
    this.pinterestToken = token;
    this.isPinterestConnected = true;
  }

  disconnectPinterest() {
    this.pinterestToken = undefined;
    this.isPinterestConnected = false;
  }

  static from(obj: Partial<IUser>): AUser {
    if (!obj.id || !obj.email || !obj.name) {
      throw new Error("Invalid user object");
    }
    const user = new AUser(obj.id, obj.email, obj.name);
    return user;
  }
}
