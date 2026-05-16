import type { Request } from "express";
import type { RequestContext } from "../../modules/auth/auth.types.js";

export const getRequestContext = (req: Request): RequestContext => {
  const forwardedFor = req.headers["x-forwarded-for"]?.toString().split(",")[0];

  return {
    ip: forwardedFor ?? req.socket.remoteAddress ?? req.ip ?? "",
    userAgent: req.headers["user-agent"] ?? "",
  };
};
