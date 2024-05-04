import { Router } from "express";
import { LookupController } from "../controllers/LookupController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

export const lookupRouter = Router();
lookupRouter.use(useAuth);

// Defining API endpoints for lookup
lookupRouter.get(
  "/organization-types",
  generateResponse(LookupController.listOrganizationTypes)
);
lookupRouter.get(
  "/industry-types",
  generateResponse(LookupController.listIndustryTypes)
);
lookupRouter.get(
  "/address-types",
  generateResponse(LookupController.listAddressTypes)
);
lookupRouter.get("/cities", generateResponse(LookupController.listCities));
lookupRouter.get("/states", generateResponse(LookupController.listStates));
lookupRouter.get(
  "/countries",
  generateResponse(LookupController.listCountries)
);
lookupRouter.get(
  "/phone-number-types",
  generateResponse(LookupController.listPhoneNumbers)
);
