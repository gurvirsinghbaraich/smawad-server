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
      cursor: z.coerce.number().optional(),
    });

    const client = getPrismaClient();
    const { cursor } = payload.parse(request.query);

    let appOrganizationsOptions: Prisma.appOrganizationFindManyArgs<DefaultArgs> =
      {
        include: {
          industryTypes: true,
          organizationTypes: true,
        },

        take: 10,
      };

    if (!isNaN(Number(cursor))) {
      appOrganizationsOptions = {
        ...appOrganizationsOptions,

        cursor: {
          // Skip the last retured organization
          orgId: cursor! + 1,
        },
      };
    }

    // Getting all the organizatons from the database.
    const organizations = await client.appOrganization.findMany(
      appOrganizationsOptions
    );

    return organizations;
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
}
