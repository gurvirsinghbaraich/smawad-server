import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request } from "express";
import z from "zod";
import { createError } from "../utils/createError";
import { getPrismaClient } from "../utils/getPrismaClient";
import { getPropertiesFromRequest } from "../utils/getPropertiesFromRequest";

export class OrganizationController {
  // The following function would be responsible for listing all the organizations that are present in the database.
  public static async listOrganizations(request: Request) {
    const payload = z.object({
      page: z.coerce.number().optional(),
      search: z.string().optional(),
      all: z.string().optional(),
    });

    const client = getPrismaClient();
    const { page, search, all } = payload.parse(request.query);

    let appOrganizationsOptions: Prisma.appOrganizationFindManyArgs<DefaultArgs> =
      {
        include: {
          industryTypes: true,
          organizationTypes: true,
          organizationAddress: {
            include: {
              addressType: true,
              city: true,
              country: true,
              countryState: true,
            },
          },
          organizationPhoneNumber: { include: { phoneNumberType: true } },
        },

        take: 10,
        orderBy: {
          orgId: "desc",
        },
      };

    if (!isNaN(Number(page)) && all != "true") {
      appOrganizationsOptions = {
        ...appOrganizationsOptions,

        skip: (page! - 1) * 10,
      };
    }

    if (all) {
      appOrganizationsOptions.take = undefined;
    }

    if (search) {
      appOrganizationsOptions = {
        ...appOrganizationsOptions,
        where: {
          OR: [
            {
              organizationName: {
                contains: search,
              },
            },
            {
              orgPrimaryEmailId: {
                contains: search,
              },
            },
            {
              organizationTypes: {
                orgType: {
                  contains: search,
                },
              },
            },
            {
              industryTypes: {
                industryType: {
                  contains: search,
                },
              },
            },
          ],
        },
      };
    }

    // Getting all the organizatons from the database.
    const [organizations, totalOrganizations] = await client.$transaction([
      client.appOrganization.findMany(appOrganizationsOptions),
      client.appOrganization.aggregate({
        _count: true,
        where: appOrganizationsOptions.where,
      }),
    ]);

    return {
      organizations: JSON.parse(
        JSON.stringify(organizations, (key, value) => {
          if (
            key === "createdOn" ||
            key === "updatedOn" ||
            key === "createdBy" ||
            key === "updatedBy"
          ) {
            return null;
          }

          return typeof value === "bigint" ? value.toString() : value;
        })
      ),
      count: totalOrganizations._count,
    };
  }

  // The following funciton would be responsible for listing out a single organization
  public static async getOrganization(request: Request) {
    const client = getPrismaClient();

    // Getting the search criteria from the request.
    const payload = getPropertiesFromRequest(request.params, [
      "organizationId",
    ]);

    // Check if there was a problem while getting the required params from the request.
    if (payload.status === "FATAL") {
      createError({
        statusCode: 400,
        message: payload.message,
      });
    }

    const organizationId = Number(payload.properties.organizationId);

    // Make sure the organizationId is type of a number.
    if (isNaN(organizationId)) {
      createError({
        statusCode: 400,
        message: "organizationId must only contain a number.",
      });
    }

    // Get the request organization from the database
    const organization = await client.appOrganization.findFirst({
      where: {
        orgId: +organizationId,
      },
      include: {
        industryTypes: true,
        organizationTypes: true,
        organizationAddress: {
          select: {
            addressLine1: true,
            addressLine2: true,
            addressLine3: true,
            addressTypeId: true,
            cityId: true,
            countryStateId: true,
            countryId: true,
          },
        },
        organizationPhoneNumber: true,
      },
    });

    return organization;
  }

  // The function is used to insert a organization in the database.
  public static async createOrganizatoin(request: Request) {
    const schema = z
      .object({
        industrySubTypeId: z.coerce.number().optional(),
        isActive: z.coerce.boolean().default(true),
        organizationName: z
          .string()
          .min(1, "Missing value for 'organizationName'"),
        orgPOCFirstName: z.string().optional(),
        orgPOCMiddleName: z.string().optional(),
        orgPOCLastName: z.string().optional(),
        orgPrimaryEmailId: z.string().optional(),
        orgTypeId: z.coerce.number(),
        industryTypeId: z.coerce.number(),

        addressType: z.coerce.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        country: z.coerce.number().optional(),
        state: z.coerce.number().optional(),
        city: z.coerce.number().optional(),

        phoneNumberType: z.coerce.number(),
        phoneNumber: z.string().min(1, "Missing value for 'phoneNumber'"),
      })
      .strict();

    // Getting all the required properites from the request.
    const payload = schema.parse(request.body);

    const client = getPrismaClient();
    // Inserting the organization into the database
    const organization = await client.appOrganization.create({
      data: {
        organizationName: payload.organizationName,
        orgPOCFirstName: payload.orgPOCFirstName,
        orgPOCMiddleName: payload.orgPOCMiddleName,
        orgPOCLastName: payload.orgPOCLastName,
        industryTypeId: payload.industryTypeId,
        industrySubTypeId: payload.industrySubTypeId,
        orgTypeId: payload.orgTypeId,
        isActive: payload.isActive,
        orgPrimaryEmailId: payload.orgPrimaryEmailId,

        organizationAddress: {
          create: {
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            addressLine3: payload.addressLine3,
            addressTypeId: payload.addressType,
            countryStateId: payload.state,
            countryId: payload.country,
            cityId: payload.city,
            createdBy: request.session.user!.userId,
            updatedBy: request.session.user!.userId,
            isActive: payload.isActive,
          },
        },

        organizationPhoneNumber: {
          create: {
            phoneNumberTypeId: payload.phoneNumberType,
            phoneNumber: payload.phoneNumber,
          },
        },

        orgBranch: {
          create: {
            isOrgBranch: true,
            isActive: payload.isActive,
            industryTypeId: payload.industryTypeId,
            createdBy: request.session.user!.userId,
            updatedBy: request.session.user!.userId,

            orgBranchAddress: {
              create: {
                addressLine1: payload.addressLine1,
                addressLine2: payload.addressLine2,
                addressLine3: payload.addressLine3,
                countryId: payload.country,
                countryStateId: payload.state,
                cityId: payload.city,
                addressTypeId: payload.addressType,
                isActive: payload.isActive,
                updatedBy: request.session.user!.userId,
                createdBy: request.session.user!.userId,
              },
            },

            orgBranchPhoneNumber: {
              create: {
                phoneNumberTypeId: payload.phoneNumberType,
                updatedBy: request.session.user!.userId,
                createdBy: request.session.user!.userId,
                phoneNumber: payload.phoneNumber,
              },
            },
          },
        },

        createdBy: request.session.user!.userId,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "INSERTED",
        value: { organization },
      },
    };
  }

  // The following function would be responsible for updating an organization.
  public static async patchOrganization(request: Request) {
    // Defining the JSON request.
    const schema = z.object({
      organizationId: z.coerce.number(),
      data: z.object({
        industrySubTypeId: z.coerce.number().optional(),
        isActive: z.coerce.boolean().default(true),
        organizationName: z
          .string()
          .min(1, "Missing value for 'organizationName'"),
        orgPOCFirstName: z.string().optional(),
        orgPOCMiddleName: z.string().optional(),
        orgPOCLastName: z.string().optional(),
        orgTypeId: z.coerce.number(),
        industryTypeId: z.coerce.number(),
        orgPrimaryEmailId: z.string().optional(),

        addressType: z.coerce.number(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        addressLine3: z.string().optional(),
        country: z.coerce.number().optional(),
        state: z.coerce.number().optional(),
        city: z.coerce.number().optional(),

        phoneNumberType: z.coerce.number(),
        phoneNumber: z.string().min(1, "Missing value for 'phoneNumber'"),
      }),
    });

    // Getting the 'organizationId' and payload from the request and the data that needs to be patched.
    const { data, organizationId } = schema.parse(request.body);

    const client = getPrismaClient();
    // Updating the values in the database
    const organization = await client.appOrganization.update({
      where: {
        orgId: organizationId,
      },
      data: {
        organizationName: data.organizationName,
        orgPOCFirstName: data.orgPOCFirstName,
        orgPOCMiddleName: data.orgPOCMiddleName,
        orgPOCLastName: data.orgPOCLastName,
        industryTypeId: data.industryTypeId,
        industrySubTypeId: data.industrySubTypeId,
        orgTypeId: data.orgTypeId,
        isActive: data.isActive,
        orgPrimaryEmailId: data.orgPrimaryEmailId,

        organizationAddress: {
          create: {
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            addressLine3: data.addressLine3,
            addressTypeId: data.addressType,
            countryStateId: data.state,
            countryId: data.country,
            cityId: data.city,
            createdBy: request.session.user!.userId,
            updatedBy: request.session.user!.userId,
            isActive: data.isActive,
          },
        },

        organizationPhoneNumber: {
          create: {
            phoneNumberTypeId: data.phoneNumberType,
            phoneNumber: data.phoneNumber,
          },
        },

        createdBy: request.session.user!.userId,
        updatedBy: request.session.user!.userId,
      },
    });

    return {
      changes: {
        status: "PATCHED",
        value: { organization },
      },
    };
  }

  // The following funciton is responsible for virtually deleting an organization.
  public static async makeOrganizationInactive(request: Request) {
    // Getting the 'organizationId' and payload from the request and the data that needs to be patched.
    const { organizationId } = z
      .object({ organizationId: z.coerce.number() })
      .parse(request.body);

    // Making the organization inactive
    const client = getPrismaClient();
    const organization = await client.appOrganization.update({
      where: {
        orgId: organizationId,
      },
      data: {
        isActive: false,
      },
    });

    return {
      changes: {
        status: "VDELETION",
        value: { organization },
      },
    };
  }

  // The funciton will be responible for virtually deleting organizations
  public static async bulkMakeOrganizationsInactive(request: Request) {
    // Getting the organizations from the request.
    const { organizations } = z
      .object({
        organizations: z.array(z.object({ orgId: z.number() })),
      })
      .parse(request.body);

    // Making organizations inactive
    const client = getPrismaClient();
    return await Promise.all(
      organizations.map((organization) => {
        return client.appOrganization.update({
          data: {
            isActive: false,
          },
          where: {
            orgId: organization.orgId,
          },
        });
      })
    );
  }
}
