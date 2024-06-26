import { Router } from "express";
import { concatinate } from "../utils/concatinate";
import { authenticationRouter } from "./authentication";
import { branchesRouter } from "./branches";
import { filtersRouter } from "./filters";
import { lookupRouter } from "./lookup";
import { organizationRouter } from "./organizations";
import { userRouter } from "./users";

// Defining the basepath for all the api endpoints
const apiBasepath = "/api";

// Creating a router to combine all the api endpoints
export const apiRouter = Router();

apiRouter.use(concatinate(apiBasepath, "/users"), userRouter);
apiRouter.use(concatinate(apiBasepath, "/auth"), authenticationRouter);
apiRouter.use(concatinate(apiBasepath, "/organizations"), organizationRouter);
apiRouter.use(concatinate(apiBasepath, "/lookup"), lookupRouter);
apiRouter.use(concatinate(apiBasepath, "/branches"), branchesRouter);
apiRouter.use(concatinate(apiBasepath, "/filters"), filtersRouter);
