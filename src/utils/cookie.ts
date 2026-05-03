import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};
