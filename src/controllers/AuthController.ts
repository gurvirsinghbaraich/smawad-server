import { Request } from "express";
import { ServerError } from "../utils/classes/ServerError";
import { getPropertiesFromRequestBody } from "../utils/getPropertiesFromRequestBody";
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
  // The function is responsible for authentication the user.
  public static async signIn(request: Request) {
    const payload = getPropertiesFromRequestBody(request, [
      "email",
      "password",
    ]);

    if (payload.status === "FATAL") {
      throw new ServerError({
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
}
