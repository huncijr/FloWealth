import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "google-auth-library";
import { AuthRequest } from "../types/interfaces";

export const createUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("ittvok");
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { email, name, given_name } = req.user;
    console.log(email, name, given_name);
    res
      .status(201)
      .json({ email, name, given_name, message: "Google User Created" });
  } catch (error) {
    next(error);
  }
};
