import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";

dotenv.config();

const PORT: number = Number(process.env.PORT);
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

app.get("/", (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Succes" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});
app.listen(PORT, () => {
  console.log(`server started on Port: ${process.env.PORT}`);
});
