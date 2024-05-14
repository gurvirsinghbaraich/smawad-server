import { Request } from "express";
import z from "zod";
import { getPrismaClient } from "../utils/getPrismaClient";

export class LookupController {
  // The function is responsible for listing out all the organization types.
  public static async listOrganizationTypes() {
    const client = getPrismaClient();
    return await client.lookupOrganizationType.findMany();
  }

  // The function is responsible for listing out single organization type.
  public static async getOrganizationType(request: Request) {
    const orgTypeId = z.coerce.number().parse(request.params.orgTypeId);

    const client = getPrismaClient();
    return await client.lookupOrganizationType.findFirst({
      where: {
        orgTypeId,
      },
    });
  }

  public static async listIndustryTypes() {
    const client = getPrismaClient();
    return await client.lookupIndustryType.findMany();
  }

  // The following function is ressponsible for listing a single industry
  public static async listIndustryType(request: Request) {
    const industryTypeId = z.coerce
      .number()
      .parse(request.params.industryTypeId);

    const client = getPrismaClient();
    return await client.lookupIndustryType.findFirst({
      where: {
        industryTypeId,
      },
    });
  }

  // The following function is responsible for inserting an industry type.
  public static async createIndustryType(request: Request) {
    const schema = z.object({
      industryType: z.string().min(1, "Required"),
      parentIndustryTypeId: z.number().nullable().optional(),
    });

    const payload = schema.parse(request.body);
    const client = getPrismaClient();

    const insertedIndustry = await client.lookupIndustryType.create({
      data: payload,
    });

    return {
      changes: {
        status: "INSERTED",
        value: { industryType: insertedIndustry },
      },
    };
  }

  public static async listAddressTypes() {
    const client = getPrismaClient();
    return await client.lookupAddressType.findMany();
  }

  public static async listCountries() {
    const client = getPrismaClient();
    return await client.lookupCountry.findMany();
  }

  // The following function is responsible for listing out a single country
  public static async listCountry(request: Request) {
    const countryId = z.coerce.number().parse(request.params.countryId);

    const client = getPrismaClient();
    return await client.lookupCountry.findFirst({
      where: {
        countryId,
      },
    });
  }

  public static async listStates() {
    const client = getPrismaClient();
    return await client.lookupCountryState.findMany();
  }

  // The following function is responsible for listing out a single country
  public static async listState(request: Request) {
    const countryStateId = z.coerce
      .number()
      .parse(request.params.countryStateId);

    const client = getPrismaClient();
    return await client.lookupCountryState.findFirst({
      where: {
        countryStateId,
      },
    });
  }

  public static async listCities() {
    const client = getPrismaClient();
    return await client.lookupCity.findMany();
  }

  public static async listCity(request: Request) {
    const cityId = z.coerce.number().parse(request.params.cityId);

    const client = getPrismaClient();
    return await client.lookupCity.findFirst({
      where: {
        cityId,
      },
    });
  }

  public static async listPhoneNumbers() {
    const client = getPrismaClient();
    return await client.lookupPhoneNumberType.findMany();
  }
}
