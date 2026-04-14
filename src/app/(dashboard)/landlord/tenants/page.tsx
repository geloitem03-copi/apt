'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { Lease } from '@/types/database'

interface TenantWithDetails extends Lease {
  unit_name?: string
  tenant_name?: string
  tenant_email?: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', user.id)

    if (!properties || properties.length === 0) {
      setLoading(false)
      return
    }

    const propertyIds = properties.map((p) => p.id)
    const { data: units } = await supabase
      .from('units')
      .select('id, property_id, unit_name')
      .in('property_id', propertyIds)

    if (!units || units.length === 0) {
      setLoading(false)
      return
    }

    const unitIds = units.map((u) => u.id)
    const { data: leases } = await supabase
      .from('leases')
      .select('*, profiles(name, email)')
      .in('unit_id', unitIds)

    if (leases) {
      const tenantsWithUnit = leases.map((l) => ({
        ...l,
        unit_name: units.find((u) => u.id === l.unit_id)?.unit_name,
        tenant_name: (l as any).profiles?.name,
        tenant_email: (l as any).profiles?.email,
      }))
      setTenants(tenantsWithUnit)
    }
    setLoading(false)
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Tenants</h2>
          <p className="text-muted-foreground">View your tenants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : tenants.length === 0 ? (
              <p className="text-muted-foreground">No tenants yet</p>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{tenant.tenant_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{tenant.tenant_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Unit: {tenant.unit_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.start_date} - {tenant.end_date || 'Present'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}