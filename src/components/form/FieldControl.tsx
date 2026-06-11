"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import type { ResolvedFieldDefinition } from "../../lib/form-types";

const inputBase =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 " +
  "outline-none transition-all duration-200 placeholder:text-gray-400 " +
  "focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/20 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

interface Props {
  field: ResolvedFieldDefinition;
  register: (name: string) => UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

/** Renders one Tailwind-styled control for a field definition. */
export function FieldControl({ field, register, error, disabled }: Props) {
  const c = field.config ?? {};
  const help = field.uiSchema?.["help"] as string | undefined;
  const placeholder = field.uiSchema?.["placeholder"] as string | undefined;

  const control = () => {
    switch (field.fieldType) {
      case "TEXT":
        return <textarea {...register(field.key)} rows={4} className={inputBase} placeholder={placeholder} disabled={disabled} />;
      case "BOOLEAN":
        return (
          <input type="checkbox" {...register(field.key)} disabled={disabled}
            className="h-5 w-5 rounded-md border-gray-300 text-orange-500 accent-orange-500 focus:ring-orange-500/20" />
        );
      case "NUMBER":
      case "INTEGER":
        return <input type="number" step={field.fieldType === "INTEGER" ? 1 : "any"} {...register(field.key)} className={inputBase} placeholder={placeholder} disabled={disabled} />;
      case "DATE":
        return <input type="date" {...register(field.key)} className={inputBase} disabled={disabled} />;
      case "DATETIME":
        return <input type="datetime-local" {...register(field.key)} className={inputBase} disabled={disabled} />;
      case "EMAIL":
        return <input type="email" {...register(field.key)} className={inputBase} placeholder={placeholder} disabled={disabled} />;
      case "PHONE":
        return <input type="tel" {...register(field.key)} className={inputBase} placeholder={placeholder} disabled={disabled} />;
      case "SELECT":
        return (
          <select {...register(field.key)} className={inputBase} disabled={disabled} defaultValue="">
            <option value="" disabled>Select…</option>
            {(c.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "MULTISELECT":
        return (
          <select multiple {...register(field.key)} className={`${inputBase} h-32`} disabled={disabled}>
            {(c.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case "JSON":
        return <textarea {...register(field.key)} rows={6} className={`${inputBase} font-mono`} placeholder='{ }' disabled={disabled} />;
      case "STRING":
      default:
        return <input type="text" {...register(field.key)} className={inputBase} placeholder={placeholder} disabled={disabled} />;
    }
  };

  const isCheckbox = field.fieldType === "BOOLEAN";
  return (
    <div className={isCheckbox ? "flex items-center gap-2" : "flex flex-col gap-1.5"}>
      {!isCheckbox && (
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {field.label}{field.required && <span className="text-red-600"> *</span>}
        </label>
      )}
      {control()}
      {isCheckbox && (
        <label className="text-sm font-medium text-gray-700">
          {field.label}{field.required && <span className="text-red-600"> *</span>}
        </label>
      )}
      {help && <p className="text-xs text-gray-500">{help}</p>}
      {error && <p className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
