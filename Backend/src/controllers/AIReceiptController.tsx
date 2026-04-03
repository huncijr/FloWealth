import { Response, NextFunction } from "express";
import { UserIdRequest } from "../types/interfaces";
import { db } from "../DB/db";
import { notesTable } from "../DB/schemas";
import { eq } from "drizzle-orm";
import { aiReceiptAnalyzer } from "../services/AIAnalyzer";

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

      const analysis = await aiReceiptAnalyzer.analyzeReceipt({
        base64Image: imageBase64,
        plannedNote: plannedNote,
        message: message,
        previousMessages: previousMessages,
        isInitialAnalysis: isInitialAnalysis,
      });

      return res.status(200).json({
        success: true,
        analysis: analysis,
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
