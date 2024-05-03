import { appUser } from "@prisma/client";
import { Request } from "express";
import { ServerError } from "../utils/classes/ServerError";
import { getPrismaClient } from "../utils/getPrismaClient";
import { isAuthenticated } from "../utils/isAuthenticated";

export class UsersController {
  public static async fetchUser(query: {
    where: Partial<appUser>;
    select?: Partial<Record<keyof appUser, boolean>>;
  }): Promise<appUser | null> {
    const client = getPrismaClient();

    return await client.appUser.findFirst({
      where: query.where,
      select: query.select,
    });
  }

  public static async getUser(request: Request) {
    // Making sure the user has rights to perform the actions.
    // TODO: Shift the authentication logic to middlewares
    if (!isAuthenticated(request)) {
      throw new ServerError({
        statusCode: 401,
        message: "You are not authorized to access the resource!",
      });
    }

    // Getting the 'userId' from the request.
    const userId = request.params.userId;

    if (!userId) {
      throw new ServerError({
        statusCode: 400,
        message: "Bad Request",
      });
    }

    return await UsersController.fetchUser({
      where: {
        userId: +userId,
      },
      select: {
        userId: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        isActive: true,
        phoneNumber: true,
        prefix: true,
        createdBy: true,
        createdOn: true,
        updatedBy: true,
        updatedOn: true,
      },
    });
  }
}
