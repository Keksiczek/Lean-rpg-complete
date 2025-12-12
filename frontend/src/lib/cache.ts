import { TENANT_CACHE_TTL } from "@/src/constants";
import type { TenantConfig } from "@/src/types/tenant";

interface CacheEntry {
  data: TenantConfig;
  timestamp: number;
  ttl: number;
}

function isCacheValid(entry: CacheEntry): boolean {
  const age = Date.now() - entry.timestamp;
  return age < entry.ttl;
}

export function getCachedConfig(slug: string): TenantConfig | null {
  try {
    const stored = localStorage.getItem(`tenant:config:${slug}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CacheEntry;
    return isCacheValid(parsed) ? parsed.data : null;
  } catch (error) {
    console.warn("Failed to read cached tenant config", error);
    return null;
  }
}

export function setCachedConfig(slug: string, config: TenantConfig): void {
  try {
    const entry: CacheEntry = {
      data: config,
      timestamp: Date.now(),
      ttl: TENANT_CACHE_TTL,
    };
    localStorage.setItem(`tenant:config:${slug}`, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to write tenant cache", error);
  }
}

export function clearCachedConfig(slug: string): void {
  try {
    localStorage.removeItem(`tenant:config:${slug}`);
  } catch (error) {
    console.warn("Failed to clear tenant cache", error);
  }
}
