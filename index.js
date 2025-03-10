import express from "express";
import "dotenv/config";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const { MONGO_URI, PORT } = process.env;

app.use(morgan("common"));
app.use(cors("*"));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" ===== db connected =====");
  })
  .catch((error) => {
    console.log(" ===== db connected =====\n" + error);
  });

app.get("/", (req, res) => {
  res.json({ Message: "Server is good to Go" });
});

app.listen(PORT, () => {
  console.log(`Server is Runnig at Port${PORT}`);
});
