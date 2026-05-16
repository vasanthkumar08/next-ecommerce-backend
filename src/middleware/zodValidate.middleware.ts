import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import { ZodError, type ZodSchema } from "zod";
import AppError from "../utils/AppError.js";

interface ZodSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

const formatZodError = (error: ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
    .join(", ");

export const validateZod = (schemas: ZodSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as ParamsDictionary;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Query;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(`Validation failed: ${formatZodError(error)}`, 400));
        return;
      }

      next(error);
    }
  };
};
