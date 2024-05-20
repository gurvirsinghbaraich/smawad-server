import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

// Creating a seperate router for the users.
export const userRouter = Router();

userRouter.use(useAuth);
userRouter.get("/", generateResponse(UsersController.listUsers));
userRouter.get("/my-profile", generateResponse(UsersController.getMyProfile));
userRouter.get("/:userId", generateResponse(UsersController.getUser));

userRouter.post("/update", generateResponse(UsersController.updateUser));
userRouter.post("/create", generateResponse(UsersController.createUser));
userRouter.post("/delete", generateResponse(UsersController.deleteUser));
userRouter.post(
  "/bulk-delete",
  generateResponse(UsersController.bulkDeleteUser)
);
