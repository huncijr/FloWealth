import { Router } from "express";
import {
  AuthenticateUser,
  createUser,
  GetUser,
  resendOTP,
  SignInUser,
} from "../controllers/Appcontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
const router = Router();

router.post("/register", VerifyCloudflare, VerifyGoogleAuth, createUser);
router.post("/login", SignInUser, VerifyCloudflare);
router.post("/authenticate", AuthenticateUser);
router.post("/resendOTP", resendOTP);
router.get("/getUser", GetUser);
export default router;
