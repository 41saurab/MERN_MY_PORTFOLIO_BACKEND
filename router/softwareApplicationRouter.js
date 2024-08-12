import express from "express";
import {addNewApplication,deleteApplication,getAllApplications} from "../controllers/softwareApplicationControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const softwareAppplicationRouter = express.Router();

softwareAppplicationRouter.post("/add", addNewApplication);
softwareAppplicationRouter.delete("/delete/:id", isAuthenticated, deleteApplication);
softwareAppplicationRouter.get("/allsoftwares", getAllApplications);

export default softwareAppplicationRouter;
