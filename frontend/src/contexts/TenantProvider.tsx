"use client";

import { usePathname } from "next/navigation";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VALIDATION_RULES } from "@/src/constants";
import { TenantContext } from "@/src/contexts/TenantContext";
import { clearCachedConfig, getCachedConfig, setCachedConfig } from "@/src/lib/cache";
import { fetchTenantConfig } from "@/src/lib/tenantApi";
import type { TenantConfig } from "@/src/types/tenant";

interface TenantProviderProps {
  children: ReactNode;
  initialSlug?: string;
}

const SLUG_REGEX = VALIDATION_RULES.tenantSlug;

function extractSlug(pathname: string | null): string | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  const tenantIndex = segments.findIndex((segment) => segment === "tenant");
  if (tenantIndex === -1 || tenantIndex + 1 >= segments.length) return null;
  const slug = segments[tenantIndex + 1];
  return SLUG_REGEX.test(slug) ? slug : null;
}

function readLanguage(slug: string | null): string | null {
  if (typeof window === "undefined") return null;
  if (!slug) return null;
  try {
    return localStorage.getItem(`tenant:language:${slug}`);
  } catch (error) {
    console.warn("Unable to read tenant language", error);
    return null;
  }
}

function persistLanguage(slug: string | null, language: string): void {
  if (typeof window === "undefined") return;
  if (!slug) return;
  try {
    localStorage.setItem(`tenant:language:${slug}`, language);
  } catch (error) {
    console.warn("Unable to persist tenant language", error);
  }
}

export function TenantProvider({ children, initialSlug }: TenantProviderProps) {
  const pathname = usePathname();
  const derivedSlug = extractSlug(pathname);
  const tenantSlug = initialSlug ?? derivedSlug;
  const isValidSlug = tenantSlug ? SLUG_REGEX.test(tenantSlug) : false;

  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [language, setLanguageState] = useState<string>(() => "en");
  const isFetchingRef = useRef(false);

  const loadLanguage = useCallback(
    (nextConfig?: TenantConfig | null) => {
      const slug = tenantSlug ?? nextConfig?.tenant.slug ?? null;
      const storedLanguage = readLanguage(slug);
      if (storedLanguage) {
        setLanguageState(storedLanguage);
        return;
      }
      if (nextConfig?.tenant.language) {
        setLanguageState(nextConfig.tenant.language);
      }
    },
    [tenantSlug]
  );

  const loadConfig = useCallback(
    async (bypassCache = false) => {
      if (!tenantSlug || !isValidSlug) {
        setError(new Error("Tenant slug is missing or invalid"));
        setConfig(null);
        return;
      }

      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const cachedConfig = !bypassCache ? getCachedConfig(tenantSlug) : null;
      if (cachedConfig) {
        setConfig(cachedConfig);
        loadLanguage(cachedConfig);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      try {
        const data = await fetchTenantConfig(tenantSlug);
        setConfig(data);
        setCachedConfig(tenantSlug, data);
        loadLanguage(data);
      } catch (err) {
        const errorInstance =
          err instanceof Error ? err : new Error("Unknown tenant load error");
        setError(errorInstance);
        setConfig(null);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isValidSlug, loadLanguage, tenantSlug]
  );

  useEffect(() => {
    if (!tenantSlug || !isValidSlug) {
      setError(new Error("Tenant slug is missing or invalid"));
      setConfig(null);
      return;
    }

    const cachedLanguage = readLanguage(tenantSlug);
    if (cachedLanguage) {
      setLanguageState(cachedLanguage);
    }

    void loadConfig();
  }, [tenantSlug, isValidSlug, loadConfig]);

  const refreshConfig = useCallback(async () => {
    if (!tenantSlug || !isValidSlug) return;
    clearCachedConfig(tenantSlug);
    await loadConfig(true);
  }, [isValidSlug, loadConfig, tenantSlug]);

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      persistLanguage(tenantSlug ?? config?.tenant.slug ?? null, lang);
    },
    [config?.tenant.slug, tenantSlug]
  );

  const value = useMemo(
    () => ({
      config,
      isLoading,
      error,
      tenantSlug: tenantSlug ?? config?.tenant.slug ?? null,
      language,
      setLanguage,
      refreshConfig,
    }),
    [config, error, isLoading, language, refreshConfig, setLanguage, tenantSlug]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
