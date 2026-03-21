import { Request, Response, NextFunction } from "express";
import { db } from "../DB/db";
import { notesTable, Themes } from "../DB/schemas";
import { sql, eq, and, ne, desc, asc } from "drizzle-orm";
import { UserIdRequest } from "../types/interfaces";

interface ThemeName {
  id: number;
  name: string;
  color: string;
}

const CheckThemes = async (
  themeName: string,
  userId: number,
): Promise<Boolean> => {
  const currentThemes = await db
    .select()
    .from(Themes)
    .where(eq(Themes.userId, userId));
  let existingThemes = currentThemes[0]?.themes || [];
  existingThemes = Array.isArray(existingThemes)
    ? existingThemes
    : [existingThemes];
  // console.log("existingthemes", existingThemes);
  if (existingThemes.some((t) => t.name === themeName)) {
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
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId));
    // console.log("allthemes", allThemes);
    let result = allThemes[0]?.themes || [];
    // console.log(result);
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
    const { themes: ThemeName, color } = req.body;
    console.log(ThemeName, color);
    const userId = req.userId;

    if (!ThemeName || !userId) {
      return res.status(400).json({ message: "Missing Data", success: false });
    }

    // Check if theme with this name already exists
    const duplicatethemes = await CheckThemes(ThemeName, userId);
    if (duplicatethemes) {
      return res.status(400).json({
        success: false,
        message: "Theme already exists",
      });
    }

    // Fetch existing themes from DB to determine the next ID
    const currentThemeResult = await db
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId));

    const existingThemes = currentThemeResult[0]?.themes || [];

    // Calculate next ID:
    const maxId =
      existingThemes.length > 0
        ? Math.max(...existingThemes.map((t: any) => t.id || 0))
        : 0;
    const nextId = maxId + 1;

    // Create new theme object WITH the auto-generated ID
    const newThemeItem = {
      id: nextId,
      name: ThemeName,
      color: color || "#b7b7b7",
    };
    console.log(newThemeItem);

    // Try to update existing row (append new theme to JSONB array)
    let updatedTheme;
    updatedTheme = await db
      .update(Themes)
      .set({
        themes: sql`${Themes.themes} || ${JSON.stringify([newThemeItem])}::jsonb`,
      })
      .where(eq(Themes.userId, userId))
      .returning({ themes: Themes.themes });

    // If no row was updated (user has no themes yet), insert new row
    if (updatedTheme.length === 0) {
      const inserted = await db
        .insert(Themes)
        .values({ userId: userId, themes: [newThemeItem] })
        .returning({ themes: Themes.themes });
      updatedTheme = inserted;
    }

    console.log(updatedTheme);

    // Get the actual updated themes from the DB result
    const result = updatedTheme[0]?.themes || [];

    console.log(result);
    return res.status(201).json({ success: true, allthemes: result });
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
  const page = parseInt(req.query.page as string) || 1;
  const sort = (req.query.sort as string) || "created";
  const limit = 5;
  const offset = (page - 1) * limit;
  console.log("page", page, "limit", limit, "offset", offset);
  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing Data" });
    }
    let orderby;
    switch (sort) {
      case "Created":
        orderby = desc(notesTable.createdAt);
        break;
      case "Completed":
        orderby = desc(notesTable.completed);
        break;
      case "Upcoming":
        orderby = asc(notesTable.estimatedTime);
        break;
      case "Available":
        orderby = asc(notesTable.completed);
        break;
      default:
        orderby = desc(notesTable.createdAt);
    }
    const userThemesData = await db
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId!));
    const allThemes: { name: string; color: string }[] =
      userThemesData[0]?.themes || [];

    const countresult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notesTable)
      .where(eq(notesTable.userId, userId));

    const totalcount = countresult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalcount / limit);

    const notes = await db
      .select({
        id: notesTable.id,
        theme: notesTable.theme,
        productTitle: notesTable.productTitle,
        products: notesTable.products,
        estcost: notesTable.estcost,
        completed: notesTable.completed,
        estimatedTime: notesTable.estimatedTime,
        createdAt: notesTable.createdAt,
        picture: notesTable.picture,
        message: notesTable.message,
      })
      .from(notesTable)
      .where(eq(notesTable.userId, userId!))
      .limit(limit)
      .offset(offset)
      .orderBy(orderby);

    const result = notes.map((note) => {
      const themeObj = allThemes.find((t) => t.name === note.theme);
      return { ...note, color: themeObj?.color || "#b7b7b7" };
    });
    console.log(result);
    return res.status(200).json({
      success: true,
      note: result,
      totalPages,
      currentPage: page,
      totalCount: totalcount,
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
      Color,
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
    let themeid = null;
    if (Theme) {
      const themeResult = await db
        .select({ themes: Themes.themes })
        .from(Themes)
        .where(eq(Themes.userId, userId!))
        .limit(1);
      const themesArray = themeResult[0]?.themes || [];
      const selectedTheme = themesArray.find((t: any) => t.name === Theme);
      themeid = selectedTheme?.id || null;
    }

    let themecolor = Color || "#b7b7b7";

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
        themeId: themeid,
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
      const userThemes = await db
        .select({ themes: Themes.themes })
        .from(Themes)
        .where(and(eq(Themes.userId, userId)))
        .limit(1);
      const themesArray: { name: string; color: string }[] =
        userThemes[0]?.themes || [];
      const foundTheme = themesArray.find((t: any) => t.name === theme);
      themecolor = foundTheme?.color || "#b7b7b7";
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

export const DeleteTheme = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const themeId = parseInt(req.params.themeId as string);

    if (!userId || !themeId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    await db
      .delete(notesTable)
      .where(
        and(eq(notesTable.userId, userId), eq(notesTable.themeId, themeId)),
      );

    const userThemes = await db
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId));

    if (userThemes.length > 0) {
      const currentThemes = userThemes[0]?.themes || [];
      const updatedThemes = currentThemes.filter((t: any) => t.id !== themeId);

      await db
        .update(Themes)
        .set({ themes: updatedThemes })
        .where(eq(Themes.userId, userId));
    }

    return res.status(200).json({ success: true, message: "Theme deleted" });
  } catch (error) {
    next(error);
  }
};

export const GetThemeStats = async (
  req: UserIdRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unathorized" });
    }
    const daysBack = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const userThemes = await db
      .select({ themes: Themes.themes })
      .from(Themes)
      .where(eq(Themes.userId, userId));

    const themes: ThemeName[] = (userThemes[0]?.themes as ThemeName[]) || [];
    // console.log("themes", themes);

    const themesWithStats = await Promise.all(
      themes.map(async (theme) => {
        const notes = await db
          .select({
            id: notesTable.id,
            productTitle: notesTable.productTitle,
            createdAt: notesTable.createdAt,
            completed: notesTable.completed,
          })
          .from(notesTable)
          .where(
            and(
              eq(notesTable.userId, userId),
              eq(notesTable.theme, theme.name),
              sql`${notesTable.createdAt} >= ${startDate.toISOString().slice(0, 10)}::date`,
            ),
          );
        const dailyStats: Record<
          string,
          {
            count: number;
            notes: Array<{ title: string; completed: boolean | null }>;
          }
        > = {};
        for (let i = 0; i < daysBack; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split("T")[0]!;
          dailyStats[dateKey] = { count: 0, notes: [] };
        }
        // console.log(notes.length);
        // console.log(dailyStats);

        notes.forEach((note) => {
          const dateKey = new Date(note.createdAt).toISOString().split("T")[0];
          if (dateKey) {
            if (dailyStats[dateKey]) {
              dailyStats[dateKey].count += 1;
              dailyStats[dateKey].notes.push({
                title: note.productTitle,
                completed: note.completed,
              });
            }
          }
        });
        return {
          id: theme.id,
          name: theme.name,
          color: theme.color,
          dailyStats,
        };
      }),
    );
    return res.status(200).json({ success: true, stats: themesWithStats });
  } catch (error) {
    next(error);
  }
};
