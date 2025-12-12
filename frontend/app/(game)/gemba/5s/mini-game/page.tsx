'use client'

import { AuditGame } from '@/src/components/AuditGame'
import { TenantProvider } from '@/src/contexts/TenantProvider'

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? null

export default function GembaMiniGamePage() {
  return (
    <TenantProvider initialSlug={DEFAULT_TENANT ?? undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gemba 5S Mini-game</h1>
          <p className="text-gray-600">Identify and categorize issues on the shop floor.</p>
        </div>
        <AuditGame />
      </div>
    </TenantProvider>
  )
}
