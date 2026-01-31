import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email: email },
    (process.env.JWT_SECRET_KEY as string) || "",
    {
      expiresIn: "7d",
    },
  );
};
// Generate jwtToken
export const jwtToken = (id: number, email: string): string => {
  const token = generateToken(id, email);
  console.log("the token", token);
  return token;
};
