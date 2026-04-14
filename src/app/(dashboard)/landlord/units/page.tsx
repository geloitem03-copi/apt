'use client'

import { useEffect, useState } from 'react'
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

export default function UnitsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<(Unit & { property_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [unitName, setUnitName] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: props } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id)

    if (props) {
      setProperties(props)
      const propertyIds = props.map((p) => p.id)

      if (propertyIds.length > 0) {
        const { data: unitData } = await supabase
          .from('units')
          .select('*')
          .in('property_id', propertyIds)

        if (unitData) {
          const unitsWithProps = unitData.map((u) => ({
            ...u,
            property_name: props.find((p) => p.id === u.property_id)?.name,
          }))
          setUnits(unitsWithProps)
        }
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('units').insert({
      property_id: propertyId,
      unit_name: unitName,
      rent_amount: Number(rentAmount),
      status: 'vacant',
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Unit created!')
      setOpen(false)
      setPropertyId('')
      setUnitName('')
      setRentAmount('')
      fetchData()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this unit?')) return

    const supabase = createClient()
    await supabase.from('units').delete().eq('id', id)
    toast.success('Unit deleted')
    fetchData()
  }

  return (
    <DashboardLayout role="landlord">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Units</h2>
            <p className="text-muted-foreground">Manage units in your properties</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>Add Unit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property</label>
                  <Select value={propertyId} onValueChange={(v) => setPropertyId(v || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit Name/Number</label>
                  <Input
                    placeholder="e.g., Room 101"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Rent (PHP)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Unit'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Units</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : units.length === 0 ? (
              <p className="text-muted-foreground">No units yet. Add your first unit!</p>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{unit.unit_name}</p>
                      <p className="text-sm text-muted-foreground">{unit.property_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₱{Number(unit.rent_amount).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          unit.status === 'occupied' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                        }`}>
                          {unit.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(unit.id)}>
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