import { getPrismaClient } from "../utils/getPrismaClient";

export class FiltersController {
  public static async organizationFilters() {
    const client = getPrismaClient();

    const [organizations, organizationTypes, industryTypes] =
      await client.$transaction([
        client.appOrganization.findMany({
          select: {
            organizationName: true,
            orgPrimaryEmailId: true,
            orgPOCFirstName: true,
            orgPOCLastName: true,
          },
        }),

        client.lookupOrganizationType.findMany({
          select: {
            orgType: true,
          },
        }),

        client.lookupIndustryType.findMany({
          select: {
            industryType: true,
          },
        }),
      ]);

    return {
      organizations: JSON.parse(
        JSON.stringify(organizations, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      ),
      organizationTypes,
      industryTypes,
    };
  }
}
