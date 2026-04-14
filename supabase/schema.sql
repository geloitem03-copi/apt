-- Tables for Supabase

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'landlord'
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  unit_name TEXT NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'vacant',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  apartment_id UUID,
  room_id UUID,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow anyone to insert profiles (for auth trigger)
CREATE POLICY "auth_insert_profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Landlords can see their properties
CREATE POLICY "landlords_read_properties" ON properties
  FOR SELECT USING (landlord_id = auth.uid());

-- Landlords can insert properties
CREATE POLICY "landlords_insert_properties" ON properties
  FOR INSERT WITH CHECK (landlord_id = auth.uid());

-- Landlords can update their properties
CREATE POLICY "landlords_update_properties" ON properties
  FOR UPDATE USING (landlord_id = auth.uid());

-- Landlords can see their units
CREATE POLICY "landlords_read_units" ON units
  FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

-- Landlords can insert units
CREATE POLICY "landlords_insert_units" ON units
  FOR INSERT WITH CHECK (property_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));

-- Anyone can create inquiries
CREATE POLICY "public_insert_inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Landlords can see inquiries for their properties
CREATE POLICY "landlords_read_inquiries" ON inquiries
  FOR SELECT USING (apartment_id IN (SELECT id FROM properties WHERE landlord_id = auth.uid()));
