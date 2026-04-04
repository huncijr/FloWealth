import { NextFunction, Response } from "express";
import { UserIdRequest } from "../types/interfaces";
import { conversationservice } from "../services/ConversationService";

export const checkTokenLimit = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unathorized" });
    }
    const hasTokens = await conversationservice.checkTokenLimit(userId);
    if (!hasTokens) {
      const usage = await conversationservice.getTokenUsage(userId);
      return res.status(429).json({
        success: false,
        message: `Daily token limit reached (${usage.limit}). Resets at midnight.`,
        usage: usage,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
