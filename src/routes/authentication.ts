import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { generateResponse } from "../utils/generateResponse";

// Creating a seperate router handle request are related to authentication.
export const authenticationRouter = Router();

authenticationRouter.post("/sign-in", generateResponse(AuthController.signIn));
