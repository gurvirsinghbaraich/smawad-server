import { NextFunction, Request, Response } from "express";
import { isAuthenticated } from "../utils/isAuthenticated";

// The following function would be used to authorize the request.
export async function useAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // If the user is not logged in, the user should not be able to access the resource.
  if (!isAuthenticated(request)) {
    return response.status(401).json({
      data: null,
      status: "FATAL",
      message: "You are not authorized to access this resource.",
    });
  }

  return next();
}
