import { Prisma, appUser } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request } from "express";
import z from "zod";
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
      include: {
        userAddress: true,
        userPhoneNumber: true,
      },
    });
  }

  public static async listUsers(request: Request) {
    let usersConfig: Prisma.appUserFindManyArgs<DefaultArgs> = {
      orderBy: {
        userId: "desc",
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
        JSON.stringify(users, (key, value) => {
          if (typeof value === "bigint") {
            return value.toString();
          }

          return value;
        })
      ),
      total: total._count,
    };
  }

  public static async getUser(request: Request) {
    // Getting the 'userId' from the request.
    const userId = z.number().parse(+request.params.userId);

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
      addressLine1,
      addressType,
      city,
      country,
      phoneNumberTypeId,
      state,
      addressLine2,
      addressLine3,
      orgAddressId,
      orgPhoneNumberId,
    } = z
      .object({
        userId: z.number(),
        isActive: z.boolean(),
        firstName: z.string(),
        email: z.string(),
        middleName: z.string(),
        lastName: z.string(),
        addressType: z.coerce.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        phoneNumberTypeId: z.coerce.number(),
        phoneNumber: z.string(),
        country: z.coerce.number(),
        state: z.coerce.number(),
        city: z.coerce.number(),
        orgPhoneNumberId: z.number().optional(),
        orgAddressId: z.number().optional(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    const userAddress = {
      update: {
        where: {
          userAddressId: orgAddressId,
        },
        data: {
          addressLine1,
          addressLine2,
          addressLine3,
          addressTypeId: addressType,
          cityId: city,
          countryStateId: state,
          countryId: country,
          isActive: isActive,
          updatedBy: request.session.user!.userId,
        },
      },
    };

    const userPhoneNumber = {
      update: {
        where: {
          userPhoneNumberId: orgPhoneNumberId,
        },
        data: {
          phoneNumberTypeId,
          phoneNumber,
          isActive: isActive,
          updatedBy: request.session.user!.userId,
        },
      },
    };

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

        userAddress: orgAddressId ? userAddress : undefined,
        userPhoneNumber: orgPhoneNumberId ? userPhoneNumber : undefined,

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
      firstName,
      isActive,
      lastName,
      middleName,
      phoneNumber,
      addressLine1,
      addressType,
      city,
      country,
      phoneNumberTypeId,
      state,
      addressLine2,
      addressLine3,
      password,
    } = z
      .object({
        isActive: z.boolean(),
        firstName: z.string(),
        email: z.string(),
        middleName: z.string(),
        lastName: z.string(),
        addressType: z.coerce.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        phoneNumberTypeId: z.coerce.number(),
        phoneNumber: z.string(),
        country: z.coerce.number(),
        state: z.coerce.number(),
        city: z.coerce.number(),
        password: z.string(),
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
        userPassword: password,

        userAddress: {
          create: {
            addressLine1,
            addressLine2,
            addressLine3,
            addressTypeId: addressType,
            cityId: city,
            countryStateId: state,
            countryId: country,
            isActive: isActive,
            createdBy: request.session.user!.userId,
            updatedBy: request.session.user!.userId,
          },
        },

        userPhoneNumber: {
          create: {
            phoneNumberTypeId,
            phoneNumber,
            isActive: isActive,
            updatedBy: request.session.user!.userId,
            createdBy: request.session.user!.userId,
          },
        },

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

  public static async updateUserPassword(userId: number, password: string) {
    const client = getPrismaClient();
    await client.appUser.update({
      where: {
        userId,
      },
      data: {
        userPassword: password,
      },
    });
  }

  public static async getMyProfile(request: Request) {
    const client = getPrismaClient();

    return await client.appUser.findFirst({
      where: {
        userId: request.session.user!.userId,
      },
      select: {
        createdBy: true,
        createdOn: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        phoneNumber: true,
        prefix: true,
        updatedBy: true,
        updatedOn: true,
        userId: true,
      },
    });
  }
}
