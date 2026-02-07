import { Request, Response, NextFunction } from "express";
import { db } from "../DB/db";
import { Themes } from "../DB/schemas";
import { sql, eq } from "drizzle-orm";
import { UserIdRequest } from "../types/interfaces";

const CheckThemes = async (theme: string, userId: number): Promise<Boolean> => {
  const currentThemes = await db
    .select()
    .from(Themes)
    .where(eq(Themes.userId, userId));
  let existingThemes = currentThemes[0]?.themes || [];
  existingThemes = Array.isArray(existingThemes)
    ? existingThemes
    : [existingThemes];
  console.log("existingthemes", existingThemes);
  if (Array.isArray(existingThemes) && existingThemes.includes(theme)) {
    return true;
  }
  console.log(existingThemes);
  return false;
};

//GETTING EXISTING THEMES
export const GetThemes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unathorized", success: false });
    }
    const allThemes = await db
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId));
    console.log("allthemes", allThemes);
    let result = allThemes[0]?.themes || [];
    result = Array.isArray(result) ? result : result ? [result] : [];
    console.log(result);
    return res.status(200).json({ success: true, allthemes: result });
  } catch (error) {
    next(error);
  }
};

//ADDING NEW THEMES
export const AddNewThemes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { themes } = req.body;
    const userId = req.userId;
    if (!themes || !userId) {
      return res.status(400).json({ message: "Missing Data", success: false });
    }
    const duplicatethemes = await CheckThemes(themes, userId);
    if (duplicatethemes) {
      return res.status(400).json({
        success: false,
        message: "Theme already exists",
      });
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
    const existingThemes = Array.isArray(themesonly)
      ? themesonly
      : themesonly
        ? [themesonly]
        : [];
    console.log(existingThemes);
    return res.status(201).json({ success: true, allthemes: existingThemes });
  } catch (error) {
    next(error);
  }
};
