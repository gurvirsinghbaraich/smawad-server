import { Request } from "express";

export function isAuthenticated(request: Request): boolean {
  return !!request.session.authenticated;
}
