import User from "../user/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { hashToken } from "../../utils/hash";
import AppError from "../../utils/AppError";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("User already exists", 409);
  return User.create(data);
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user) throw new AppError("Invalid email or password", 401);

  if (user.isBlocked) {
    throw new AppError("Your account has been blocked", 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
  });

  const { token: refreshToken } = generateRefreshToken();

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshTokenService = async (incomingToken: string) => {
  if (!incomingToken) throw new AppError("No refresh token provided", 401);

  try {
    verifyRefreshToken(incomingToken);
  } catch {
    throw new AppError("Refresh token expired or invalid", 401);
  }

  const hashed = hashToken(incomingToken);
  const user = await User.findOne({ refreshToken: hashed }).select(
    "+refreshToken"
  );

  if (!user) throw new AppError("Refresh token expired or invalid", 401);

  if (user.isBlocked) {
    throw new AppError("Your account has been blocked", 403);
  }

  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
  });

  const { token: newRefreshToken } = generateRefreshToken();
  user.refreshToken = hashToken(newRefreshToken);
  await user.save();

  return { user, accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (incomingToken: string) => {
  if (!incomingToken) return;
  const hashed = hashToken(incomingToken);
  await User.updateOne(
    { refreshToken: hashed },
    { $unset: { refreshToken: 1 } }
  );
};
