import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email: email },
    (process.env.JWT_SECRET_KEY as string) || "",
    {
      expiresIn: "7d",
    },
  );
};
