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
import { Building2, MapPin, ArrowRight, Plus } from 'lucide-react'

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment Building' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condominium' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'rooming house', label: 'Rooming House' },
]

const PHILIPPINE_REGIONS = [
  'NCR (National Capital Region)',
  'CAR (Cordillera Administrative Region)',
  'Region I (Ilocos Region)',
  'Region II (Cagayan Valley)',
  'Region III (Central Luzon)',
  'Region IV-A (CALABARZON)',
  'Region IV-B (MIMAROPA)',
  'Region V (Bicol Region)',
  'Region VI (Western Visayas)',
  'Region VII (Central Visayas)',
  'Region VIII (Eastern Visayas)',
  'Region IX (Zamboanga Peninsula)',
  'Region X (Northern Mindanao)',
  'Region XI (Davao Region)',
  'Region XII (SOCCSKSARGEN)',
  'Region XIII (Caraga)',
  'BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)',
]

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<(Property & { units?: Unit[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [propertyType, setPropertyType] = useState<string>('')
  const [address, setAddress] = useState('')
  const [region, setRegion] = useState<string>('')
  const [city, setCity] = useState('')
  const [barangay, setBarangay] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')
  const [description, setDescription] = useState('')

  const handlePropertyTypeChange = (value: string | null) => setPropertyType(value || '')
  const handleRegionChange = (value: string | null) => setRegion(value || '')

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

  const resetForm = () => {
    setName('')
    setPropertyType('')
    setAddress('')
    setRegion('')
    setCity('')
    setBarangay('')
    setZipCode('')
    setTotalFloors('')
    setYearBuilt('')
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fullAddress = `${barangay}, ${city}, ${region} ${zipCode}`.trim()

    const { error } = await supabase.from('properties').insert({
      landlord_id: user.id,
      name,
      property_type: propertyType,
      address: fullAddress,
      region,
      city,
      barangay,
      zip_code: zipCode,
      total_floors: totalFloors ? Number(totalFloors) : null,
      year_built: yearBuilt ? Number(yearBuilt) : null,
      amenities: [],
      description: description || null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Property created!')
      setOpen(false)
      resetForm()
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
            <DialogTrigger>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Name *</label>
                  <Input
                    placeholder="e.g., Sunset Apartments"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type *</label>
                  <Select value={propertyType} onValueChange={handlePropertyTypeChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region *</label>
                    <Select value={region} onValueChange={handleRegionChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {PHILIPPINE_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City/Municipality *</label>
                    <Input
                      placeholder="e.g., Quezon City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Barangay *</label>
                    <Input
                      placeholder="e.g., Batasan Hills"
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP Code</label>
                    <Input
                      placeholder="e.g., 1126"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Floors</label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year Built</label>
                    <Input
                      type="number"
                      placeholder="e.g., 2020"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                    />
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