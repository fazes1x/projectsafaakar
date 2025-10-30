/*
  # Safaakar - Initial Database Schema

  ## Overview
  Creates the core database structure for the Safaakar trash collection tracking app.
  Supports two user roles: residents and supervisors.

  ## 1. New Tables
  
  ### `profiles`
  Extends Supabase auth.users with app-specific data:
  - `id` (uuid, primary key) - references auth.users
  - `role` (text) - either "resident" or "supervisor"
  - `address` (text) - house/location address
  - `language` (text) - "en" or "ur" for English/Urdu
  - `created_at` (timestamptz) - account creation timestamp

  ### `trash_pickups`
  Tracks daily trash collection status for each resident:
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references profiles
  - `date` (date) - pickup date
  - `status` (text) - "collected" or "pending"
  - `marked_at` (timestamptz) - when status was updated
  - Unique constraint on (user_id, date) - one record per user per day

  ### `reports`
  Issue reports submitted by residents with photos:
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references profiles (reporter)
  - `address` (text) - location of the issue
  - `comment` (text) - description of the issue
  - `photo_url` (text) - Supabase Storage URL
  - `status` (text) - "open" or "resolved"
  - `created_at` (timestamptz) - report submission time
  - `resolved_at` (timestamptz) - when supervisor resolved it
  - `resolved_by` (uuid) - supervisor who resolved it

  ## 2. Security
  
  - Enable RLS on all tables
  - Policies will be added in next migration for better organization
  
  ## 3. Important Notes
  
  - Default status for trash_pickups is "pending"
  - Default report status is "open"
  - Language defaults to "en" (English)
  - All IDs use UUID for security and scalability
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('resident', 'supervisor')),
  address text NOT NULL,
  language text DEFAULT 'en' CHECK (language IN ('en', 'ur')),
  created_at timestamptz DEFAULT now()
);

-- Create trash_pickups table
CREATE TABLE IF NOT EXISTS trash_pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'pending' CHECK (status IN ('collected', 'pending')),
  marked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address text NOT NULL,
  comment text,
  photo_url text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trash_pickups_user_date ON trash_pickups(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trash_pickups_date ON trash_pickups(date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;