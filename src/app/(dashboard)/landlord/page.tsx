'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Property, Unit } from '@/types/database'

interface Profile {
  id: string
  name: string
  email: string
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) setProfile(profileData)

      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)

      if (props) {
        setProperties(props)
        
        const propertyIds = props.map((p: Property) => p.id)
        if (propertyIds.length > 0) {
          const { data: unitData } = await supabase
            .from('units')
            .select('*')
            .in('property_id', propertyIds)
          
          if (unitData) setUnits(unitData)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const occupiedUnits = units.filter(u => u.status === 'occupied').length
  const vacantUnits = units.filter(u => u.status === 'vacant').length
  const totalRent = units.reduce((sum, u) => sum + Number(u.rent_amount), 0)

  return (
    <DashboardLayout role="landlord" userName={profile?.name || profile?.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {profile?.name || 'Landlord'}</h2>
          <p className="text-muted-foreground">Overview of your properties</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupiedUnits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalRent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : properties.length === 0 ? (
              <p className="text-muted-foreground">No properties yet. Add your first property!</p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {units.filter(u => u.property_id === property.id).length} units
                      </p>
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