import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "google-auth-library";
import { AuthRequest, OTPTempData } from "../types/interfaces";
import { generateOTP, sendOTP } from "../middlewares/Emailverification";
import { db } from "../DB/db";
import { Otps, Users } from "../DB/schemas";
import { eq, and, desc } from "drizzle-orm";

const requestOTP = async (email: string) => {
  //  Generate a random numeric or alphanumeric string
  let code: string = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  //test vars
  let name = "Peter";
  let password = "AAaa";
  let createdAt: Date = new Date();
  /* Persistence: Save the OTP and temporary user data to PostgreSQL
   We store sensitive data in 'tempData' (JSONB) so we can create 
   the actual User record only AFTER they provide the correct code.
  */
  await db.insert(Otps).values({
    email: email,
    code: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    tempData: { name, password, createdAt },
  });
  // Delivery: Send the code to the user's inbox
  let emailsent = await sendOTP(email, code);
};

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
      console.log(userData);
      if (userData && userData.email) {
        const existingUser = await db
          .select()
          .from(Users)
          .where(eq(Users.email, userData.email))
          .limit(1);
        console.log(existingUser);
        if (existingUser.length > 0) {
          return res
            .status(409)
            .json({ message: "account  already exist with this e-mail" });
        }
        await db.insert(Users).values({
          email: userData.email!,
          name: userData.name!,
          given_name: userData.given_name,
          picture: userData.picture,
          sub: userData.sub,
          isGoogleUser: userData.isGoogleUser,
        });
        return res.status(201).json({
          success: true,
          email: userData.email,
          name: userData.name,
          isGoogleUser: userData.isGoogleUser,
        });
      }
    } else {
      const { email } = req.body;
      const existingUser = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1);
      if (existingUser.length > 0) {
        return res
          .status(409)
          .json({ message: "account  already exist with this e-mail" });
      }
      await requestOTP(email);
      return res
        .status(200)
        .json({ message: "OTP send", isGoogleUser: false, success: true });
    }
  } catch (error) {
    next(error);
  }
};

export const AuthenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otpvalue }: { email: string; otpvalue: string } = req.body;
    //Check if the OTP value was actually provided in the request body
    if (otpvalue) {
      // Fetch the most recent OTP for this email from the database
      // We use orderBy(desc) to ensure we get the latest one if multiple exist
      const [dbotp] = await db
        .select()
        .from(Otps)
        .where(eq(Otps.email, email))
        .orderBy(desc(Otps.expiresAt))
        .limit(1);
      console.log(dbotp);
      console.log(otpvalue);
      // Handle case where no OTP record is found for this email
      if (!dbotp) {
        return res.status(404).json({
          success: false,
          message: "code is not found or invalid",
        });
      }
      // Expiration Logic: Compare current time with the 'expiresAt' timestamp
      const isexpired = new Date() > dbotp.expiresAt;
      console.log(new Date(), "code time:", dbotp.expiresAt);
      if (isexpired) {
        return res
          .status(410)
          .json({ success: false, message: "Code is expired" });
      }
      // Validation: Compare user-provided code with the stored code
      console.log("my code", otpvalue, "dbcode", dbotp.code);
      const isCodeValid = dbotp.code === otpvalue;
      if (!isCodeValid) {
        return res.status(401).json({
          message: "code is invalid",
        });
      }
      const userData: OTPTempData = dbotp.tempData;
      console.log("userdata", userData);
      // Move the user from "temporary" (Otps) to "permanent" (Users)
      await db.insert(Users).values({
        email: email,
        name: userData.name,
        password: userData.password,
        createdAt: new Date(userData.createdAt),
      });
      return res
        .status(201)
        .json({ success: true, email, name: userData.name });
    }
    return res.status(404).json({ message: "Code not found ", success: false });
  } catch (error) {
    next(error);
  }
};
