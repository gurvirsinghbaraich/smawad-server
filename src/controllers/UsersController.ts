import { appUser } from "@prisma/client";
import { Request } from "express";
import { ServerError } from "../utils/classes/ServerError";
import { getPrismaClient } from "../utils/getPrismaClient";

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
