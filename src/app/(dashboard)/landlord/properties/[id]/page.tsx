'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { ArrowLeft, Plus, DoorOpen, MapPin } from 'lucide-react'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [unitName, setUnitName] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPropertyAndUnits()
  }, [propertyId])

  const fetchPropertyAndUnits = async () => {
    const supabase = createClient()
    
    const { data: propertyData } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()
    
    if (propertyData) setProperty(propertyData)

    const { data: unitData } = await supabase
      .from('units')
      .select('*')
      .eq('property_id', propertyId)
    
    if (unitData) setUnits(unitData)
    setLoading(false)
  }

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()

    const { error } = await supabase.from('units').insert({
      property_id: propertyId,
      unit_name: unitName,
      rent_amount: Number(rentAmount),
      description,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Unit added!')
      setOpen(false)
      setUnitName('')
      setRentAmount('')
      setDescription('')
      fetchPropertyAndUnits()
    }
    setSaving(false)
  }

  const handleDeleteUnit = async (id: string) => {
    if (!confirm('Delete this unit?')) return

    const supabase = createClient()
    await supabase.from('units').delete().eq('id', id)
    toast.success('Unit deleted')
    fetchPropertyAndUnits()
  }

  const occupiedUnits = units.filter(u => u.status === 'occupied').length
  const totalRent = units.reduce((sum, u) => sum + Number(u.rent_amount), 0)

  if (loading) {
    return (
      <DashboardLayout role="landlord">
        <p>Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/landlord/properties')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{property?.name}</h2>
            <p className="text-[#64748B] flex items-center gap-1">
              <MapPin size={14} />
              {property?.address || 'No address'}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUnit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Name/Number</label>
                  <Input
                    placeholder="e.g., Unit 101, Room 1A"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Rent (₱)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="e.g., 2 bedroom, facing east"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Unit'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{units.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{occupiedUnits}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">₱{totalRent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Units List */}
        <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
              <DoorOpen size={20} />
              Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            {units.length === 0 ? (
              <div className="text-center py-8">
                <DoorOpen className="h-12 w-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#64748B]">No units yet. Add your first unit!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl">
                    <div>
                      <p className="font-medium text-[#0F172A]">{unit.unit_name}</p>
                      <p className="text-sm text-[#64748B]">{unit.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-[#0F172A]">₱{Number(unit.rent_amount).toLocaleString()}/mo</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          unit.status === 'occupied' 
                            ? 'bg-[#22C55E]/20 text-[#22C55E]' 
                            : 'bg-[#FACC15]/20 text-[#FACC15]'
                        }`}>
                          {unit.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteUnit(unit.id)}>
                        Delete
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
