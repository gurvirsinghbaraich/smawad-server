import { Request, Response } from "express";
import { ServerError } from "./classes/ServerError";
import { ZodError } from "zod";
import { formatZodError } from "./formatZodError";

export function generateResponse<
  /* eslint-disable @typescript-eslint/no-explicit-any */
  TFunction extends (...args: any[]) => any,
>(handlerFn: TFunction) {
  return async function (request: Request, response: Response) {
    try {
      // Tracking the time it took to complete the request (on server).
      const timeOfInstanciation = Date.now();

      // Running the handler function
      const data = await handlerFn(request);

      // Getting the total time that the request took.
      const deltaUsed = Date.now() - timeOfInstanciation;

      return response.json({
        deltaUsed,
        data,
        status: "OK",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return response.status(400).json({
          data: null,
          status: "FATAL",
          message: "Bad Request",
          issues: formatZodError(error)
        })
      }

      if ((error as Error).name === "ServerError") {
        const [statusCode, message] = (error as ServerError).message.split(":");

        return response.status(+statusCode).json({
          data: null,
          status: "FATAL",
          message: message.trim(),
        });
      }

      // Log the error to console.
      console.log((error as Error).message)
      
      return response.status(500).json({
        data: null,
        status: "FATAL",
        message: "Server Error Occured, Please try again later.",
      });
    }
  };
}
