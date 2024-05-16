import { Request } from "express";
import z from "zod";

export const paginate = function (request: Request) {
  const { page } = z
    .object({
      page: z.coerce.number().optional(),
    })
    .parse(request.query);

  const paginateConfig = {};

  if (page) {
    return {
      ...paginateConfig,
      take: 10,
      skip: (page - 1) * 10,
    };
  }

  return paginateConfig;
};
