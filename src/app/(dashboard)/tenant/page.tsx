'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Payment, Bill, Unit } from '@/types/database'
import { Home, Receipt, Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react'

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
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0) +
    bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + Number(b.amount), 0)

  return (
    <DashboardLayout role="tenant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Dashboard</h2>
            <p className="text-[#64748B]">Your rental overview</p>
          </div>
        </div>

        {/* Stats Cards - 4 column grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">My Unit</CardTitle>
              <Home className="h-4 w-4 text-[#4F46E5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">
                {(lease as any)?.unit?.unit_name || 'Not assigned'}
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {(lease as any)?.unit?.property?.name || 'No property'}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-[#FACC15]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{pendingPayments}</div>
              <p className="text-xs text-[#64748B] mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Pending Bills</CardTitle>
              <Receipt className="h-4 w-4 text-[#FACC15]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{pendingBills}</div>
              <p className="text-xs text-[#64748B] mt-1">To be paid</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Total Due</CardTitle>
              <Wallet className="h-4 w-4 text-[#EF4444]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">₱{totalPending.toLocaleString()}</div>
              <p className="text-xs text-[#64748B] mt-1">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Payments */}
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0F172A]">Recent Payments</CardTitle>
              <CheckCircle className="h-5 w-5 text-[#64748B]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-[#64748B]">Loading...</p>
              ) : payments.length === 0 ? (
                <div className="text-center py-6">
                  <Wallet className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
                  <p className="text-[#64748B]">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">₱{Number(payment.amount).toLocaleString()}</p>
                        <p className="text-sm text-[#64748B]">{payment.payment_date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        payment.status === 'approved' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                        payment.status === 'rejected' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                        'bg-[#FACC15]/20 text-[#FACC15]'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Bills */}
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0F172A]">Pending Bills</CardTitle>
              <AlertCircle className="h-5 w-5 text-[#64748B]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-[#64748B]">Loading...</p>
              ) : bills.filter(b => b.status === 'pending').length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 text-[#22C55E] mx-auto mb-2" />
                  <p className="text-[#64748B]">No pending bills</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.filter(b => b.status === 'pending').map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A] capitalize">{bill.type}</p>
                        <p className="text-sm text-[#64748B]">Due: {bill.due_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#0F172A]">₱{Number(bill.amount).toLocaleString()}</p>
                        <span className="text-xs px-2 py-1 bg-[#FACC15]/20 text-[#FACC15] rounded-full">Pending</span>
                      </div>
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