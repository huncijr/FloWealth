import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (targetEmail: string, code: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: targetEmail,
    subject: "Registration code",
    text: `The code: ${code}`,
    html: `<h1> Hi </h1><p>The code is ${code}</p>`,
  });
};
