import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const generateToken = (userId: string, userName: string): void => {
  jwt.sign(
    { id: userId, name: userName },
    (process.env.JWT_SECRET_KEY as string) || "",
    {
      expiresIn: "10",
    },
  );
};
