export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const COLORS = {
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#dc2626",
};

export const FEATURE_FLAGS = {
  enableTenantDashboard: true,
};

export const VALIDATION_RULES = {
  tenantSlug: /^[a-z0-9-]+$/,
};

export const TENANT_CACHE_TTL = 300_000; // 5 minutes
