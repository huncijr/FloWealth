import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "google-auth-library";
import { AuthRequest } from "../types/interfaces";
import { generateOTP, sendOTP } from "../middlewares/Emailverification";

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let userData;
    if (req.user && req.user.isGoogleUser) {
      userData = {
        sub: req.user.sub,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        given_name: req.user.given_name,
        isGoogleUser: req.user.isGoogleUser,
      };
      return res.status(200).json(userData);
    } else {
      const { email } = req.body;
      await requestOTP(email);
      return res.status(200).json({ message: "OTP send", email });
    }
    if (!req.user || !req.body) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  } catch (error) {
    next(error);
  }
};

export const requestOTP = async (email: string): Promise<string> => {
  let code: string = generateOTP();
  let emailsent = await sendOTP(email, code);
  return code;
};
