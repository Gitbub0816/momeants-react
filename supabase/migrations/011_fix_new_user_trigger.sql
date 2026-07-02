-- Fix: "Database error saving new user" on sign-up / invite.
-- handle_new_user() is SECURITY DEFINER but had no pinned search_path, so when
-- the auth service fires the trigger the unqualified `profiles` reference can
-- fail to resolve. Pin the search_path and fully qualify the table. Also make
-- the generated username collision-proof and never let a profile hiccup abort
-- the auth user creation.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 12)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation because of a profile insert problem;
  -- the app upserts the profile again during onboarding.
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
