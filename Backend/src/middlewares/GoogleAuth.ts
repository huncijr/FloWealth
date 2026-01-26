import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { AuthRequest } from "../types/interfaces";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify the Google ID Token sent from the frontend
export const VerifyGoogleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { googletoken } = req.body;
  if (!googletoken) {
    return next();
  }

  const googleClientId: string = String(process.env.GOOGLE_CLIENT_ID);
  try {
    //  Verify the token with Google's servers
    const ticket = await client.verifyIdToken({
      idToken: googletoken,
      audience: googleClientId,
    });
    //  Extract the user profile data (email, name, etc.) from the token payload
    const payload = ticket.getPayload();
    console.log(payload);
    if (!payload) return res.status(400).send("Something went wrong!");
    //  Attach the verified user data to the request object for the next function

    if (!payload.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Google account is not authenticated",
      });
    }
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
