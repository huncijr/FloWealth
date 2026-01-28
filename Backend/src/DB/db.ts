import postgres from "postgres";
import * as schema from "./schemas";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
