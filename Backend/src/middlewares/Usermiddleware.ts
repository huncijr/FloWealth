import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserIdRequest } from "../types/interfaces";
import dotenv from "dotenv";
dotenv.config();

export const userAuth = (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization failed" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
      id: number;
      email: string;
    };
    req.userId = decoded.id;
    next();
  } catch (error) {
    next(error);
  }
};
