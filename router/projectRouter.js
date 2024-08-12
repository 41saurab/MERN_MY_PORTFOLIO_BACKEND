import express from "express";
import { addNewProject, deleteProject, getAllProjects, getSingleProject, updateProject } from "../controllers/projectControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const projectRouter = express.Router();

projectRouter.post("/add", isAuthenticated, addNewProject);
projectRouter.delete("/delete/:id", isAuthenticated, deleteProject);
projectRouter.put("/update/:id", isAuthenticated, updateProject);
projectRouter.get("/getall", getAllProjects);
projectRouter.get("/get/:id", getSingleProject);

export default projectRouter;
