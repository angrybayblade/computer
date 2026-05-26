import type { ResourceSlug } from "@/lib/metadata/resources";

export async function fetchMetadata<T>(resource: ResourceSlug): Promise<T[]> {
  const response = await fetch(`/api/metadata/${resource}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${resource}`);
  return response.json() as Promise<T[]>;
}

export async function fetchEditorRows(resource: ResourceSlug): Promise<Record<string, unknown>[]> {
  const response = await fetch(`/api/metadata/${resource}`, {
    cache: "no-store",
    headers: { "x-edit-mode": "1" },
  });
  if (!response.ok) throw new Error(`Failed to load ${resource}`);
  return response.json() as Promise<Record<string, unknown>[]>;
}

export async function createMetadataRow(resource: ResourceSlug, data: Record<string, unknown>) {
  const response = await fetch(`/api/metadata/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? "Create failed");
  }
  return response.json();
}

export async function updateMetadataRow(
  resource: ResourceSlug,
  id: string,
  data: Record<string, unknown>
) {
  const response = await fetch(`/api/metadata/${resource}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? "Update failed");
  }
  return response.json();
}

export async function deleteMetadataRow(resource: ResourceSlug, id: string) {
  const response = await fetch(`/api/metadata/${resource}/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? "Delete failed");
  }
}

export async function verifyEditPassword(password: string) {
  const response = await fetch("/api/auth/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return response.ok;
}
