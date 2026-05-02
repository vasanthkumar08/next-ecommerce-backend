import type { Request } from "express";
import User from "../modules/user/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface GraphQLUser {
  _id: string;
  role: string;
  email: string;
}

export interface GraphQLContext {
  user: GraphQLUser | null;
}

export const createContext = async ({ req }: { req: Request }): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  if (!token) return { user: null };

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user || user.isBlocked) return { user: null };

    return {
      user: {
        _id: user._id.toString(),
        role: user.role,
        email: user.email,
      },
    };
  } catch {
    return { user: null };
  }
};
