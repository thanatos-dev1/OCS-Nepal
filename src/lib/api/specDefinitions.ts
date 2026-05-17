import type { SpecDefinition, SpecDataType } from "./types";
import api from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiSpecDefinition = Record<string, any>;

function adaptSpecDefinition(d: ApiSpecDefinition): SpecDefinition {
  const enumRaw: string | undefined = d.EnumOptions ?? d.enum_options;
  let enumOptions: string[] | undefined;
  if (enumRaw) {
    try {
      const parsed = JSON.parse(enumRaw);
      if (Array.isArray(parsed)) enumOptions = parsed.map(String);
    } catch {
      // Malformed enum_options on the backend — surface as no options rather
      // than crashing the page.
      enumOptions = undefined;
    }
  }
  return {
    id: d.ID ?? d.id ?? 0,
    categoryId: d.CategoryID ?? d.category_id ?? 0,
    key: d.Key ?? d.key ?? "",
    label: d.Label ?? d.label ?? "",
    unit: d.Unit ?? d.unit ?? undefined,
    dataType: (d.DataType ?? d.data_type ?? "string") as SpecDataType,
    enumOptions,
    filterable: d.Filterable ?? d.filterable ?? false,
    comparable: d.Comparable ?? d.comparable ?? true,
    required: d.Required ?? d.required ?? false,
    sortOrder: d.SortOrder ?? d.sort_order ?? 0,
  };
}

// Fetch the spec template for a category. Drives the dynamic filter sidebar
// on category listing pages and the spec input form on the seller dashboard.
export async function getCategorySpecDefinitions(slug: string): Promise<SpecDefinition[]> {
  const { data } = await api.get<ApiSpecDefinition[]>(`/categories/${slug}/spec-definitions`);
  return Array.isArray(data) ? data.map(adaptSpecDefinition) : [];
}

// --- Owner endpoints ---

export type SpecDefinitionInput = {
  key?: string;
  label: string;
  unit?: string;
  data_type: SpecDataType;
  enum_options?: string[];
  filterable?: boolean;
  comparable?: boolean;
  required?: boolean;
  sort_order?: number;
};

export async function createSpecDefinition(
  categoryId: number,
  input: SpecDefinitionInput,
): Promise<SpecDefinition> {
  const { data } = await api.post<ApiSpecDefinition>(
    `/categories/${categoryId}/spec-definitions`,
    input,
  );
  return adaptSpecDefinition(data);
}

export async function updateSpecDefinition(
  id: number,
  input: SpecDefinitionInput,
): Promise<SpecDefinition> {
  const { data } = await api.put<ApiSpecDefinition>(`/spec-definitions/${id}`, input);
  return adaptSpecDefinition(data);
}

export async function deleteSpecDefinition(id: number): Promise<void> {
  await api.delete(`/spec-definitions/${id}`);
}
