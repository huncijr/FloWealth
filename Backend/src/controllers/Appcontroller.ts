import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "google-auth-library";
import { AuthRequest, OTPTempData } from "../types/interfaces";
import { generateOTP, sendOTP } from "../middlewares/Emailverification";
import { db } from "../DB/db";
import { Otps, Users } from "../DB/schemas";
import { eq, and, desc } from "drizzle-orm";
import { generateToken } from "../routes/jwtgeneration";

const requestOTP = async (email: string, name: string, password: string) => {
  //  Generate a random numeric or alphanumeric string
  let code: string = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  //test vars
  let createdAt: Date = new Date();
  /* Persistence: Save the OTP and temporary user data to PostgreSQL
   We store sensitive data in 'tempData' (JSONB) so we can create 
   the actual User record only AFTER they provide the correct code.
  */
  console.log("created:", createdAt);
  await db.insert(Otps).values({
    email: email,
    code: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    tempData: { name, password, createdAt },
  });
  // Delivery: Send the code to the user's inbox
  console.log("kod sent");
  await sendOTP(email, code);
};
const jwtToken = (id: number, email: string): string => {
  const token = generateToken(id, email);
  return token;
};

const CreateCookies = (id: number, email: string, res: Response) => {
  console.log(process.env.NODE_ENV);
  let token: string = jwtToken(id, email);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as
      | "strict"
      | "lax",
    path: "/",
  };
  res.cookie("authToken", token, cookieOptions);
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({
        message: "All input is required",
      });
    }
    console.log(email, "resent!");
    await requestOTP(email, name, password);
  } catch (error) {
    next(error);
  }
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
      const { email, name, password } = req.body;
      console.log("name", name, "email", email, "password", password);
      if (!email || !name || !password) {
        return res.status(400).json({
          message: "All input is required",
        });
      }
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
      await requestOTP(email, name, password);
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
    if (!email || !otpvalue) {
      return res.status(400).json({
        message: "All input is required",
      });
    }
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
      const [newUser] = await db
        .insert(Users)
        .values({
          email: email,
          name: userData.name,
          password: userData.password,
          createdAt: new Date(userData.createdAt),
        })
        .returning({ id: Users.id });
      if (newUser && newUser.id) {
        CreateCookies(newUser.id, email, res);
      }
      return res
        .status(201)
        .json({ success: true, email, name: userData.name });
    }
  } catch (error) {
    next(error);
  }
};
