import { Request, Response, NextFunction } from "express";

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, given_name } = req.user;
    console.log(email, name, given_name);
    res
      .status(201)
      .json({ email, name, given_name, message: "Google User Created" });
  } catch (error) {
    next(error);
  }
};
