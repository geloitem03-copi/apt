export type UserRole = 'admin' | 'landlord' | 'tenant'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Property {
  id: string
  landlord_id: string
  name: string
  property_type: 'apartment' | 'house' | 'condo' | 'dormitory' | 'rooming house'
  address: string
  region: string
  city: string
  barangay: string
  zip_code: string
  total_floors: number
  year_built: number | null
  amenities: string[]
  description: string | null
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_name: string
  floor_number: number
  unit_type: 'studio' | '1bedroom' | '2bedroom' | '3bedroom' | 'bedspace'
  bedroom_count: number
  bathroom_count: number
  area_sqm: number
  rent_amount: number
  deposit_amount: number
  status: 'occupied' | 'vacant'
  furnishing_status: 'furnished' | 'semi-furnished' | 'unfurnished'
  with_ac: boolean
  with_own_cr: boolean
  description: string | null
  created_at: string
}

export interface Lease {
  id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string | null
  created_at: string
}

export interface Payment {
  id: string
  tenant_id: string
  unit_id: string
  amount: number
  payment_method: string
  payment_date: string
  proof_image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Bill {
  id: string
  tenant_id: string
  type: 'electricity' | 'water' | 'rent' | 'other'
  amount: number
  due_date: string
  status: 'pending' | 'paid'
  created_at: string
}