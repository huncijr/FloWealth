import { Request, Response, NextFunction } from "express";
import {
  getAllMarketData,
  getCryptoPrices,
  getStockQuotes,
  getForexRates,
  getCommodities,
  searchMarket,
} from "../services/MarketService";

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
