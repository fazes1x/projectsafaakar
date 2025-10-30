/*
  # Auto-confirm user emails on signup

  ## Overview
  Creates a database trigger that automatically confirms user emails
  when they sign up, bypassing the email confirmation requirement.
  This is useful for development and for applications where email
  confirmation is not required.

  ## Changes
  1. Create a function that confirms emails automatically
  2. Create a trigger that runs after user insert

  ## Security Note
  This disables email verification. In production, you may want to
  enable proper email confirmation through Supabase Auth settings.
*/

-- Create function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on user insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();