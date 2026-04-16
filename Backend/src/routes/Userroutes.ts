import { Router } from "express";
import {
  AuthenticateUser,
  createGoogleUser,
  createUser,
  DeleteUser,
  GetUser,
  resendOTP,
  SignInUser,
  SignOutUser,
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
  compareTwoNotes,
  getAiTokens,
  getConversation,
  parseProducts,
} from "../controllers/AIReceiptController";
import { checkTokenLimit } from "../middlewares/TokenLimit";

const router = Router();

router.post("/register", VerifyCloudflare, createUser);
router.post("/Googleregister", VerifyGoogleAuth, createGoogleUser);
router.post("/login", VerifyCloudflare, SignInUser);
router.post("/authenticate", AuthenticateUser);
router.post("/resendOTP", resendOTP);
router.get("/getUser", GetUser);
router.delete("/deleteUser", userAuth, DeleteUser);
router.post("/signout", SignOutUser);

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
router.post("/parse-products", userAuth, parseProducts);
router.get("/getaitokens", userAuth, getAiTokens);
router.post("/compare-notes", userAuth, checkTokenLimit, compareTwoNotes);

export default router;
