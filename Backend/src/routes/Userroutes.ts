import { Router } from "express";
import { createUser } from "../controllers/Appcontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";

const router = Router();

router.post("/register", VerifyGoogleAuth, createUser);

export default router;
