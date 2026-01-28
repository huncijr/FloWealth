import { Router } from "express";
import { AuthenticateUser, createUser } from "../controllers/Appcontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
const router = Router();

router.post("/register", VerifyCloudflare, VerifyGoogleAuth, createUser);
router.post("/authenticate", AuthenticateUser);

export default router;
