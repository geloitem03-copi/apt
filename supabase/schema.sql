-- Database Schema for Rental Management SaaS
-- Run this in Supabase SQL Editor

-- Just create tables if they don't exist (don't drop - preserves existing data)

-- PROPERTIES TABLE (apartments) - if not exists
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS TABLE (rooms) - if not exists
CREATE TABLE IF NOT EXISTS public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('occupied', 'vacant')) DEFAULT 'vacant',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INQUIRIES TABLE - if not exists
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  apartment_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('new', 'contacted', 'completed')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEASES TABLE - if not exists
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS TABLE - if not exists
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_date DATE NOT NULL,
  proof_image_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLS TABLE - if not exists
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('unpaid', 'paid')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Landlord: see own properties
DROP POLICY IF EXISTS "landlords_see_properties" ON public.properties;
CREATE POLICY "landlords_see_properties" ON public.properties
  FOR SELECT USING (landlord_id = auth.uid());

-- Landlord: see own units
DROP POLICY IF EXISTS "landlords_see_units" ON public.units;
CREATE POLICY "landlords_see_units" ON public.units
  FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

-- Tenant: see own payments only
DROP POLICY IF EXISTS "tenants_see_payments" ON public.payments;
CREATE POLICY "tenants_see_payments" ON public.payments
  FOR SELECT USING (tenant_id = auth.uid());

-- Everyone can create inquiries
DROP POLICY IF EXISTS "anyone_create_inquiries" ON public.inquiries;
CREATE POLICY "anyone_create_inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Landlord: see inquiries for their properties
DROP POLICY IF EXISTS "landlords_see_inquiries" ON public.inquiries;
CREATE POLICY "landlords_see_inquiries" ON public.inquiries
  FOR SELECT USING (apartment_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));
