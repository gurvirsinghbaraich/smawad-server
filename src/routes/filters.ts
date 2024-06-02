import { Router } from "express";
import { FiltersController } from "../controllers/FiltersController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

export const filtersRouter = Router();

filtersRouter.use(useAuth);

filtersRouter.get(
  "/organizations",
  generateResponse(FiltersController.organizationFilters)
);
