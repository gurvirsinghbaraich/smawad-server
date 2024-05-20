import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request } from "express";
import z from "zod";
import { getPrismaClient } from "../utils/getPrismaClient";
import { paginate } from "../utils/paginate";

export class BranchesController {
  // A function to retrive all the branches from the database
  public static async listBranches(request: Request) {
    // Getting the client to connect to the database
    const client = getPrismaClient();

    // Configuration for listing the branches.
    let branchesConfiguration: Prisma.orgBranchFindFirstArgs<DefaultArgs> = {
      ...paginate(request),
      orderBy: {
        orgBranchId: "desc",
      },
      include: {
        industryType: true,
        org: {
          select: {
            organizationName: true,
          },
        },
      },
    };

    const { search } = z
      .object({
        search: z.string().optional(),
      })
      .parse(request.query);

    if (search) {
      branchesConfiguration = {
        ...branchesConfiguration,
        where: {
          OR: [
            {
              orgBranchName: {
                contains: search,
              },
            },
            {
              industryType: {
                industryType: {
                  contains: search,
                },
              },
            },
            {
              org: {
                organizationName: {
                  contains: search,
                },
              },
            },
            {
              orgBranchNote: {
                contains: search,
              },
            },
          ],
        },
      };
    }

    // Returning the branches obtained from the database
    const [orgBranches, count] = await client.$transaction([
      client.orgBranch.findMany(branchesConfiguration),
      client.orgBranch.aggregate({
        _count: true,
        where: branchesConfiguration.where,
      }),
    ]);

    return {
      orgBranches: JSON.parse(
        JSON.stringify(orgBranches, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      ),
      count: count._count,
    };
  }

  // The function returns a single requested branch
  public static async getBranch(request: Request) {
    const orgBranchId = z.coerce.number().parse(request.params.orgBranchId);

    // Getting the client from the server
    const client = getPrismaClient();

    // Getting the request branch from the server
    return await client.orgBranch.findFirst({
      where: {
        orgBranchId,
      },
      include: {
        industryType: true,
        orgBranchAddress: {
          include: {
            city: true,
            addressType: true,
            country: true,
            state: true,
          },
        },
        orgBranchPhoneNumber: {
          include: {
            phoneNumberType: true,
          },
        },
        org: {
          select: {
            orgId: true,
            organizationName: true,
          },
        },
      },
    });
  }

  public static async createBranch(request: Request) {
    const {
      industryType,
      isActive,
      orgBranchName,
      organizationName,
      addressLine1,
      addressType,
      phoneNumber,
      phoneNumberTypeId,
      city,
      country,
      state,
      addressLine2,
      addressLine3,
    } = z
      .object({
        isActive: z.boolean(),
        orgBranchName: z.string(),
        organizationName: z.number(),
        industryType: z.number(),
        addressType: z.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        phoneNumberTypeId: z.number(),
        phoneNumber: z.string(),
        country: z.number(),
        state: z.number(),
        city: z.number(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.orgBranch.create({
      data: {
        isActive,
        orgBranchName,
        isOrgBranch: false,
        orgId: organizationName,
        industryTypeId: industryType,
        updatedBy: request.session.user!.userId,
        createdBy: request.session.user!.userId,

        orgBranchAddress: {
          create: {
            addressLine1,
            addressLine2,
            addressLine3,
            countryId: country,
            countryStateId: state,
            cityId: city,
            addressTypeId: addressType,
            isActive: isActive,
            updatedBy: request.session.user!.userId,
            createdBy: request.session.user!.userId,
          },
        },

        orgBranchPhoneNumber: {
          create: {
            phoneNumberTypeId,
            phoneNumber,
            updatedBy: request.session.user!.userId,
            createdBy: request.session.user!.userId,
          },
        },
      },
    });
  }

  public static async updateBranch(request: Request) {
    const {
      industryType,
      isActive,
      orgBranchName,
      organizationName,
      addressLine1,
      addressType,
      phoneNumber,
      phoneNumberTypeId,
      orgAddressId,
      orgPhoneNumberId,
      city,
      country,
      state,
      addressLine2,
      addressLine3,
      orgBranchId,
    } = z
      .object({
        orgBranchId: z.number(),
        isActive: z.boolean(),
        orgBranchName: z.string(),
        organizationName: z.number(),
        industryType: z.number(),
        addressType: z.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        phoneNumberTypeId: z.number(),
        phoneNumber: z.string(),
        country: z.number(),
        state: z.number(),
        city: z.number(),
        orgAddressId: z.number(),
        orgPhoneNumberId: z.number(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.orgBranch.update({
      where: {
        orgBranchId,
      },
      data: {
        orgBranchName,
        orgId: organizationName,
        isActive,

        orgBranchAddress: {
          update: {
            where: {
              orgBranchAddressId: orgAddressId,
            },
            data: {
              addressLine1,
              addressLine2,
              addressLine3,
              countryStateId: state,
              countryId: country,
              cityId: city,
              addressTypeId: addressType,
            },
          },
        },

        industryTypeId: industryType,

        orgBranchPhoneNumber: {
          update: {
            where: {
              orgBranchPhoneNumberId: orgPhoneNumberId,
            },
            data: {
              phoneNumberTypeId,
              phoneNumber,
            },
          },
        },

        updatedBy: request.session.user!.userId,
      },
    });
  }

  public static async deleteBranch(request: Request) {
    const { orgBranchId } = z
      .object({
        orgBranchId: z.number(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.orgBranch.update({
      where: {
        orgBranchId,
      },
      data: {
        isActive: false,
        updatedBy: request.session.user!.userId,
      },
    });
  }

  public static async bulkDeleteBranches(request: Request) {
    const orgBranches = z
      .array(
        z.object({
          orgBranchId: z.number(),
        })
      )
      .parse(request.body?.orgBranchs);

    const client = getPrismaClient();

    const transaction = orgBranches.map(function ({ orgBranchId }) {
      return {
        orgBranchId,
      };
    });

    const itemsDeleted = await client.orgBranch.updateMany({
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
        status: "PURGED",
        count: itemsDeleted.count,
      },
    };
  }
}
