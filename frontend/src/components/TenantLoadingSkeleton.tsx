"use client";

export function TenantLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true">
      <div className="h-10 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
