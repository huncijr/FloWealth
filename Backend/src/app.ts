import router from "./routes/Userroutes";
import { errorHandler } from "./middlewares/Errorhandling";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();

const isDevelopment: boolean = process.env.NODE_ENV === "production";

if (!isDevelopment && !process.env.URL) {
  throw new Error("URL is not Valid!");
}

app.use(
  cors({
    origin: isDevelopment ? process.env.URL : "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/API", router);

app.use(errorHandler);

export default app;
