"use client";

import { AuditGame } from "@/src/components/AuditGame";
import { FactoryMap } from "@/src/components/FactoryMap";
import { LPAGame } from "@/src/components/LPAGame";
import { TenantError } from "@/src/components/TenantError";
import { TenantLoadingSkeleton } from "@/src/components/TenantLoadingSkeleton";
import { TenantProvider } from "@/src/contexts/TenantProvider";
import { useTenant } from "@/src/hooks/useTenant";

function DashboardContent() {
  const { config, isLoading, error, refreshConfig, language, setLanguage, tenantSlug } = useTenant();

  if (isLoading || !config) return <TenantLoadingSkeleton />;
  if (error) return <TenantError error={error} onRetry={() => refreshConfig()} />;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 uppercase">Tenant</p>
          <h1 className="text-3xl font-bold text-gray-900">{config.tenant.name}</h1>
          <p className="text-gray-600">Slug: {tenantSlug}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700" htmlFor="language-select">
            Language
          </label>
          <select
            id="language-select"
            className="border rounded px-2 py-1"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="cs">Czech</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <section aria-label="Factory map" className="space-y-3">
        <FactoryMap />
      </section>

      <section aria-label="Audit game" className="space-y-3">
        <AuditGame />
      </section>

      <section aria-label="LPA game" className="space-y-3">
        <LPAGame />
      </section>
    </div>
  );
}

export default function TenantDashboardPage() {
  return (
    <TenantProvider>
      <DashboardContent />
    </TenantProvider>
  );
}
