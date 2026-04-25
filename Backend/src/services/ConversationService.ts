import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
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

interface ConversationData {
  id: number;
  noteId: number | null;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastUpdated: Date;
  totalTokens: number;
}

export class ConversationService {
  async saveConversation(
    userId: number,
    noteId: number,
    messages: Message[],
    tokens: number,
    title?: string,
  ): Promise<number> {
    const existing = await this.getConversationByNoteId(userId, noteId);
    let conversationid: number | undefined;
    if (existing) {
      await db
        .update(aiConversation)
        .set({
          messages: this.keepLastMessages(messages, 10),
          totalTokens: existing.totalTokens + tokens,
          updatedAt: new Date(),
        })
        .where(eq(aiConversation.id, existing.id));
      conversationid = existing.id;
    } else {
      const [result] = await db
        .insert(aiConversation)
        .values({
          userId,
          noteId,
          title: title || "New Conversation",
          messages: this.keepLastMessages(messages, 10),
          totalTokens: tokens,
        })
        .returning({ id: aiConversation.id });
      if (!result) {
        throw new Error("Failed to create conversation");
      }
      conversationid = result.id;
    }

    await this.updateTokenUsage(userId, tokens);
    await this.cleanUpconversation(userId, 10);
    return conversationid;
  }

  async getRecentConversations(
    userId: number,
    limit: number = 10,
  ): Promise<ConversationData[]> {
    const conversations = await db
      .select({
        id: aiConversation.id,
        noteId: aiConversation.noteId,
        title: aiConversation.title,
        messages: aiConversation.messages,
        totalTokens: aiConversation.totalTokens,
        updatedAt: aiConversation.updatedAt,
      })
      .from(aiConversation)
      .where(eq(aiConversation.userId, userId))
      .orderBy(desc(aiConversation.updatedAt))
      .limit(limit);

    return conversations.map((conv) => {
      const messages = conv.messages as Message[];
      const lastMsg = messages[messages.length - 1];
      return {
        id: conv.id,
        noteId: conv.noteId ?? null,
        title: conv.title || "Untitled Conversation",
        lastMessage: lastMsg?.content.substring(0, 80) + "..." || "",
        messageCount: messages.length,
        lastUpdated: conv.updatedAt,
        totalTokens: conv.totalTokens || 0,
      };
    });
  }

  async getRecentConversationById(
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
    console.log(conversation[0]?.messages);
    return {
      message: conversation[0]?.messages as Message[],
      totaltokens: conversation[0]?.totalTokens || 0,
    };
  }

  async getConversationById(
    userId: number,
    conversationId: number,
  ): Promise<{
    message: Message[];
    totaltokens: number;
    title: string;
  } | null> {
    const [conversation] = await db
      .select({
        id: aiConversation.id,
        title: aiConversation.title,
        messages: aiConversation.messages,
        totalTokens: aiConversation.totalTokens,
      })
      .from(aiConversation)
      .where(
        and(
          eq(aiConversation.userId, userId),
          eq(aiConversation.id, conversationId),
        ),
      )
      .limit(1);
    if (!conversation) return null;
    return {
      message: conversation.messages as Message[],
      totaltokens: conversation.totalTokens || 0,
      title: conversation.title || "Untitled",
    };
  }

  async deleteConversation(
    userId: number,
    conversationId: number,
  ): Promise<void> {
    await db
      .delete(aiConversation)
      .where(
        and(
          eq(aiConversation.userId, userId),
          eq(aiConversation.id, conversationId),
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
      id: number;
      noteId: number | null;
      title: string;
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
        title: aiConversation.title,
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
        id: conv.id,
        noteId: conv.noteId ?? null,
        productTitle: noteMap.get(conv.noteId ?? 0) || "Unknown Note",
        title: conv.title || "Untitled",
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
  private async cleanUpconversation(userId: number, limit: number = 10) {
    const countResult = await db
      .select({ count: sql`count(*)`.as("count") })
      .from(aiConversation)
      .where(eq(aiConversation.userId, userId));
    const count = Number(countResult[0]?.count || 0);
    if (count > limit) {
      const toDelete = count - limit;
      const oldest = await db
        .select({ id: aiConversation.id })
        .from(aiConversation)
        .where(eq(aiConversation.userId, userId))
        .orderBy(asc(aiConversation.updatedAt))
        .limit(toDelete);
      if (oldest.length > 0) {
        const idsToDelete = oldest.map((o) => o.id);
        await db
          .delete(aiConversation)
          .where(
            and(
              eq(aiConversation.userId, userId),
              inArray(aiConversation.id, idsToDelete),
            ),
          );
      }
    }
  }
  estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
  }
}

export const conversationservice = new ConversationService();
