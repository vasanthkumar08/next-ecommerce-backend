import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

/**
 * 📦 Validation Schema Type (Joi/Zod compatible shape)
 */
interface Schema {
  validate: (
    data: any,
    options?: any
  ) => {
    error?: {
      details: { message: string }[];
    };
    value: any;
  };
}

/**
 * 🔐 Supported validation layers
 */
interface ValidateSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

const isSchema = (value: unknown): value is Schema => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Schema).validate === "function"
  );
};

/**
 * 🔐 Enterprise Validation Middleware
 */
export const validate = (schemasOrSchema: ValidateSchemas | Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const schemas: ValidateSchemas = isSchema(schemasOrSchema)
        ? { body: schemasOrSchema }
        : schemasOrSchema;

      const options = {
        abortEarly: false,
        stripUnknown: true,
      };

      const errors: string[] = [];

      /* ===================== BODY ===================== */
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, options);

        if (error) {
          errors.push(...error.details.map((e) => e.message));
        } else {
          req.body = value;
        }
      }

      /* ===================== PARAMS ===================== */
      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, options);

        if (error) {
          errors.push(...error.details.map((e) => e.message));
        }
      }

      /* ===================== QUERY ===================== */
      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, options);

        if (error) {
          errors.push(...error.details.map((e) => e.message));
        }
      }

      /* ===================== ERROR HANDLING ===================== */
      if (errors.length > 0) {
        return next(
          new AppError(`Validation failed: ${errors.join(", ")}`, 400)
        );
      }

      next();
    } catch (err) {
      return next(new AppError("Validation middleware crashed", 500));
    }
  };
};