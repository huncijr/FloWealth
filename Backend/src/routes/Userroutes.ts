import { Router } from "express";
import {
  AuthenticateUser,
  createGoogleUser,
  createUser,
  GetUser,
  resendOTP,
  SignInUser,
} from "../controllers/Appcontroller";
import { AddNewThemes, GetThemes } from "../controllers/Nodecontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
import { userAuth } from "../middlewares/Usermiddleware";

const router = Router();

router.post("/register", VerifyCloudflare, createUser);
router.post("/Googleregister", VerifyGoogleAuth, createGoogleUser);
router.post("/login", VerifyCloudflare, SignInUser);
router.post("/authenticate", AuthenticateUser);
router.post("/resendOTP", resendOTP);
router.get("/getUser", GetUser);

router.get("/gettheme", userAuth, GetThemes);
router.post("/newtheme", userAuth, AddNewThemes);

export default router;
