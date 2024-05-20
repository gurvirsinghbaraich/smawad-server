import { Request } from "express";
import z from "zod";
import { createError } from "../utils/createError";
import { isAuthenticated } from "../utils/isAuthenticated";
import {
  generateResetToken,
  verifyResetToken,
} from "../utils/resetTokenManager"; // Assume these are utility functions you've created for handling tokens
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
    const signInSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const payload = signInSchema.parse(request.body);

    const user = await UsersController.fetchUser({
      where: {
        email: payload.email,
        userPassword: payload.password,
      },
    });

    if (!user || !user.isActive) {
      request.session.user = null;
      request.session.authenticated = false;

      return {
        user: null,
        authenticated: false,
      };
    }

    request.session.user = {
      userId: user.userId,
      email: user.email,
      name: user.firstName,
    };

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

  // The function is responsible for initiating the password reset process.
  public static async requestPasswordReset(request: Request) {
    const requestPasswordResetSchema = z.object({
      email: z.string().email(),
    });

    const payload = requestPasswordResetSchema.parse(request.body);

    const user = await UsersController.fetchUser({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    const resetToken = generateResetToken(user.userId);

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return {
      message: "Password reset token generated and logged to the console",
    };
  }

  // The function is responsible for resetting the user's password.
  public static async resetPassword(request: Request) {
    const resetPasswordSchema = z.object({
      token: z.string().min(1),
      newPassword: z.string().min(6),
    });

    const payload = resetPasswordSchema.parse(request.body);

    const userId = verifyResetToken(payload.token);

    if (!userId) {
      createError({
        statusCode: 400,
        message: "Invalid or expired token",
      });
    }

    await UsersController.updateUserPassword(userId, payload.newPassword);

    return {
      message: "Password has been reset",
    };
  }
}
