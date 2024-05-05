import { getPrismaClient } from "../utils/getPrismaClient";

export class LookupController {
  public static async listOrganizationTypes() {
    const client = getPrismaClient();
    return await client.lookupOrganizationType.findMany();
  }

  public static async listIndustryTypes() {
    const client = getPrismaClient();
    return await client.lookupIndustryType.findMany();
  }

  public static async listAddressTypes() {
    const client = getPrismaClient();
    return await client.lookupAddressType.findMany();
  }

  public static async listCountries() {
    const client = getPrismaClient();
    return await client.lookupCountry.findMany();
  }

  public static async listStates() {
    const client = getPrismaClient();
    return await client.lookupCountryState.findMany();
  }

  public static async listCities() {
    const client = getPrismaClient();
    return await client.lookupCity.findMany();
  }

  public static async listPhoneNumbers() {
    const client = getPrismaClient();
    return await client.lookupPhoneNumberType.findMany();
  }
}
