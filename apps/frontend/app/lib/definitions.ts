export interface SessionPayload {
  userId: string;
  expireAt: Date;
  issueAt: Date;
  isAuthenticated: boolean;
}
