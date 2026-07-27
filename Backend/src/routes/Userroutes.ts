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
  getBudget,
  setBudget,
  getCurrentMonthSpending,
  getSavingsSummary,
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
  handledeleteConversation,
  getAiTokens,
  getConversationById,
  getRecentConversations,
  parseProducts,
  extractPriceFromReceipt,
} from "../controllers/AIReceiptController";
import { checkTokenLimit } from "../middlewares/TokenLimit";
import {
  marketAll,
  marketCrypto,
  marketStocks,
  marketForex,
  marketCommodities,
  marketSearch,
  marketChart,
} from "../controllers/MarketController";

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
router.get("/getconversation/recent", userAuth, getRecentConversations);
router.get("/getconversation/id", userAuth, getConversationById);
router.delete(
  "/conversation/:conversationId",
  userAuth,
  handledeleteConversation,
);
router.post(
  "/analyze-receipt/price",
  userAuth,
  checkTokenLimit,
  extractPriceFromReceipt,
);
router.post("/parse-products", userAuth, parseProducts);
router.get("/getaitokens", userAuth, getAiTokens);
router.post("/compare-notes", userAuth, checkTokenLimit, compareTwoNotes);

router.get("/budget", userAuth, getBudget);
router.post("/budget", userAuth, setBudget);
router.get("/spending/current-month", userAuth, getCurrentMonthSpending);
router.get("/savings/summary", userAuth, getSavingsSummary);

router.get("/market/all", marketAll);
router.get("/market/crypto", marketCrypto);
router.get("/market/stocks", marketStocks);
router.get("/market/forex", marketForex);
router.get("/market/commodities", marketCommodities);
router.get("/market/search", marketSearch);
router.get("/market/chart", marketChart);

export default router;
