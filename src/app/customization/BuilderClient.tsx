"use client";

import { useState } from "react";
import type { ResolvedFormDefinition } from "../../lib/form-types";
import { DynamicForm } from "../../components/form/DynamicForm";

// An inline FormDefinition demonstrating the schema-driven renderer with
// conditional visibility ("show grant amount only if assistance = yes").
const DEF: ResolvedFormDefinition = {
  form: {
    id: "demo", key: "welfare-intake", entityType: "WelfareRequest",
    title: "Welfare intake form", uiSchema: {},
    sections: [
      { title: "Applicant", fields: ["fullName", "email"], columns: 2 },
      { title: "Need assessment", fields: ["householdSize", "needsAssistance", "requestedAmount", "notes"], columns: 2 }
    ]
  },
  fields: [
    { key: "fullName", label: "Full name", fieldType: "STRING", required: true, config: {}, uiSchema: {} },
    { key: "email", label: "Email", fieldType: "EMAIL", required: true, config: {}, uiSchema: {} },
    { key: "householdSize", label: "Household size", fieldType: "INTEGER", required: true, config: { min: 1, max: 30 }, uiSchema: {} },
    { key: "needsAssistance", label: "Needs financial assistance?", fieldType: "SELECT", required: true,
      config: { options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] }, uiSchema: {} },
    // Conditional: only visible when needsAssistance === "yes"
    { key: "requestedAmount", label: "Requested amount (₱)", fieldType: "NUMBER", required: true,
      config: { min: 0, visibleWhen: { field: "needsAssistance", equals: "yes" } }, uiSchema: {} },
    { key: "notes", label: "Notes", fieldType: "TEXT", required: false, config: { maxLength: 500 }, uiSchema: { help: "Optional context." } }
  ]
};

export function BuilderClient() {
  const [output, setOutput] = useState<string | null>(null);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <DynamicForm
          definition={DEF}
          submitLabel="Validate & build payload"
          onSubmit={(customData) => setOutput(JSON.stringify(customData, null, 2))}
        />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-bold text-gray-800">Clean custom_data payload</h3>
        <p className="mb-3 text-xs text-gray-500">
          Toggle &quot;Needs financial assistance&quot; to Yes to reveal the conditional amount field. Output below is the
          validated object ready to POST.
        </p>
        <pre className="min-h-[200px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-green-300">
{output ?? "// submit the form to see the validated payload"}
        </pre>
      </div>
    </div>
  );
}
