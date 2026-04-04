import { Router } from "express";
import {
  AuthenticateUser,
  createGoogleUser,
  createUser,
  GetUser,
  resendOTP,
  SignInUser,
} from "../controllers/Appcontroller";
import {
  AddNewThemes,
  GetThemes,
  AddNotes,
  GetNotes,
  DeleteNote,
  CompleteNote,
  UpdateNote,
  GetThemeStats,
  DeleteTheme,
} from "../controllers/Notecontroller";
import { VerifyGoogleAuth } from "../middlewares/GoogleAuth";
import { VerifyCloudflare } from "../middlewares/CloudflareAuth";
import { userAuth } from "../middlewares/Usermiddleware";
import {
  analyzeReceipt,
  getConversation,
} from "../controllers/AIReceiptController";
import { checkTokenLimit } from "../middlewares/TokenLimit";

const router = Router();

router.post("/register", VerifyCloudflare, createUser);
router.post("/Googleregister", VerifyGoogleAuth, createGoogleUser);
router.post("/login", VerifyCloudflare, SignInUser);
router.post("/authenticate", AuthenticateUser);
router.post("/resendOTP", resendOTP);
router.get("/getUser", GetUser);

router.get("/gettheme", userAuth, GetThemes);
router.post("/newtheme", userAuth, AddNewThemes);

router.get("/getnotes", userAuth, GetNotes);
router.post("/addnote", userAuth, AddNotes);
router.delete("/deletenote/:id", userAuth, DeleteNote);
router.post("/completenote/:id", userAuth, CompleteNote);
router.patch("/updatenotes", userAuth, UpdateNote);
router.get("/themestats", userAuth, GetThemeStats);
router.delete("/deletetheme/:themeId", userAuth, DeleteTheme);

router.post("/analyze-receipt", userAuth, checkTokenLimit, analyzeReceipt);
router.get("/getaiconversations", userAuth, getConversation);

export default router;
