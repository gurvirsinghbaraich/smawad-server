import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { generateResponse } from "../utils/generateResponse";

// Creating a seperate router for the users.
export const userRouter = Router();

userRouter.get("/users/:userId", generateResponse(UsersController.getUser));
