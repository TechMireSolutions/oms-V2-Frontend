import type { FieldType, FieldConfig } from "@oms/dto";

// Shape returned by GET /meta/forms/:key — the published form joined with its
// published field definitions.
export interface ResolvedFieldDefinition {
  key: string;
  label: string;
  fieldType: FieldType;
  config: FieldConfig;
  uiSchema: Record<string, unknown>;
  required: boolean;
  readPermission?: string | null;
  writePermission?: string | null;
}

export interface ResolvedFormSection {
  title: string;
  fields: string[];      // field keys
  columns: number;
}

export interface ResolvedFormDefinition {
  form: {
    id: string;
    key: string;
    entityType: string;
    title: string;
    sections: ResolvedFormSection[];
    uiSchema: Record<string, unknown>;
  };
  fields: ResolvedFieldDefinition[];
}
