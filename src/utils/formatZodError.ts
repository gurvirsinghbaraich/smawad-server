import { ZodError } from "zod";

export function formatZodError(error: ZodError): Record<string, string> {
  const issueMapping: Record<string, string> = {};

  error.issues.forEach((issue) => {
    issueMapping[issue.path[0]] = issue.message;
  });

  return issueMapping;
}
