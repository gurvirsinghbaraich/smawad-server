import { Request } from "express";
import z from "zod";
import { ServerError } from "../utils/classes/ServerError";
import { getPrismaClient } from "../utils/getPrismaClient";
import { getPropertiesFromRequest } from "../utils/getPropertiesFromRequest";

export class OrganizationController {
  // The following function would be responsible for listing all the organizations that are present in the database.
  public static async listOrganizations() {
    const client = getPrismaClient();

    // Getting all the organizatons from the database.
    const organizations = await client.appOrganization.findMany({
      include: {
        industryTypes: true,
        organizationTypes: true,
      },
    });

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
      throw new ServerError({
        statusCode: 400,
        message: payload.message,
      });
    }

    const organizationId = Number(payload.properties.organizationId);

    // Make sure the organizationId is type of a number.
    if (isNaN(organizationId)) {
      throw new ServerError({
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
        orgTypeId: z.coerce.number(),
        industryTypeId: z.coerce.number(),
      })
      .strict();

    // Getting all the required properites from the request.
    const payload = schema.parse(request.body);

    const client = getPrismaClient();
    // Inserting the organization into the database
    const organization = await client.appOrganization.create({
      data: {
        ...payload,

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
      data,
    });

    return {
      changes: {
        status: "PATCHED",
        value: { organization },
      },
    };
  }

  // The following funciton is responsible for virtually deleting an organization.
  private static async makeOrganizationInactive(request: Request) {
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
