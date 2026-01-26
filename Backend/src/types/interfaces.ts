import { TokenPayload } from "google-auth-library";
import { Request } from "express";
export interface AuthRequest extends Request {
  user?: TokenPayload;
}
