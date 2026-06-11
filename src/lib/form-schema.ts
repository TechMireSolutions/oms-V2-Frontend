import { z, type ZodTypeAny } from "zod";
import type { ResolvedFieldDefinition } from "./form-types";

/**
 * Build a Zod schema from a field definition — mirrors the backend
 * (apps/backend/src/modules/customization/services/schema-builder.ts) so the
 * client and server validate identically. The server remains authoritative.
 */
export function buildFieldSchema(field: ResolvedFieldDefinition): ZodTypeAny {
  const c = field.config ?? {};
  let schema: ZodTypeAny;

  switch (field.fieldType) {
    case "STRING":
    case "TEXT": {
      let s = z.string();
      if (c.minLength != null) s = s.min(c.minLength);
      if (c.maxLength != null) s = s.max(c.maxLength);
      if (c.pattern) s = s.regex(new RegExp(c.pattern), "Invalid format");
      schema = field.required ? s.min(1, "Required") : s;
      break;
    }
    case "EMAIL":
      schema = z.string().email("Invalid email");
      break;
    case "PHONE":
      schema = z.string().regex(/^[+0-9 ()-]{6,40}$/, "Invalid phone");
      break;
    case "NUMBER":
    case "INTEGER": {
      let n = field.fieldType === "INTEGER" ? z.number().int() : z.number();
      if (c.min != null) n = n.min(c.min);
      if (c.max != null) n = n.max(c.max);
      // RHF gives strings from number inputs; coerce.
      schema = z.coerce.number().pipe(n);
      break;
    }
    case "BOOLEAN":
      schema = z.boolean();
      break;
    case "DATE":
      schema = z.string().date("Invalid date");
      break;
    case "DATETIME":
      schema = z.string().datetime("Invalid date/time");
      break;
    case "SELECT": {
      const values = (c.options ?? []).map((o) => o.value);
      schema = values.length ? z.enum(values as [string, ...string[]]) : z.string();
      break;
    }
    case "MULTISELECT": {
      const values = (c.options ?? []).map((o) => o.value);
      const inner = values.length ? z.enum(values as [string, ...string[]]) : z.string();
      schema = z.array(inner);
      break;
    }
    case "JSON":
      schema = z.record(z.string(), z.unknown());
      break;
    default:
      schema = z.unknown();
  }

  if (!field.required) schema = schema.optional();
  return schema;
}

/** A field is visible unless its `visibleWhen` condition is unmet. */
export function isVisible(field: ResolvedFieldDefinition, values: Record<string, unknown>): boolean {
  const cond = field.config?.visibleWhen;
  if (!cond) return true;
  return values[cond.field] === cond.equals;
}

/**
 * Compose an object schema covering only currently-visible fields, so hidden
 * fields are never required and never validated (matches conditional logic).
 */
export function buildFormSchema(
  fields: ResolvedFieldDefinition[],
  values: Record<string, unknown>
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    shape[f.key] = buildFieldSchema(f);
  }
  return z.object(shape);
}
