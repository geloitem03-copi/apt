'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Payment, Bill, Unit } from '@/types/database'

interface LeaseWithUnit extends Omit<import('@/types/database').Lease, 'unit_id'> {
  unit?: Unit & { property?: { name: string; address: string } }
}

export default function TenantDashboard() {
  const [lease, setLease] = useState<LeaseWithUnit | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: leaseData } = await supabase
        .from('leases')
        .select('*, unit:units(*), unit:units(property:properties(*))')
        .eq('tenant_id', user.id)
        .single()

      if (leaseData) {
        setLease(leaseData as LeaseWithUnit)
        
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', user.id)
          .order('payment_date', { ascending: false })
        
        if (paymentData) setPayments(paymentData)

        const { data: billData } = await supabase
          .from('bills')
          .select('*')
          .eq('tenant_id', user.id)
          .order('due_date', { ascending: false })
        
        if (billData) setBills(billData)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const pendingBills = bills.filter(b => b.status === 'pending').length

  return (
    <DashboardLayout role="tenant">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Your rental overview</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">My Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(lease as any)?.unit?.unit_name || 'Not assigned'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBills}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : payments.length === 0 ? (
                <p className="text-muted-foreground">No payments yet</p>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">₱{Number(payment.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : bills.filter(b => b.status === 'pending').length === 0 ? (
                <p className="text-muted-foreground">No pending bills</p>
              ) : (
                <div className="space-y-2">
                  {bills.filter(b => b.status === 'pending').map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{bill.type}</p>
                        <p className="text-xs text-muted-foreground">Due: {bill.due_date}</p>
                      </div>
                      <p className="font-medium">₱{Number(bill.amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}