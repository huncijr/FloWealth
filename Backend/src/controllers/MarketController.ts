import { Request, Response, NextFunction } from "express";
import {
  getAllMarketData,
  getCryptoPrices,
  getStockQuotes,
  getForexRates,
  getCommodities,
  searchMarket,
} from "../services/MarketService";
import { getChartData } from "../services/MarketChartService";

export const marketAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllMarketData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketCrypto = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCryptoPrices();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketStocks = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getStockQuotes();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketForex = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getForexRates();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketCommodities = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCommodities();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.query.q as string) || "";
    const data = await searchMarket(query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const marketChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { symbol, type, name, range } = req.query;
    if (!symbol || !type || !name) {
      res
        .status(400)
        .json({
          success: false,
          message: "symbol, type, and name are required",
        });
      return;
    }
    const validTypes = ["stock", "crypto", "forex", "commodity"];
    if (!validTypes.includes(String(type))) {
      res.status(400).json({ success: false, message: "Invalid type" });
      return;
    }
    const data = await getChartData(
      String(symbol),
      String(type) as "stock" | "crypto" | "forex" | "commodity",
      String(name),
      String(range || "1M"),
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
