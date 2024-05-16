import { Router } from "express";
import { BranchesController } from "../controllers/BranchesController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

export const branchesRouter = Router();
branchesRouter.use(useAuth);

branchesRouter.get("/", generateResponse(BranchesController.listBranches));
branchesRouter.get(
  "/:orgBranchId",
  generateResponse(BranchesController.getBranch)
);
branchesRouter.post(
  "/update",
  generateResponse(BranchesController.updateBranch)
);
branchesRouter.post(
  "/create",
  generateResponse(BranchesController.createBranch)
);
branchesRouter.post(
  "/delete",
  generateResponse(BranchesController.deleteBranch)
);
branchesRouter.post(
  "/bulk-delete",
  generateResponse(BranchesController.bulkDeleteBranches)
);
