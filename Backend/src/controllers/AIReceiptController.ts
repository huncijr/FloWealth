import { Response, NextFunction } from "express";
import { UserIdRequest } from "../types/interfaces";
import { db } from "../DB/db";
import { notesTable, userTokenUsage } from "../DB/schemas";
import { eq } from "drizzle-orm";
import { aiReceiptAnalyzer } from "../services/AIAnalyzer";
import { conversationservice } from "../services/ConversationService";
import { timestamp } from "drizzle-orm/gel-core";
import {
  noteComparisionAnalyzer,
  NoteComparisonAnalyzer,
} from "../services/NoteComparisonAnalyzer";
import { productParser } from "../services/ProductParser";

interface Product {
  name: string;
  quantity: number | null;
  estprice: number | null;
}

export const analyzeReceipt = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const { imageBase64, noteId, message, previousMessages } = req.body;
    const isInitialAnalysis =
      !previousMessages || previousMessages.length === 0;

    let plannedNote = undefined;
    if (noteId) {
      const [note] = await db
        .select({
          productTitle: notesTable.productTitle,
          estcost: notesTable.estcost,
          products: notesTable.products,
        })
        .from(notesTable)
        .where(eq(notesTable.id, noteId))
        .limit(1);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Not not found",
        });
      }

      const [userNote] = await db
        .select({ userId: notesTable.userId })
        .from(notesTable)
        .where(eq(notesTable.id, noteId))
        .limit(1);

      if (!userNote || userNote.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to analyze this",
        });
      }

      plannedNote = {
        productTitle: note.productTitle,
        estcost: note.estcost as string | number,
        products: note.products as unknown as Array<{
          name: string;
          quantity: number | null;
          estprice: number | null;
        }>,
      };

      const hasTokens = await conversationservice.checkTokenLimit(userId);
      if (!hasTokens) {
        return res.status(429).json({
          success: false,
          message: "Daily AI token limit reached",
        });
      }

      const existingConversation =
        await conversationservice.getRecentConversation(userId, noteId);

      const previousMessages =
        existingConversation?.message.map((m) => ({
          role: m.role,
          content: m.content,
        })) || req.body.previousMessages;

      // console.log(previousMessages);

      const analysis = await aiReceiptAnalyzer.analyzeReceipt({
        base64Image: imageBase64,
        plannedNote: plannedNote,
        message: message,
        previousMessages: previousMessages,
        isInitialAnalysis: isInitialAnalysis,
      });

      const messagesToSave =
        previousMessages && previousMessages.length > 0 && message
          ? [
              ...previousMessages,
              {
                role: "user",
                content: message,
                timestamp: new Date().toISOString(),
              },
            ]
          : [
              {
                role: "user",
                content: "Initial analysis",
                timestamp: new Date().toISOString(),
              },
            ];
      messagesToSave.push({
        role: "ai",
        content: analysis.content,
        timestamp: new Date().toISOString(),
      });
      await conversationservice.saveConversation(
        userId,
        noteId,
        messagesToSave,
        analysis.token,
      );

      return res.status(200).json({
        success: true,
        analysis: analysis.content,
        tokens: analysis.token,
        message: "Receipt analyzed succesfully",
      });
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("AI API error")) {
        return res.status(502).json({
          success: false,
          message:
            "AI service temporarily unavailable. Please try again later.",
        });
      }
    }
    next(error);
  }
};

export const getConversation = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unathorized" });
  }
  const { noteId } = req.query;
  // console.log(noteId);
  if (noteId) {
    const conversation = await conversationservice.getRecentConversation(
      userId,
      parseInt(noteId as string),
    );
    return res.status(200).json({ success: true, data: conversation });
  } else {
    const allConversations =
      await conversationservice.getAllConversations(userId);
    // console.log(allConversations);
    return res.json({ success: true, data: allConversations });
  }
};

export const getAiTokens = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unathorized" });
  }
  try {
    const userToken = await db
      .select({
        tokensUsed: userTokenUsage.tokensUsed,
        maxTokens: userTokenUsage.maxTokens,
      })
      .from(userTokenUsage)
      .where(eq(userTokenUsage.userId, userId))
      .limit(1);

    if (!userToken || userToken.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          tokensUsed: 0,
          maxTokens: 90000,
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        tokensUsed: userToken[0]?.tokensUsed,
        maxTokens: userToken[0]?.maxTokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const compareTwoNotes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unathorized", success: false });
  }
  try {
    const { noteA, noteB } = req.body;

    if (!noteA || !noteB) {
      return res
        .status(404)
        .json({ success: false, message: "One or both notes not found" });
    }

    if (!noteA.productTitle || !noteB.productTitle) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid note Data" });
    }

    const hasTokens = await conversationservice.checkTokenLimit(userId);
    if (!hasTokens) {
      return res.status(429).json({
        success: false,
        message: "Daily AI token limit reached",
      });
    }

    const result = await noteComparisionAnalyzer.compareNotes({
      noteA: {
        productTitle: noteA.productTitle,
        estcost: noteA.estcost,
        cost: noteA.cost,
        products: noteA.products,
        picture: noteA.picture || undefined,
      },

      noteB: {
        productTitle: noteB.productTitle,
        estcost: noteB.estcost,
        cost: noteB.cost,
        products: noteB.products,
        picture: noteB.picture || undefined,
      },
    });

    await conversationservice.updateTokenUsage(userId, result.token);

    return res.status(200).json({
      success: true,
      result: result.result,
      tokens: result.token,
    });
  } catch (error) {
    next(error);
  }
};

export const parseProducts = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unathorized", success: false });
  }

  try {
    const { text } = req.body;
    console.log("text", text);
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Text input is required",
      });
    }
    const hasTokens = await conversationservice.checkTokenLimit(userId);
    if (!hasTokens) {
      return res.status(429).json({
        success: false,
        message: "Daily AI token limit reached",
      });
    }
    const result = await productParser.ParseProducts(text);
    await conversationservice.updateTokenUsage(userId, result.token);
    console.log("The Products", result.products);
    console.log("Tokens used", result.token);
    return res.status(200).json({
      success: true,
      products: result.products,
      tokens: result.token,
    });
  } catch (error) {
    next(error);
  }
};
