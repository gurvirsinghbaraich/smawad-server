import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { generateResponse } from "../utils/generateResponse";

// Creating a seperate router handle request are related to authentication.
export const authenticationRouter = Router();

authenticationRouter.get(
  "/authenticated-status",
  generateResponse(AuthController.loggedInStatus)
);
authenticationRouter.purge(
  "/31bf6eeac771aeb68c3e2b1a5a7b830bac6e364963060166db20a77c20687023",
  generateResponse(AuthController.signOut)
);
authenticationRouter.post("/sign-in", generateResponse(AuthController.signIn));
