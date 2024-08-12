import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./database/dbConnection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRouter.js";
import messageRouter from "./router/messageRouter.js";
import timelineRouter from "./router/timelineRouter.js";
import skillRouter from "./router/skillRouter.js";
import softwareAppplicationRouter from "./router/softwareApplicationRouter.js";
import projectRouter from "./router/projectRouter.js";

const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/softwareapplication", softwareAppplicationRouter);
app.use("/api/v1/project", projectRouter);

dbConnection();

// Error middleware should be the last middleware
app.use(errorMiddleware);

export default app;
