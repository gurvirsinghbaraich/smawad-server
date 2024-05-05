export type ServerErrorConfiguration = {
  message: string;
  statusCode: number;
};

export class ServerError extends Error {
  // Storing the HTTP status code that needs to be returned from the request.
  private statusCode: number;

  // Getter method so that "others" can only read the private statusCode property.
  get status() {
    return this.statusCode;
  }

  constructor({ message, statusCode }: ServerErrorConfiguration) {
    super(`${statusCode}: ${message}`);
    this.name = "ServerError";
    this.statusCode = statusCode;
  }
}
