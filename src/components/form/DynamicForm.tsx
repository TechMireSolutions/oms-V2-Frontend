"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ResolvedFormDefinition, ResolvedFieldDefinition } from "../../lib/form-types";
import { buildFormSchema, isVisible } from "../../lib/form-schema";
import { FieldControl } from "./FieldControl";

interface Props {
  definition: ResolvedFormDefinition;
  /** Receives the clean custom_data payload (visible fields only). */
  onSubmit: (customData: Record<string, unknown>) => void | Promise<void>;
  defaultValues?: Record<string, unknown>;
  submitLabel?: string;
}

/**
 * Schema-Driven Form Renderer (Part M).
 * Renders a FormDefinition entirely from metadata: ordered sections, typed
 * fields, conditional visibility, and client-side Zod validation. Output is a
 * clean JSON object mapping field keys → values, ready to POST as `custom_data`.
 */
export function DynamicForm({ definition, onSubmit, defaultValues, submitLabel = "Submit" }: Props) {
  const { form, fields } = definition;
  const fieldByKey = useMemo(
    () => new Map(fields.map((f) => [f.key, f] as const)),
    [fields]
  );

  // A resolver that recomputes the schema against current values so hidden
  // (conditionally-invisible) fields are excluded from validation.
  const resolver = useMemo(
    () => (values: Record<string, unknown>, ctx: unknown, opts: any) =>
      zodResolver(buildFormSchema(fields, values))(values, ctx, opts),
    [fields]
  );

  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting }
  } = useForm<Record<string, unknown>>({ resolver: resolver as any, defaultValues, mode: "onBlur" });

  const values = watch();

  const submit = handleSubmit(async (raw) => {
    // Emit only currently-visible fields → clean custom_data block.
    const customData: Record<string, unknown> = {};
    for (const f of fields) {
      if (isVisible(f, raw) && raw[f.key] !== undefined && raw[f.key] !== "") {
        customData[f.key] = raw[f.key];
      }
    }
    await onSubmit(customData);
  });

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h2 className="text-xl font-bold text-gray-800">{form.title}</h2>
      </header>

      {form.sections.map((section, si) => (
        <fieldset key={si} className="rounded-2xl border border-gray-200 p-6">
          {section.title && (
            <legend className="px-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              {section.title}
            </legend>
          )}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${section.columns || 1}, minmax(0, 1fr))` }}
          >
            {section.fields.map((key) => {
              const field = fieldByKey.get(key) as ResolvedFieldDefinition | undefined;
              if (!field || !isVisible(field, values)) return null;
              return (
                <FieldControl
                  key={key}
                  field={field}
                  register={register}
                  error={errors[key]?.message as string | undefined}
                />
              );
            })}
          </div>
        </fieldset>
      ))}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200
                     hover:bg-orange-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
