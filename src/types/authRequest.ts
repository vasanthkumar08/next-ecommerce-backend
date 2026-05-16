import { Request } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";

/* ===================== AUTH USER ===================== */
export interface AuthUser {
  _id: string;
  role?: "user" | "admin" | "moderator" | "manager";
  email?: string;
  sessionId?: string;
}

/* ===================== AUTH REQUEST ===================== */
export type AuthRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query
> = Request<P, ResBody, ReqBody, ReqQuery> & {
  user?: AuthUser;
};
