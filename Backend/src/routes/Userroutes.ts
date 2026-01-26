import { Router } from "express";
import { createUser } from "../controllers/Appcontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
const router = Router();

router.post("/register", VerifyCloudflare, VerifyGoogleAuth, createUser);

export default router;
