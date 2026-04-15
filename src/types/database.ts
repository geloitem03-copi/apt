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
  address: string
  created_at: string
}

export interface Unit {
  id: string
  property_id: string
  unit_name: string
  rent_amount: number
  status: 'occupied' | 'vacant'
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