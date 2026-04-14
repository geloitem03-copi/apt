'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { Payment } from '@/types/database'
import { toast } from 'sonner'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
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
      .select('id')
      .in('property_id', propertyIds)

    if (!units || units.length === 0) {
      setLoading(false)
      return
    }

    const unitIds = units.map((u) => u.id)
    const { data } = await supabase
      .from('payments')
      .select('*')
      .in('unit_id', unitIds)
      .order('payment_date', { ascending: false })

    if (data) setPayments(data)
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const supabase = createClient()
    await supabase.from('payments').update({ status: 'approved' }).eq('id', id)
    toast.success('Payment approved')
    fetchPayments()
  }

  const handleReject = async (id: string) => {
    const supabase = createClient()
    await supabase.from('payments').update({ status: 'rejected' }).eq('id', id)
    toast.success('Payment rejected')
    fetchPayments()
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-muted-foreground">View and manage tenant payments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground">No payments yet</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">₱{Number(payment.amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_date} • {payment.payment_method}
                      </p>
                      {payment.proof_image_url && (
                        <a
                          href={payment.proof_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View proof
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                      {payment.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(payment.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(payment.id)}>Reject</Button>
                        </>
                      )}
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