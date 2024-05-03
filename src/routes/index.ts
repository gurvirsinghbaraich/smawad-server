import { Router } from "express";
import { concatinate } from "../utils/concatinate";
import { authenticationRouter } from "./authentication";
import { userRouter } from "./users";

// Defining the basepath for all the api endpoints
const apiBasepath = "/api";

// Creating a router to combine all the api endpoints
export const apiRouter = Router();

apiRouter.use(apiBasepath, userRouter);
apiRouter.use(concatinate(apiBasepath, "/auth"), authenticationRouter);
