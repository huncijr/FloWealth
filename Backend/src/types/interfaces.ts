import { TokenPayload } from "google-auth-library";
import { Request } from "express";

type ExtendedUser = TokenPayload & { isGoogleUser?: boolean };
export interface AuthRequest extends Request {
  user?: ExtendedUser;
}

export interface OTPTempData {
  name: string;
  password: string;
  createdAt: Date;
}

export interface Product {
  name: string;
  quantity: number | null;
  estprice: number | null;
}

export interface UserIdRequest extends Request {
  userId?: number;
}
