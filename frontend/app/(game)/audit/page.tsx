'use client'

import { AuditGame } from '@/src/components/AuditGame'
import { TenantProvider } from '@/src/contexts/TenantProvider'

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? null

export default function AuditPage() {
  return (
    <TenantProvider initialSlug={DEFAULT_TENANT ?? undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">5S Audit</h1>
          <p className="text-gray-600">Learn and practice 5S methodology</p>
        </div>
        <AuditGame />
      </div>
    </TenantProvider>
  )
}
