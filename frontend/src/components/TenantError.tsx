"use client";

interface TenantErrorProps {
  error: Error;
  onRetry: () => void;
}

export function TenantError({ error, onRetry }: TenantErrorProps) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">⚠️ Tenant Loading Failed</h2>
        <p className="text-sm text-red-800 mt-1">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}
