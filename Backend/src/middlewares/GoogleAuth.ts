import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
interface AuthRequest extends Request {
  user?: TokenPayload;
}
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify the Google ID Token sent from the frontend
export const VerifyGoogleAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { tokenId } = req.body;
  if (!tokenId) {
    return res.status(401).json({ message: "No Google token provided" });
  }
  const googleClientId: string = String(process.env.GOOGLE_CLIENT_ID);
  try {
    //  Verify the token with Google's servers
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: googleClientId,
    });
    //  Extract the user profile data (email, name, etc.) from the token payload
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).send("Something went wrong!");
    //  Attach the verified user data to the request object for the next function
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
