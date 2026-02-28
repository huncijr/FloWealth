import { Request, Response, NextFunction } from "express";
import { db } from "../DB/db";
import { notesTable, Themes } from "../DB/schemas";
import { sql, eq, and } from "drizzle-orm";
import { UserIdRequest } from "../types/interfaces";

const getThemeColor = async (themeid: number) => {
  const result = await db
    .select({ color: Themes.color })
    .from(Themes)
    .where(eq(Themes.id, themeid))
    .limit(1);
  console.log("Color result", result);
  return result;
};

const CheckThemes = async (theme: string, userId: number): Promise<Boolean> => {
  const currentThemes = await db
    .select()
    .from(Themes)
    .where(eq(Themes.userId, userId));
  let existingThemes = currentThemes[0]?.themes || [];
  existingThemes = Array.isArray(existingThemes)
    ? existingThemes
    : [existingThemes];
  // console.log("existingthemes", existingThemes);
  if (Array.isArray(existingThemes) && existingThemes.includes(theme)) {
    return true;
  }
  // console.log(existingThemes);
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
      .select({ themes: Themes.themes, color: Themes.color })
      .from(Themes)
      .where(eq(Themes.userId, userId));
    // console.log("allthemes", allThemes);
    let result = allThemes[0]?.themes || [];
    const themeColor = allThemes[0]?.color || "#b7b7b7";

    result = Array.isArray(result) ? result : result ? [result] : [];
    const themesWithColors = result.map((themeName: string) => ({
      name: themeName,
      color: themeColor,
    }));
    // console.log(result);
    return res.status(200).json({ success: true, allthemes: themesWithColors });
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
    const { themes, color } = req.body;
    console.log(themes, color);
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
        color: color || "#b7b7b7",
      })
      .where(eq(Themes.userId, userId))
      .returning({ themes: Themes.themes, color: Themes.color });
    if (updatedTheme.length === 0) {
      const inserted = await db
        .insert(Themes)
        .values({ userId: userId, themes: themes, color: color || "#b7b7b7" })
        .returning({ themes: Themes.themes, color: Themes.color });
      updatedTheme = inserted;
    }
    const themesonly = updatedTheme[0]?.themes;
    const themecolor = updatedTheme[0]?.color || "#b7b7b7";
    // console.log(themesonly);
    const existingThemes = Array.isArray(themesonly)
      ? themesonly
      : themesonly
        ? [themesonly]
        : [];
    const themesWithColors = existingThemes.map((name: string) => ({
      name: name,
      color: themecolor,
    }));
    // console.log(existingThemes);
    return res.status(201).json({ success: true, allthemes: themesWithColors });
  } catch (error) {
    next(error);
  }
};

export const GetNotes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing Data" });
    }
    const result = await db
      .select({
        id: notesTable.id,
        theme: notesTable.theme,
        color: Themes.color,
        productTitle: notesTable.productTitle,
        products: notesTable.products,
        estcost: notesTable.estcost,
        completed: notesTable.completed,
        estimatedTime: notesTable.estimatedTime,
        createdAt: notesTable.createdAt,
      })
      .from(notesTable)
      .leftJoin(Themes, eq(notesTable.themeId, Themes.id))
      .where(eq(notesTable.userId, userId!));

    // console.log(result);
    return res.status(200).json({
      success: true,
      note: result,
    });
  } catch (error) {
    next(error);
  }
};

//ADDING NEW NOTES
export const AddNotes = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const {
      Theme,
      ProductTitle,
      ProductNames,
      Quantities,
      EstPrices,
      Cost,
      Date: dateData,
    } = req.body;

    if (!userId && !ProductTitle && !ProductNames) {
      return res.status(400).json({ message: "Missing Data", success: false });
    }
    let result;
    let themecolor = null;
    if (Theme) {
      result = await db
        .select({ id: Themes.id, color: Themes.color })
        .from(Themes)
        .where(eq(Themes.userId, userId!))
        .limit(1);
    }
    let themeid;
    if (result && result.length > 0) {
      themeid = result[0]?.id || null;
      themecolor = result[0]?.color || null;
    }
    const products = ProductNames.map((name: string, index: number) => ({
      name: name,
      quantity: Quantities[index],
      estprice: EstPrices[index],
    }));

    const jsDate =
      dateData &&
      new Date(
        dateData.year,
        dateData.month,
        dateData.day,
        dateData.hour,
        dateData.minute,
      );
    const [newnote] = await db
      .insert(notesTable)
      .values({
        userId: userId!,
        themeId: themeid!,
        theme: Theme || null,
        productTitle: ProductTitle,
        products: products,
        estimatedTime: jsDate,
        estcost: Cost,
      })
      .returning();
    // console.log(newnote);
    return res.status(201).json({
      success: true,
      note: {
        id: newnote?.id,
        theme: newnote?.theme,
        color: themecolor,
        productTitle: newnote?.productTitle,
        products: newnote?.products,
        estcost: newnote?.estcost,
        estimatedTime: newnote?.estimatedTime,
        completed: newnote?.completed,
        createdAt: newnote?.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteNote = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id as string);
    // console.log(id, userId);
    if (!userId || isNaN(id)) {
      return res.status(400).json({ message: "Missing data", success: false });
    }
    const deleted = await db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
      .returning();
    if (deleted.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const CompleteNote = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id as string);
    const { picture, message } = req.body;
    if (!userId || isNaN(id)) {
      return res.status(400).json({ message: "Missing data", success: false });
    }
    const completedNote = await db
      .update(notesTable)
      .set({
        completed: true,
        picture: picture ?? null,
        message: message ?? null,
      })
      .where(and(eq(notesTable.userId, userId), eq(notesTable.id, id)))
      .returning();

    console.log("completenote", completedNote);
    if (!completedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
    return res.status(200).json({ success: true, note: completedNote });
  } catch (error) {
    next(error);
  }
};

export const UpdateNote = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const {
      id,
      theme,
      color,
      productTitle,
      products,
      estimatedTime,
      estcost,
      message,
      picture,
    } = req.body;
    console.log(color);
    if (!userId || !id) {
      return res
        .status(400)
        .json({ success: false, changed: false, message: "Missing data" });
    }
    const [existingNote] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
      .limit(1);
    console.log(existingNote);
    if (!existingNote) {
      return res
        .status(404)
        .json({ success: false, changed: false, message: "Note not found" });
    }
    const currentData = {
      theme: existingNote.theme,
      productTitle: existingNote.productTitle,
      products: existingNote.products,
      estimatedTime: existingNote.estimatedTime?.toISOString() || null,
      estcost: existingNote.estcost,
    };
    const newData = {
      theme: theme || null,
      productTitle: productTitle,
      products: products,
      estimatedTime: estimatedTime || null,
      estcost: estcost,
    };
    if (JSON.stringify(currentData) === JSON.stringify(newData)) {
      return res.status(200).json({
        success: true,
        changed: false,
        message: "No changes detected",
      });
    }

    const [updatedNote] = await db
      .update(notesTable)
      .set({
        theme: theme || null,
        productTitle: productTitle,
        products: products,
        estimatedTime: estimatedTime ? new Date(estimatedTime) : null,
        estcost: estcost?.toString() || 0,
        message: message,
        picture: picture,
      })
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
      .returning();

    console.log("updatenote", updatedNote);
    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        changed: false,
        message: "Not not found",
      });
    }

    let themecolor = color;
    if (!themecolor && theme) {
      const themeResult = await db
        .select({ color: Themes.color })
        .from(Themes)
        .where(and(eq(Themes.userId, userId)))
        .limit(1);
      themecolor = themeResult[0]?.color || "#b7b7b7";
    }
    themecolor = themecolor || "#b7b7b7";
    return res.status(200).json({
      success: true,
      changed: true,
      note: {
        id: updatedNote.id,
        theme: updatedNote.theme,
        color: themecolor,
        productTitle: updatedNote.productTitle,
        products: updatedNote.products,
        estcost: updatedNote.estcost,
        estimatedTime: updatedNote.estimatedTime,
        completed: updatedNote.completed,
        createdAt: updatedNote.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
