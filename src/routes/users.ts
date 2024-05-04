import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

// Creating a seperate router for the users.
export const userRouter = Router();

userRouter.use(useAuth);
userRouter.get("/:userId", generateResponse(UsersController.getUser));
