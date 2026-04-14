'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'

export default function TenantRentPage() {
  const [lease, setLease] = useState<any>(null)
  const [unit, setUnit] = useState<any>(null)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: leaseData } = await supabase
      .from('leases')
      .select('*, units(*, properties(*))')
      .eq('tenant_id', user.id)
      .single()

    if (leaseData) {
      setLease(leaseData)
      setUnit(leaseData.units)
      setProperty(leaseData.units?.properties)
    }
    setLoading(false)
  }

  return (
    <DashboardLayout role="tenant">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Rent</h2>
          <p className="text-muted-foreground">View your rental information</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !lease ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No unit assigned. Contact your landlord.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{property?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{property?.address}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Unit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{unit?.unit_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    ₱{Number(unit?.rent_amount || 0).toLocaleString()}/month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{lease.start_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{lease.end_date || 'Ongoing'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{unit?.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}