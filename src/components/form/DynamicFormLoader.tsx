"use client";

import { useEffect, useState } from "react";
import type { ResolvedFormDefinition } from "../../lib/form-types";
import { DynamicForm } from "./DynamicForm";

interface Props {
  formKey: string;
  /** Where to POST the assembled payload, e.g. "/api/admissions/apply". */
  submitUrl: string;
  /** Extra fields merged alongside custom_data (e.g. programKey, applicant). */
  envelope?: (customData: Record<string, unknown>) => Record<string, unknown>;
  accessToken?: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

/**
 * Fetches a published FormDefinition from the metadata engine and renders it.
 * On submit, wraps the clean custom_data block in the entity envelope and POSTs.
 */
export function DynamicFormLoader({ formKey, submitUrl, envelope, accessToken }: Props) {
  const [def, setDef] = useState<ResolvedFormDefinition | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/meta/forms/${encodeURIComponent(formKey)}`, {
          headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {}
        });
        if (!res.ok) throw new Error(String(res.status));
        setDef((await res.json()) as ResolvedFormDefinition);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, [formKey, accessToken]);

  if (status === "loading") return <p className="text-secondary">Loading form…</p>;
  if (status === "error" || !def) return <p className="text-danger">Could not load form.</p>;

  return (
    <DynamicForm
      definition={def}
      onSubmit={async (customData) => {
        const body = envelope ? envelope(customData) : { customData };
        const res = await fetch(`${API}${submitUrl}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      }}
    />
  );
}
