import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { generateResponse } from "../utils/generateResponse";

// Creating a separate router to handle requests related to authentication.
export const authenticationRouter = Router();

authenticationRouter.get(
  "/authenticated-status",
  generateResponse(AuthController.loggedInStatus)
);
authenticationRouter.purge("/logout", generateResponse(AuthController.signOut));
authenticationRouter.post("/sign-in", generateResponse(AuthController.signIn));

// Adding routes for password reset
authenticationRouter.post(
  "/request-password-reset",
  generateResponse(AuthController.requestPasswordReset)
);
authenticationRouter.post(
  "/reset-password",
  generateResponse(AuthController.resetPassword)
);
