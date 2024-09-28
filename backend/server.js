import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";

import cors from "cors";
import router from "./routes/index.js";
dotenv.config();
const app = express();

app.use(cors({ credentials: true, origin: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.get("/*", (req, res) => {
  res.json({message: "Welcome to the Railway Management System API"});
});

app.listen(process.env.PORT || 80, () =>
  console.log(`Server running at port ${process.env.PORT || 80}`)
);
