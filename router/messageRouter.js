import express from "express";
import { deleteMessage, getAllMessages, sendMessage } from "../controllers/messageControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const messageRouter = express.Router();

messageRouter.post("/send", sendMessage);
messageRouter.delete("/delete/:id", isAuthenticated, deleteMessage);
messageRouter.get("/allmessages", isAuthenticated, getAllMessages);

export default messageRouter;
