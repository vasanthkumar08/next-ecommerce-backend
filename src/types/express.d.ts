import { AuthUser } from "./authRequest";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};