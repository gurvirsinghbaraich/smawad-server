import { Router } from "express";
import { OrganizationController } from "../controllers/OrganizationsController";
import { useAuth } from "../middlewares/useAuth";
import { generateResponse } from "../utils/generateResponse";

// Creating a router to handle all the request that are related to organizations
export const organizationRouter = Router();

// Middleware that marks all endpoints to only be accessed if the user is logged in.
organizationRouter.use(useAuth);

// Defining the endpoints for @organizationRouter
organizationRouter.get(
  "/",
  generateResponse(OrganizationController.listOrganizations)
);
organizationRouter.get(
  "/:organizationId",
  generateResponse(OrganizationController.getOrganization)
);
organizationRouter.post(
  "/create",
  generateResponse(OrganizationController.createOrganizatoin)
);
organizationRouter.post(
  "/update",
  generateResponse(OrganizationController.patchOrganization)
);

organizationRouter.post(
  "/delete",
  generateResponse(OrganizationController.makeOrganizationInactive)
);

organizationRouter.post(
  "/bulk-delete",
  generateResponse(OrganizationController.bulkMakeOrganizationsInactive)
);
