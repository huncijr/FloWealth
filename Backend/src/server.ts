import dotenv from "dotenv";
import app from "./app";
dotenv.config();

const PORT: number = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`server started on Port: ${PORT}`);
});
