-- Minimal schema - just add tables, don't touch auth trigger

-- PROPERTIES TABLE (apartments)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS TABLE (rooms)
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

-- INQUIRIES TABLE
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

-- RLS POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Landlord: see own properties
DROP POLICY IF EXISTS "landlords_see_properties" ON public.properties;
CREATE POLICY "landlords_see_properties" ON public.properties
  FOR SELECT USING (landlord_id = auth.uid());

-- Landlord: see own units
DROP POLICY IF EXISTS "landlords_see_units" ON public.units;
CREATE POLICY "landlords_see_units" ON public.units
  FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

-- Everyone can create inquiries
DROP POLICY IF EXISTS "anyone_create_inquiries" ON public.inquiries;
CREATE POLICY "anyone_create_inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Landlord: see inquiries for their properties
DROP POLICY IF EXISTS "landlords_see_inquiries" ON public.inquiries;
CREATE POLICY "landlords_see_inquiries" ON public.inquiries
  FOR SELECT USING (apartment_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));
