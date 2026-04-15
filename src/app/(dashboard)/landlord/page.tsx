'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Property, Unit } from '@/types/database'
import { Building2, DoorOpen, Users, Wallet, Plus, Clock, CheckCircle } from 'lucide-react'

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Welcome back, {profile?.name || 'Landlord'}</h2>
            <p className="text-[#64748B]">Overview of your properties</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-[#4F46E5] bg-[#4F46E5]/10 rounded-lg hover:bg-[#4F46E5]/20 transition-colors">
              Add Property
            </button>
          </div>
        </div>

        {/* Stats Cards - 4 column grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Properties</CardTitle>
              <Building2 className="h-4 w-4 text-[#4F46E5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{properties.length}</div>
              <p className="text-xs text-[#64748B] mt-1">Total buildings</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Units</CardTitle>
              <DoorOpen className="h-4 w-4 text-[#4F46E5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{units.length}</div>
              <p className="text-xs text-[#64748B] mt-1">{occupiedUnits} occupied, {vacantUnits} vacant</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-[#4F46E5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{occupiedUnits}</div>
              <p className="text-xs text-[#64748B] mt-1">Currently renting</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">Monthly Revenue</CardTitle>
              <Wallet className="h-4 w-4 text-[#4F46E5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">₱{totalRent.toLocaleString()}</div>
              <p className="text-xs text-[#64748B] mt-1">Expected monthly</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Rent Due */}
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0F172A]">Upcoming Rent Due</CardTitle>
              <Clock className="h-5 w-5 text-[#64748B]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-[#64748B]">Loading...</p>
              ) : units.filter(u => u.status === 'occupied').length === 0 ? (
                <p className="text-[#64748B]">No occupied units</p>
              ) : (
                <div className="space-y-3">
                  {units.filter(u => u.status === 'occupied').slice(0, 5).map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                      <div>
                        <p className="font-medium text-[#0F172A]">{unit.unit_name}</p>
                        <p className="text-sm text-[#64748B]">Due in 5 days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#0F172A]">₱{Number(unit.rent_amount).toLocaleString()}</p>
                        <span className="text-xs px-2 py-1 bg-[#FACC15]/20 text-[#FACC15] rounded-full">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0F172A]">Recent Payments</CardTitle>
              <CheckCircle className="h-5 w-5 text-[#64748B]" />
            </CardHeader>
            <CardContent>
              <p className="text-[#64748B]">No recent payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Properties List */}
        <Card className="rounded-2xl shadow-sm border-[#E2E8F0]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0F172A]">Properties</CardTitle>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4F46E5] bg-[#4F46E5]/10 rounded-lg hover:bg-[#4F46E5]/20 transition-colors">
              <Plus size={16} />
              Add Property
            </button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-[#64748B]">Loading...</p>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#64748B]">No properties yet. Add your first property!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-[#4F46E5]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{property.name}</p>
                        <p className="text-sm text-[#64748B]">{property.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#64748B]">
                        {units.filter(u => u.property_id === property.id).length} units
                      </p>
                      <p className="text-sm font-medium text-[#0F172A]">
                        ₱{units.filter(u => u.property_id === property.id).reduce((sum, u) => sum + Number(u.rent_amount), 0).toLocaleString()}/mo
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