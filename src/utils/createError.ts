import { ServerError, ServerErrorConfiguration } from "./classes/ServerError";

export function createError(configuration: ServerErrorConfiguration): never {
  throw new ServerError(configuration);
}
