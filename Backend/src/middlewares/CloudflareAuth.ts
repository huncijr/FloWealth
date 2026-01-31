import { Express, Request, Response, NextFunction } from "express";
import { URLSearchParams } from "node:url";
import dotenv from "dotenv";
dotenv.config();

export const VerifyCloudflare = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { cloudflaretoken } = req.body;
  try {
    const formData = new URLSearchParams();
    formData.append("secret", String(process.env.CLOUDFLARE_SECRET_KEY));
    formData.append("response", cloudflaretoken);
    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData },
    );
    const verified = await result.json();
    console.log("verifiedtoken", verified);
    if (verified.success) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Cloudflare Captcha is failed ",
      });
    }
  } catch (error) {
    next(error);
  }
};
