'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Property, Unit } from '@/types/database'
import { toast } from 'sonner'
import { Building2, MapPin, ArrowRight, Plus } from 'lucide-react'

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<(Property & { units?: Unit[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id)

    if (data) {
      const propertiesWithUnits = await Promise.all(
        data.map(async (property) => {
          const { data: units } = await supabase
            .from('units')
            .select('*')
            .eq('property_id', property.id)
          return { ...property, units: units || [] }
        })
      )
      setProperties(propertiesWithUnits)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('properties').insert({
      landlord_id: user.id,
      name,
      address,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Property created!')
      setOpen(false)
      setName('')
      setAddress('')
      fetchProperties()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property and all its units?')) return

    const supabase = createClient()
    await supabase.from('properties').delete().eq('id', id)
    toast.success('Property deleted')
    fetchProperties()
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Properties</h2>
            <p className="text-[#64748B]">Manage your properties</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Name</label>
                  <Input
                    placeholder="e.g., Sunset Apartments"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    placeholder="e.g., 123 Main St, Manila"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Property'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0F172A]">All Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#64748B]">No properties yet. Add your first property!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div 
                    key={property.id} 
                    className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/landlord/properties/${property.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-[#4F46E5]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{property.name}</p>
                        <p className="text-sm text-[#64748B] flex items-center gap-1">
                          <MapPin size={12} />
                          {property.address || 'No address'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[#64748B]">{property.units?.length || 0} units</p>
                        <p className="text-sm font-medium text-[#0F172A]">
                          ₱{property.units?.reduce((sum, u) => sum + Number(u.rent_amount), 0).toLocaleString() || 0}/mo
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#64748B]" />
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