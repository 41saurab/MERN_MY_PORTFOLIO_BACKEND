import express from "express";
import { register, login, logout, getUser, updateProfile, forgotPassword, resetPassword, updatePassword, getUserForPortfolio } from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/me", isAuthenticated, getUser);
userRouter.put("/update/profile", isAuthenticated, updateProfile);
userRouter.put("/update/password", isAuthenticated, updatePassword);
userRouter.get("/portfolio", getUserForPortfolio);
userRouter.post("/password/forgot", forgotPassword);
userRouter.put("/password/reset/:token", resetPassword);

export default userRouter;
