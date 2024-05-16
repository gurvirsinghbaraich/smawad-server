import { Prisma, appUser } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request } from "express";
import z from "zod";
import { createError } from "../utils/createError";
import { getPrismaClient } from "../utils/getPrismaClient";
import { paginate } from "../utils/paginate";

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

  public static async listUsers(request: Request) {
    let usersConfig: Prisma.appUserFindManyArgs<DefaultArgs> = {
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
    };

    const { search } = z
      .object({
        search: z.string().optional(),
      })
      .parse(request.query);

    if (search) {
      usersConfig = {
        ...usersConfig,
        where: {
          OR: [
            {
              firstName: {
                contains: search,
              },
            },
            {
              lastName: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
            {
              phoneNumber: {
                contains: search,
              },
            },
          ],
        },
      };
    }

    const client = getPrismaClient();

    const [users, total] = await client.$transaction([
      client.appUser.findMany({
        ...paginate(request),
        ...usersConfig,
      }),
      client.appUser.aggregate({
        _count: true,
        where: usersConfig.where,
      }),
    ]);

    return {
      users: JSON.parse(
        JSON.stringify(users, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      ),
      total: total._count,
    };
  }

  public static async getUser(request: Request) {
    // Getting the 'userId' from the request.
    const userId = request.params.userId;

    if (!userId) {
      createError({
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

  public static async updateUser(request: Request) {
    const {
      email,
      firstName,
      isActive,
      lastName,
      middleName,
      phoneNumber,
      userId,
    } = z
      .object({
        userId: z.number(),
        isActive: z.boolean(),
        firstName: z.string(),
        middleName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phoneNumber: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    const changes = await client.appUser.update({
      where: {
        userId,
      },
      data: {
        isActive,
        email,
        firstName,
        lastName,
        middleName,
        phoneNumber,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "MODIFIED",
        data: changes,
      },
    };
  }

  public static async createUser(request: Request) {
    const {
      email,
      userPassword,
      firstName,
      isActive,
      lastName,
      middleName,
      phoneNumber,
    } = z
      .object({
        isActive: z.boolean(),
        firstName: z.string(),
        middleName: z.string(),
        lastName: z.string(),
        email: z.string(),
        userPassword: z.string(),
        phoneNumber: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    const changes = await client.appUser.create({
      data: {
        isActive,
        email,
        firstName,
        lastName,
        middleName,
        phoneNumber,
        userPassword,
        createdBy: request.session.user!.userId,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "CREATED",
        data: changes,
      },
    };
  }

  public static async deleteUser(request: Request) {
    const { userId } = z
      .object({
        userId: z.number(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    const changes = await client.appUser.update({
      where: {
        userId,
      },
      data: {
        isActive: false,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "MODIFIED",
        data: changes,
      },
    };
  }

  public static async bulkDeleteUser(request: Request) {
    const userIds = z
      .array(
        z.object({
          userId: z.number(),
        })
      )
      .parse(request.body);

    const client = getPrismaClient();

    const transaction = userIds.map((user) => ({
      userId: user.userId,
    }));

    const changes = await client.appUser.updateMany({
      where: {
        OR: transaction,
      },
      data: {
        isActive: false,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "MODIFIED",
        data: changes,
      },
    };
  }
}
