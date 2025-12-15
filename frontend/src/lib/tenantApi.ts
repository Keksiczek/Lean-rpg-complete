import { API_BASE_URL } from "@/src/constants";
import type { TenantConfig } from "@/src/types/tenant";

export async function fetchTenantConfig(slug: string): Promise<TenantConfig> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/api/tenants/${slug}/config`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("Tenant not found");
  }

  if (!response.ok) {
    throw new Error(`Failed to load tenant config (${response.status})`);
  }

  try {
    const data = (await response.json()) as TenantConfig;
    return data;
  } catch (error) {
    throw new Error("Failed to parse tenant config response");
  }
}
