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

  public static async branchesFilters() {
    const client = getPrismaClient();

    const branches = await client.orgBranch.findMany({
      select: {
        orgBranchName: true,
        industryType: {
          select: {
            industryType: true,
          },
        },
        org: {
          select: {
            organizationName: true,
          },
        },
      },
    });

    return {
      branches,
    };
  }

  public static async usersFilters() {
    const client = getPrismaClient();
    const users = client.appUser.findMany({
      select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
      },
    });

    return { users };
  }
}
