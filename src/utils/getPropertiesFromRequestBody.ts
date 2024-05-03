import { Request } from "express";

export function getPropertiesFromRequestBody<Properties extends string[]>(
  request: Request,
  properties: Properties,
):
  | { status: "FATAL"; message: string }
  | {
      status: "OK";
      properties: Record<Properties[number], unknown>;
    } {
  // Checking to see if the payload has been supplied with the request.
  if (!request.body) {
    return {
      status: "FATAL",
      message: "Bad Request",
    };
  }

  const returnables: Record<string, unknown> = {};

  for (let i = 0; i < properties.length; i++) {
    // Getting the value of the property.
    const key: string = properties[i];
    const payload = { ...request.body };

    // Getting the value for @key
    const value = (payload as Record<string, unknown>)?.[key];

    // Making sure the value recieved is valid.
    if (!value) {
      return {
        status: "FATAL",
        message: `Bad Request, Invalid Data Provided for '${key}'`,
      };
    }

    returnables[key] = value;
  }

  return {
    status: "OK",
    properties: returnables as Record<Properties[number], unknown>,
  };
}
