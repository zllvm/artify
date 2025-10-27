/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IUser } from "@artify/shared";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
