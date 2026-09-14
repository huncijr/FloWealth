import router from "./routes/Userroutes";
import { errorHandler } from "./middlewares/Errorhandling";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app: Application = express();

const isProduction: boolean = process.env.NODE_ENV === "production";

if (isProduction && !process.env.URL) {
  throw new Error("URL is not Valid!");
}

app.use(cookieParser());

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));

app.use(
  cors({
    origin: isProduction ? process.env.URL : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.get("/API/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/API", router);

app.use(errorHandler);

export default app;
