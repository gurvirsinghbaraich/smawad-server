import { Router } from "express";
import { LookupController } from "../controllers/LookupController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

export const lookupRouter = Router();
lookupRouter.use(useAuth);

// Organization Types
lookupRouter.get(
  "/organization-types",
  generateResponse(LookupController.listOrganizationTypes)
);
lookupRouter.get(
  "/organization-types/:orgTypeId",
  generateResponse(LookupController.getOrganizationType)
);
lookupRouter.post(
  "/organization-types",
  generateResponse(LookupController.createOrganizationType)
);
lookupRouter.post(
  "/organization-types/:orgTypeId",
  generateResponse(LookupController.updateOrganizationType)
);

// Industry Types
lookupRouter.get(
  "/industry-types",
  generateResponse(LookupController.listIndustryTypes)
);
lookupRouter.get(
  "/industry-types/:industryTypeId",
  generateResponse(LookupController.getIndustryType)
);
lookupRouter.post(
  "/industry-types",
  generateResponse(LookupController.createIndustryType)
);
lookupRouter.post(
  "/industry-types/:industryTypeId",
  generateResponse(LookupController.updateIndustryType)
);

// Country States
lookupRouter.get("/states", generateResponse(LookupController.listStates));
lookupRouter.get(
  "/states/:countryStateId",
  generateResponse(LookupController.getState)
);
lookupRouter.post("/states", generateResponse(LookupController.createState));
lookupRouter.post(
  "/states/:countryStateId",
  generateResponse(LookupController.updateState)
);

// Cities
lookupRouter.get("/cities", generateResponse(LookupController.listCities));
lookupRouter.get("/cities/:cityId", generateResponse(LookupController.getCity));
lookupRouter.post("/cities", generateResponse(LookupController.createCity));
lookupRouter.post(
  "/cities/:cityId",
  generateResponse(LookupController.updateCity)
);

// Countries
lookupRouter.get(
  "/countries",
  generateResponse(LookupController.listCountries)
);
lookupRouter.get(
  "/countries/:countryId",
  generateResponse(LookupController.getCountry)
);
lookupRouter.post(
  "/countries",
  generateResponse(LookupController.createCountry)
);
lookupRouter.post(
  "/countries/:countryId",
  generateResponse(LookupController.updateCountry)
);

// Phone Number Types
lookupRouter.get(
  "/phone-number-types",
  generateResponse(LookupController.listPhoneNumbers)
);
lookupRouter.get(
  "/phone-number-types/:phoneNumberTypeId",
  generateResponse(LookupController.getPhoneNumber)
);
lookupRouter.post(
  "/phone-number-types",
  generateResponse(LookupController.createPhoneNumber)
);
lookupRouter.post(
  "/phone-number-types/:phoneNumberTypeId",
  generateResponse(LookupController.updatePhoneNumber)
);
