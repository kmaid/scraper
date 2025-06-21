import { z } from "zod";
import { ValidationError } from "../types";

export class SchemaValidator {
  static validateData<T>(
    data: any,
    schemaString: string
  ): { success: boolean; data?: T; errors?: ValidationError } {
    try {
      // Create a function that evaluates the schema string
      const createSchema = new Function("z", `return ${schemaString}`);
      const schema = createSchema(z) as z.ZodSchema<T>;

      // Validate the data
      const validatedData = schema.parse(data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: {
            message: "Schema validation failed",
            scrapedData: data,
            schemaErrors: error,
          },
        };
      }

      return {
        success: false,
        errors: {
          message: `Unexpected error during validation: ${error}`,
          scrapedData: data,
          schemaErrors: new z.ZodError([]),
        },
      };
    }
  }

  static validateSchemaString(schemaString: string): boolean {
    try {
      const createSchema = new Function("z", `return ${schemaString}`);
      const schema = createSchema(z);
      return schema instanceof z.ZodSchema;
    } catch {
      return false;
    }
  }

  static formatValidationErrors(validationError: ValidationError): string {
    const errors = validationError.schemaErrors.errors.map((error) => {
      const path = error.path.join(".");
      return `${path}: ${error.message}`;
    });

    return `Validation failed:\n${errors.join("\n")}`;
  }
}
