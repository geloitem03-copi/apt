'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  apartment_id: string | null
  room_id: string | null
  status: string
  created_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setInquiries(data)
    if (error) toast.error('Failed to fetch inquiries')
    setLoading(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Status updated')
      fetchInquiries()
    }
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Inquiries</h2>
          <p className="text-muted-foreground">View inquiries from potential tenants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : inquiries.length === 0 ? (
              <p className="text-muted-foreground">No inquiries yet.</p>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{inquiry.name}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{inquiry.message}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(inquiry.id, 'contacted')}>
                        Mark Contacted
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(inquiry.id, 'completed')}>
                        Mark Completed
                      </Button>
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
