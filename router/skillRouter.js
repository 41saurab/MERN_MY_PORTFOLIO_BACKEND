import express from "express";
import { addNewSkill, deleteSkill, getAllSkills, updateSkill } from "../controllers/skillControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const skillRouter = express.Router();

skillRouter.post("/add", addNewSkill);
skillRouter.delete("/delete/:id", isAuthenticated, deleteSkill);
skillRouter.get("/allskills", getAllSkills);
skillRouter.put("/update/:id", isAuthenticated, updateSkill);

export default skillRouter;
