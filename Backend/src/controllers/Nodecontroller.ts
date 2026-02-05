import { Request, Response, NextFunction } from "express";
import { db } from "../DB/db";
import { Themes } from "../DB/schemas";
import { sql, eq } from "drizzle-orm";
import { UserIdRequest } from "../types/interfaces";

export const AddNewThemes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { themes } = req.body;
    const userId = req.userId;
    console.log(userId, themes);
    if (!themes || !userId) {
      return res.status(400).json({ message: "Missing Data", success: false });
    }
    let updatedTheme;
    updatedTheme = await db
      .update(Themes)
      .set({
        themes: sql`${Themes.themes} || ${JSON.stringify([themes])}::jsonb`,
      })
      .where(eq(Themes.userId, userId))
      .returning({ themes: Themes.themes });
    if (updatedTheme.length === 0) {
      const inserted = await db
        .insert(Themes)
        .values({ userId: userId, themes: themes })
        .returning({ themes: Themes.themes });
      updatedTheme = inserted;
    }
    const themesonly = updatedTheme[0]?.themes;
    console.log(themesonly);
    return res.status(201).json({ success: true, allthemes: themesonly });
  } catch (error) {
    next(error);
  }
};
