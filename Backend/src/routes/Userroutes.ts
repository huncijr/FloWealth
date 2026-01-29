import { Router } from "express";
import {
  AuthenticateUser,
  createUser,
  resendOTP,
} from "../controllers/Appcontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
const router = Router();

router.post("/register", VerifyCloudflare, VerifyGoogleAuth, createUser);
router.post("/authenticate", AuthenticateUser);
router.post("/resendOTP", resendOTP);

export default router;
