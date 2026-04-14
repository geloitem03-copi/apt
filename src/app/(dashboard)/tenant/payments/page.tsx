'use client'

import { useEffect, useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase'
import { uploadImage } from '@/lib/cloudinary'
import { toast } from 'sonner'

export default function TenantPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('payments')
      .select('*, units(unit_name)')
      .eq('tenant_id', user.id)
      .order('payment_date', { ascending: false })

    if (data) setPayments(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let proofUrl = null
    if (proofFile) {
      proofUrl = await uploadImage(proofFile)
    }

    const { data: lease } = await supabase
      .from('leases')
      .select('unit_id')
      .eq('tenant_id', user.id)
      .single()

    const { error } = await supabase.from('payments').insert({
      tenant_id: user.id,
      unit_id: lease?.unit_id,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_date: paymentDate,
      proof_image_url: proofUrl,
      status: 'pending',
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Payment submitted for review!')
      setOpen(false)
      setAmount('')
      setPaymentMethod('')
      setPaymentDate('')
      setProofFile(null)
      fetchPayments()
    }
    setUploading(false)
  }

  return (
    <DashboardLayout role="tenant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Payments</h2>
            <p className="text-muted-foreground">View and submit payments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>Submit Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (PHP)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Input
                    placeholder="e.g., GCash, Bank Transfer, Cash"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Date</label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proof Image (Optional)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? 'Submitting...' : 'Submit Payment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground">No payments yet. Submit your first payment!</p>
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
                          View receipt
                        </a>
                      )}
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
      </div>
    </DashboardLayout>
  )
}