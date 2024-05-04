import { Request } from "express";
import { createError } from "../utils/createError";
import { getPropertiesFromRequest } from "../utils/getPropertiesFromRequest";
import { isAuthenticated } from "../utils/isAuthenticated";
import { UsersController } from "./UsersController";

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
    user: null | {
      userId: number;
      email: string;
      name: string;
    };
  }
}

export class AuthController {
  // The function would be responsible to get the authentication status.
  public static async loggedInStatus(request: Request) {
    return {
      status: isAuthenticated(request),
    };
  }

  // The function is responsible for authentication the user.
  public static async signIn(request: Request) {
    const payload = getPropertiesFromRequest(request.body, [
      "email",
      "password",
    ]);

    if (payload.status === "FATAL") {
      createError({
        statusCode: 400,
        message: payload.message,
      });
    }

    const user = await UsersController.fetchUser({
      where: {
        email: payload.properties.email as string,
        userPassword: payload.properties.password as string,
      },
    });

    if (!user) {
      // Saving the user to the session
      request.session.user = null;

      // Saving the user authentication status
      request.session.authenticated = false;

      return {
        user: null,
        authenticated: false,
      };
    }

    // Saving the user to the session
    request.session.user = {
      userId: user.userId,
      email: user.email,
      name: user.firstName,
    };

    // Saving the user authentication status
    request.session.authenticated = true;

    return {
      user: request.session.user,
      authenticated: request.session.authenticated,
    };
  }

  // The function is responsible for logging out the user.
  public static async signOut(request: Request) {
    // Destroy the session
    return await new Promise((resolve) => {
      request.session.destroy((error) => {
        if (error) {
          resolve({
            loggedOut: false,
          });
        } else {
          resolve({
            loggedOut: true,
          });
        }
      });
    });
  }
}
