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
  "/organization-types/:orgTypeId",
  generateResponse(LookupController.getOrganizationType)
);

lookupRouter.get(
  "/industry-types",
  generateResponse(LookupController.listIndustryTypes)
);
lookupRouter.get(
  "/industry-types/:industryTypeId",
  generateResponse(LookupController.listIndustryType)
);

lookupRouter.get(
  "/address-types",
  generateResponse(LookupController.listAddressTypes)
);
lookupRouter.get("/citites/", generateResponse(LookupController.listCities));
lookupRouter.get(
  "/cities/:cityId",
  generateResponse(LookupController.listCity)
);

lookupRouter.get("/states", generateResponse(LookupController.listStates));
lookupRouter.get(
  "/states/:countryStateId",
  generateResponse(LookupController.listState)
);

lookupRouter.get(
  "/countries",
  generateResponse(LookupController.listCountries)
);
lookupRouter.get(
  "/countries/:countryId",
  generateResponse(LookupController.listCountry)
);

lookupRouter.get(
  "/phone-number-types",
  generateResponse(LookupController.listPhoneNumbers)
);
