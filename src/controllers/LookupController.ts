import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Request } from "express";
import z from "zod";
import { getPrismaClient } from "../utils/getPrismaClient";
import { paginate } from "../utils/paginate";

export class LookupController {
  // Organization Types
  public static async listOrganizationTypes(request: Request) {
    const search = z.string().optional().parse(request.body.search);

    const configuration: Prisma.lookupOrganizationTypeFindManyArgs<DefaultArgs> =
      {
        where: {
          orgType: {
            contains: search,
          },
        },
      };

    const client = getPrismaClient();
    const [organizationTypes, total] = await client.$transaction([
      client.lookupOrganizationType.findMany({
        ...paginate(request),
        ...configuration,
      }),

      client.lookupOrganizationType.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      organizationTypes,
      total: total._count,
    };
  }

  public static async getOrganizationType(request: Request) {
    const orgTypeId = z.coerce.number().parse(request.params.orgTypeId);

    const client = getPrismaClient();
    return await client.lookupOrganizationType.findFirst({
      where: {
        orgTypeId,
      },
    });
  }

  public static async createOrganizationType(request: Request) {
    const schema = z.object({
      orgType: z.string().min(1, "Required"),
    });

    const payload = schema.parse(request.body);
    const client = getPrismaClient();

    const insertedOrgType = await client.lookupOrganizationType.create({
      data: payload,
    });

    return {
      changes: {
        status: "INSERTED",
        value: { orgType: insertedOrgType },
      },
    };
  }

  public static async updateOrganizationType(request: Request) {
    const { orgTypeId, orgType } = z
      .object({
        orgTypeId: z.coerce.number(),
        orgType: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.lookupOrganizationType.update({
      where: {
        orgTypeId,
      },
      data: {
        orgType,
      },
    });
  }

  // Industry Types
  public static async listIndustryTypes(request: Request) {
    const search = z.string().optional().parse(request.body.search);

    const configuration: Prisma.lookupIndustryTypeFindManyArgs<DefaultArgs> = {
      where: {
        industryType: {
          contains: search,
        },
      },
    };

    const client = getPrismaClient();
    const [industryTypes, total] = await client.$transaction([
      client.lookupIndustryType.findMany({
        ...paginate(request),
        ...configuration,
      }),

      client.lookupIndustryType.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      industryTypes,
      total: total._count,
    };
  }

  public static async getIndustryType(request: Request) {
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

  public static async updateIndustryType(request: Request) {
    const { industryTypeId, industryType } = z
      .object({
        industryTypeId: z.coerce.number(),
        industryType: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.lookupIndustryType.update({
      where: {
        industryTypeId,
      },
      data: {
        industryType,
      },
    });
  }

  // Country States
  public static async listStates(request: Request) {
    const search = z.string().optional().parse(request.query.search);

    const client = getPrismaClient();
    const configuration: Prisma.lookupCountryStateFindManyArgs<DefaultArgs> = {
      ...paginate(request),
      include: {
        country: true,
      },
      where: {
        countryState: {
          contains: search,
        },
        country: {
          country: {
            contains: search,
          },
        },
      },
    };

    const [states, totalStates] = await client.$transaction([
      client.lookupCountryState.findMany(configuration),
      client.lookupCountryState.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      states,
      total: totalStates._count,
    };
  }

  public static async getState(request: Request) {
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

  public static async createState(request: Request) {
    const { countryId, countryState } = z
      .object({
        countryId: z.number(),
        countryState: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();

    return await client.lookupCountryState.create({
      data: {
        countryId,
        countryState,
        languageId: 1,
      },
    });
  }

  public static async updateState(request: Request) {
    const { countryStateId, countryId, state } = z
      .object({
        state: z.string(),
        countryId: z.coerce.number(),
        countryStateId: z.coerce.number(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.lookupCountryState.update({
      where: {
        countryStateId,
      },
      data: {
        countryId,
        countryState: state,
      },
    });
  }

  // Cities
  public static async listCities(request: Request) {
    const search = z.string().optional().parse(request.query.search);

    const client = getPrismaClient();
    const configuration: Prisma.lookupCityFindManyArgs<DefaultArgs> = {
      ...paginate(request),
      where: {
        city: {
          contains: search,
        },
      },
    };

    const [cities, totalCities] = await client.$transaction([
      client.lookupCity.findMany(configuration),
      client.lookupCity.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      cities,
      total: totalCities._count,
    };
  }

  public static async getCity(request: Request) {
    const cityId = z.coerce.number().parse(request.params.cityId);

    const client = getPrismaClient();
    return await client.lookupCity.findFirst({
      where: {
        cityId,
      },
    });
  }

  public static async createCity(request: Request) {
    const { countryStateId, city } = z
      .object({
        countryStateId: z.number(),
        city: z.string(),
      })
      .parse(request);

    const client = getPrismaClient();

    return await client.lookupCity.create({
      data: {
        languageId: 0,
        countryStateId,
        city,
      },
    });
  }

  public static async updateCity(request: Request) {
    const { cityId, city } = z
      .object({
        cityId: z.coerce.number(),
        city: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.lookupCity.update({
      where: {
        cityId,
      },
      data: {
        city,
      },
    });
  }

  // Phone Numbers
  public static async listPhoneNumbers(request: Request) {
    const search = z.string().optional().parse(request.query.search);

    const client = getPrismaClient();
    const configuration: Prisma.lookupPhoneNumberTypeFindManyArgs<DefaultArgs> =
      {
        ...paginate(request),
        where: {
          phoneNumberType: {
            contains: search,
          },
        },
      };

    const [phoneNumbers, totalPhoneNumbers] = await client.$transaction([
      client.lookupPhoneNumberType.findMany(configuration),
      client.lookupPhoneNumberType.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      phoneNumbers,
      total: totalPhoneNumbers._count,
    };
  }

  public static async getPhoneNumber(request: Request) {
    const phoneNumberTypeId = z.coerce
      .number()
      .parse(request.params.phoneNumberTypeId);

    const client = getPrismaClient();
    return await client.lookupPhoneNumberType.findFirst({
      where: {
        phoneNumberTypeId,
      },
    });
  }

  public static async createPhoneNumber(request: Request) {
    const phoneNumberType = z.string().parse(request.body.phoneNumberType);
    const client = getPrismaClient();

    return await client.lookupPhoneNumberType.create({
      data: {
        languageId: 0,
        phoneNumberType,
      },
    });
  }

  public static async updatePhoneNumber(request: Request) {
    const { phoneNumberTypeId, phoneNumberType } = z
      .object({
        phoneNumberTypeId: z.coerce.number(),
        phoneNumberType: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();
    return await client.lookupPhoneNumberType.update({
      where: {
        phoneNumberTypeId,
      },
      data: {
        phoneNumberType,
      },
    });
  }

  public static async listAddressTypes(request: Request) {
    const configuration: Prisma.lookupAddressTypeFindManyArgs<DefaultArgs> = {
      ...paginate(request),
    };

    const client = getPrismaClient();
    const [addressTypes, totalAddressTypes] = await client.$transaction([
      client.lookupAddressType.findMany({
        ...configuration,
      }),
      client.lookupAddressType.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      addressTypes,
      total: totalAddressTypes._count,
    };
  }

  // TODO: Add missing missing methods to create, read single and delete an address type.

  public static async listCountries(request: Request) {
    const configuration: Prisma.lookupCountryFindManyArgs<DefaultArgs> = {
      ...paginate(request),
    };

    const client = getPrismaClient();
    const [countries, totalCountries] = await client.$transaction([
      client.lookupCountry.findMany({
        ...configuration,
      }),
      client.lookupCountry.aggregate({
        _count: true,
        where: configuration.where,
      }),
    ]);

    return {
      countries,
      total: totalCountries._count,
    };
  }

  public static async getCountry(request: Request) {
    const countryId = z.coerce.number().parse(request.params.countryId);
    const client = getPrismaClient();

    return await client.lookupCountry.findFirst({
      where: {
        countryId,
      },
    });
  }

  public static async createCountry(request: Request) {
    const country = z.string().parse(request.body.country);
    const client = getPrismaClient();

    return await client.lookupCountry.create({
      data: {
        country,
        languageId: 0,
      },
    });
  }

  public static async updateCountry(request: Request) {
    const { countryId, country } = z
      .object({
        countryId: z.coerce.number(),
        country: z.string(),
      })
      .parse(request.body);

    const client = getPrismaClient();

    return await client.lookupCountry.update({
      where: {
        countryId,
      },
      data: {
        country,
      },
    });
  }
}
