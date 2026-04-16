import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { aiConversation, notesTable, userTokenUsage } from "../DB/schemas";
import { db } from "../DB/db";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

interface TokenUsage {
  used: number;
  limit: number;
  resetAt: Date;
}

export class ConversationService {
  async saveConversation(
    userId: number,
    noteId: number,
    messages: Message[],
    tokens: number,
  ): Promise<void> {
    const existing = await this.getConversationByNoteId(userId, noteId);
    if (existing) {
      await db
        .update(aiConversation)
        .set({
          messages: this.keepLastMessages(messages, 10),
          totalTokens: existing.totalTokens + tokens,
          updatedAt: new Date(),
        })
        .where(eq(aiConversation.id, existing.id));
    } else {
      await db.insert(aiConversation).values({
        userId,
        noteId,
        messages: this.keepLastMessages(messages, 10),
        totalTokens: tokens,
      });
    }
    await this.updateTokenUsage(userId, tokens);
  }

  async getRecentConversation(
    userID: number,
    noteId: number,
    limit: number = 10,
  ): Promise<{ message: Message[]; totaltokens: number } | null> {
    const conversation = await db
      .select()
      .from(aiConversation)
      .where(
        and(
          eq(aiConversation.userId, userID),
          eq(aiConversation.noteId, noteId),
        ),
      )
      .orderBy(desc(aiConversation.updatedAt))
      .limit(1);

    if (conversation.length === 0) return null;
    return {
      message: conversation[0]?.messages as Message[],
      totaltokens: conversation[0]?.totalTokens || 0,
    };
  }

  async deleteConversation(userId: number, noteId: number): Promise<void> {
    await db
      .delete(aiConversation)
      .where(
        and(
          eq(aiConversation.userId, userId),
          eq(aiConversation.noteId, noteId),
        ),
      );
  }

  async checkTokenLimit(userId: number): Promise<boolean> {
    await this.resetDailyTokensIfNeeded(userId);
    const usage = await this.getTokenUsage(userId);
    return usage.used < usage.limit;
  }

  async updateTokenUsage(userId: number, tokens: number): Promise<void> {
    const existing = await db
      .select()
      .from(userTokenUsage)
      .where(eq(userTokenUsage.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userTokenUsage)
        .set({
          tokensUsed: sql`${userTokenUsage.tokensUsed}+${tokens}`,
        })
        .where(eq(userTokenUsage.userId, userId));
    } else {
      await db.insert(userTokenUsage).values({
        userId,
        tokensUsed: tokens,
        maxTokens: 90000,
      });
    }
  }

  async getTokenUsage(userId: number): Promise<TokenUsage> {
    let usage = await db
      .select()
      .from(userTokenUsage)
      .where(eq(userTokenUsage.userId, userId))
      .limit(1);
    if (usage.length === 0) {
      await db.insert(userTokenUsage).values({
        userId,
        tokensUsed: 0,
        maxTokens: 90000,
      });

      return {
        used: 0,
        limit: 90000,
        resetAt: new Date(),
      };
    }
    return {
      used: usage[0]?.tokensUsed ?? 0,
      limit: usage[0]?.maxTokens ?? 90000,
      resetAt: usage[0]?.lastResetAt || new Date(),
    };
  }

  async resetDailyTokensIfNeeded(userId: number): Promise<void> {
    const usage = await this.getTokenUsage(userId);
    const now = new Date();
    const lastReset = new Date(usage.resetAt);

    const isNewDay =
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewDay) {
      await db
        .update(userTokenUsage)
        .set({ tokensUsed: 0, lastResetAt: now })
        .where(eq(userTokenUsage.userId, userId));
    }
  }

  async getAllConversations(userId: number): Promise<
    Array<{
      noteId: number | null;
      productTitle: string;
      lastMessage: string;
      messageCount: number;
      lastUpdated: Date;
      totalTokens: number;
    }>
  > {
    const conversations = await db
      .select({
        id: aiConversation.id,
        noteId: aiConversation.noteId,
        messages: aiConversation.messages,
        totalTokens: aiConversation.totalTokens,
        updatedAt: aiConversation.updatedAt,
      })
      .from(aiConversation)
      .where(eq(aiConversation.userId, userId))
      .orderBy(desc(aiConversation.updatedAt));

    const noteIds = conversations
      .map((c) => c.noteId)
      .filter((id): id is number => id !== null && id !== undefined);

    let noteMap = new Map<number, string>();
    if (noteIds.length > 0) {
      const notes = await db
        .select({
          id: notesTable.id,
          productTitle: notesTable.productTitle,
        })
        .from(notesTable)
        .where(inArray(notesTable.id, noteIds));
      noteMap = new Map(notes.map((n) => [n.id, n.productTitle]));
    }

    return conversations.map((conv) => {
      const messages = (conv.messages as Message[]) || [];
      const lastMsg = messages[messages.length - 1];

      return {
        noteId: conv.noteId ?? null,
        productTitle: noteMap.get(conv.noteId ?? 0) || "Unknown Note",
        lastMessage: lastMsg?.content?.substring(0, 100) + "..." || "",
        messageCount: messages.length,
        lastUpdated: conv.updatedAt,
        totalTokens: conv.totalTokens || 0,
      };
    });
  }

  private keepLastMessages(messages: Message[], count: number): Message[] {
    if (messages.length <= count) return messages;
    return messages.slice(-count);
  }

  private async getConversationByNoteId(
    userId: number,
    noteId: number,
  ): Promise<{ id: number; totalTokens: number } | null> {
    const result = await db
      .select({
        id: aiConversation.id,
        totalTokens: aiConversation.totalTokens,
      })
      .from(aiConversation)
      .where(
        and(
          eq(aiConversation.userId, userId),
          eq(aiConversation.noteId, noteId),
        ),
      )
      .limit(1);
    if (result.length === 0) {
      return null;
    }

    return { id: result[0]?.id ?? 0, totalTokens: result[0]?.totalTokens ?? 0 };
  }
  estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
  }
}

export const conversationservice = new ConversationService();
