'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'

export default function TenantBillsPage() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('tenant_id', user.id)
      .order('due_date', { ascending: false })

    if (data) setBills(data)
    setLoading(false)
  }

  const pendingBills = bills.filter(b => b.status === 'pending')
  const totalPending = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0)

  return (
    <DashboardLayout role="tenant">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Bills</h2>
          <p className="text-muted-foreground">View your bills and dues</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBills.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalPending.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : bills.length === 0 ? (
              <p className="text-muted-foreground">No bills yet</p>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{bill.type}</p>
                      <p className="text-sm text-muted-foreground">Due: {bill.due_date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">₱{Number(bill.amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status}
                      </span>
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