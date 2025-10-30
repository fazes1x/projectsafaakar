/*
  # Safaakar - Row Level Security Policies

  ## Overview
  Implements comprehensive RLS policies for all tables ensuring:
  - Residents can only access their own data
  - Supervisors can view all residents' data
  - Proper authentication checks on all operations

  ## Profiles Table Policies
  
  1. **SELECT**: Users can view their own profile, supervisors can view all
  2. **INSERT**: Users can create their own profile during signup
  3. **UPDATE**: Users can update their own profile only
  4. **DELETE**: Users can delete their own profile

  ## Trash Pickups Table Policies
  
  1. **SELECT**: Residents view own pickups, supervisors view all
  2. **INSERT**: Residents can create their own pickup records
  3. **UPDATE**: Residents can update their own pickup status
  4. **DELETE**: Residents can delete their own records (if needed)

  ## Reports Table Policies
  
  1. **SELECT**: Residents view own reports, supervisors view all
  2. **INSERT**: Only residents can submit reports
  3. **UPDATE**: Only supervisors can update (resolve) reports
  4. **DELETE**: No one can delete reports (data integrity)
*/

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Profiles: SELECT policy
CREATE POLICY "Users can view own profile, supervisors view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supervisor'
    )
  );

-- Profiles: INSERT policy
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Profiles: UPDATE policy
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles: DELETE policy
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- TRASH PICKUPS TABLE POLICIES
-- ============================================

-- Trash Pickups: SELECT policy
CREATE POLICY "Residents view own pickups, supervisors view all"
  ON trash_pickups FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

-- Trash Pickups: INSERT policy
CREATE POLICY "Residents can create own pickup records"
  ON trash_pickups FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'resident'
    )
  );

-- Trash Pickups: UPDATE policy
CREATE POLICY "Residents can update own pickup status"
  ON trash_pickups FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trash Pickups: DELETE policy
CREATE POLICY "Residents can delete own pickup records"
  ON trash_pickups FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Reports: SELECT policy
CREATE POLICY "Residents view own reports, supervisors view all"
  ON reports FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

-- Reports: INSERT policy (only residents can submit)
CREATE POLICY "Only residents can submit reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'resident'
    )
  );

-- Reports: UPDATE policy (only supervisors can resolve)
CREATE POLICY "Only supervisors can resolve reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supervisor'
    )
  );

-- Reports: No DELETE policy (data integrity - reports should never be deleted)