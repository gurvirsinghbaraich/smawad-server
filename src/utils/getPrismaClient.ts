import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null;

export function getPrismaClient(): PrismaClient {
  // Initialize the prisma client, if it has not beed initalized before.
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  // Returning the initalized client.
  return prismaClient;
}
