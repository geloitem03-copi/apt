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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase'
import { Property, Unit } from '@/types/database'
import { toast } from 'sonner'
import { ArrowLeft, Plus, DoorOpen, MapPin } from 'lucide-react'

const UNIT_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Private Room' },
  { value: 'bedspace', label: 'Bedspace (Shared)' },
]

const FURNISHING_STATUS = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
]

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [unitName, setUnitName] = useState('')
  const [floorNumber, setFloorNumber] = useState('')
  const [unitType, setUnitType] = useState<string>('')
  const [numberOfRooms, setNumberOfRooms] = useState('')
  const [bathroomCount, setBathroomCount] = useState('')
  const [areaSqm, setAreaSqm] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [furnishingStatus, setFurnishingStatus] = useState<string>('')
  const [withAc, setWithAc] = useState(false)
  const [withOwnCr, setWithOwnCr] = useState(false)
  const [securityDepositOverride, setSecurityDepositOverride] = useState('')
  const [advancePaymentOverride, setAdvancePaymentOverride] = useState('')
  const [description, setDescription] = useState('')

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

  const resetUnitForm = () => {
    setUnitName('')
    setFloorNumber('')
    setUnitType('')
    setNumberOfRooms('')
    setBathroomCount('')
    setAreaSqm('')
    setRentAmount('')
    setFurnishingStatus('')
    setWithAc(false)
    setWithOwnCr(false)
    setSecurityDepositOverride('')
    setAdvancePaymentOverride('')
    setDescription('')
  }

  const handleUnitTypeChange = (value: string | null) => {
    setUnitType(value || '')
    if (value !== 'room') {
      setNumberOfRooms('')
    }
  }
  const handleFurnishingStatusChange = (value: string | null) => setFurnishingStatus(value || '')

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()

    const { error } = await supabase.from('units').insert({
      property_id: propertyId,
      unit_name: unitName,
      floor_number: floorNumber ? Number(floorNumber) : null,
      unit_type: unitType as any,
      number_of_rooms: unitType === 'room' && numberOfRooms ? Number(numberOfRooms) : null,
      bathroom_count: bathroomCount ? Number(bathroomCount) : null,
      area_sqm: areaSqm ? Number(areaSqm) : null,
      rent_amount: Number(rentAmount) || 0,
      status: 'vacant',
      furnishing_status: furnishingStatus as any,
      with_ac: withAc,
      with_own_cr: withOwnCr,
      security_deposit_override: securityDepositOverride ? Number(securityDepositOverride) : null,
      advance_payment_override: advancePaymentOverride ? Number(advancePaymentOverride) : null,
      description: description || null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Unit added!')
      setOpen(false)
      resetUnitForm()
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

  const showNumberOfRooms = unitType === 'room'

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/landlord/properties')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{property?.name}</h2>
            <p className="text-[#64748B] flex items-center gap-1">
              <MapPin size={14} />
              {property?.barangay}, {property?.city}, {property?.region}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUnit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Name/Number *</label>
                  <Input
                    placeholder="e.g., Unit 101, Room 1A"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Floor Number</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={floorNumber}
                      onChange={(e) => setFloorNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Type *</label>
                    <Select value={unitType} onValueChange={handleUnitTypeChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showNumberOfRooms && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Rooms *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={bathroomCount}
                      onChange={(e) => setBathroomCount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Area (sqm)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={areaSqm}
                      onChange={(e) => setAreaSqm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Rent (₱) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Furnishing</label>
                    <Select value={furnishingStatus} onValueChange={handleFurnishingStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {FURNISHING_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amenities</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={withAc}
                        onChange={(e) => setWithAc(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      With AC
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={withOwnCr}
                        onChange={(e) => setWithOwnCr(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Own CR
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-[#64748B] mb-3">Override Payment Settings (Optional)</p>
                  <p className="text-xs text-[#64748B] mb-3">Leave empty to use property defaults</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Security Deposit (₱)</label>
                      <Input
                        type="number"
                        placeholder="Override deposit"
                        value={securityDepositOverride}
                        onChange={(e) => setSecurityDepositOverride(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Advance Payment (₱)</label>
                      <Input
                        type="number"
                        placeholder="Override advance"
                        value={advancePaymentOverride}
                        onChange={(e) => setAdvancePaymentOverride(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Additional details..."
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
                      <p className="text-sm text-[#64748B]">
                        {unit.unit_type === 'studio' ? 'Studio' : 
                         unit.unit_type === 'room' ? `${unit.number_of_rooms || 'N/A'} Private Room` : 
                         'Bedspace'} | 
                        Floor {unit.floor_number || 'N/A'} | 
                        {unit.area_sqm ? ` ${unit.area_sqm}m²` : ''}
                        {unit.with_ac && ' | AC'}
                        {unit.with_own_cr && ' | Private CR'}
                      </p>
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
