-- Connect schema: functions and trigger for new auth users
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Schema: connect (people, profiles, households, household_invitations).

-- ---------------------------------------------------------------------------
-- 0. gender on connect.people: allow NULL, no default (required for signup)
-- The column had default "" which violated the check; omit default so NULL is used.
-- ---------------------------------------------------------------------------
ALTER TABLE connect.people ALTER COLUMN gender DROP DEFAULT;
ALTER TABLE connect.people DROP CONSTRAINT IF EXISTS people_gender_check;
ALTER TABLE connect.people ADD CONSTRAINT people_gender_check
  CHECK (gender IS NULL OR gender IN ('Male', 'Female'));

-- ---------------------------------------------------------------------------
-- 1. handle_new_user (trigger on auth.users)
-- Creates connect.people and connect.profiles when a new user signs up.
-- Sign-up passes options.data: { first_name, last_name }; email from auth.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION connect.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = connect, pg_temp
AS $$
DECLARE
  new_person_id uuid;
  meta jsonb;
  fname text;
  lname text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  fname := COALESCE(NULLIF(TRIM(meta->>'first_name'), ''), '');
  lname := COALESCE(NULLIF(TRIM(meta->>'last_name'), ''), '');

  new_person_id := gen_random_uuid();

  -- gender and marital_status left NULL on creation (gender allowed: NULL, 'Male', 'Female')
  INSERT INTO connect.people (id, first_name, last_name, email, updated_at)
  VALUES (
    new_person_id,
    fname,
    lname,
    COALESCE(NEW.email, ''),
    NOW()
  );

  INSERT INTO connect.profiles (id, person_id, first_name, last_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    new_person_id,
    fname,
    lname,
    COALESCE(NEW.email, ''),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Trigger on auth.users (run once; drop first if re-running this migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION connect.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. current_person_id
-- Returns the person_id for the current JWT user (from connect.profiles).
-- Used by RLS or other logic that needs "current user's person".
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION connect.current_person_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = connect, pg_temp
AS $$
  SELECT person_id FROM connect.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 3. person_has_account
-- Returns true if the given person_id has a row in connect.profiles.
-- Used to avoid RLS blocking reads of other users' profiles.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION connect.person_has_account(check_person_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = connect, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM connect.profiles WHERE person_id = check_person_id);
$$;

-- ---------------------------------------------------------------------------
-- 4. person_ids_with_accounts
-- Returns the subset of the given person_ids that have a profile.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION connect.person_ids_with_accounts(person_ids uuid[])
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = connect, pg_temp
AS $$
  SELECT p.person_id FROM connect.profiles p WHERE p.person_id = ANY(person_ids);
$$;

-- ---------------------------------------------------------------------------
-- 5. remove_household_member
-- Removes a person from a household. If the person has an account (is user),
-- creates a new household and sets them as Head. If not, sets household null.
-- If the old household has no members left, deletes it.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION connect.remove_household_member(
  p_household_id uuid,
  p_person_id uuid,
  p_is_user boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = connect, pg_temp
AS $$
DECLARE
  new_household_id uuid;
  member_count int;
BEGIN
  IF p_is_user THEN
    -- Create new household and set person as Head of Household
    INSERT INTO connect.households DEFAULT VALUES
    RETURNING id INTO new_household_id;

    UPDATE connect.people
    SET
      household = new_household_id,
      household_membership_type = 'Head of Household',
      updated_at = NOW()
    WHERE id = p_person_id;
  ELSE
    -- Non-user: clear household and membership type
    UPDATE connect.people
    SET
      household = NULL,
      household_membership_type = NULL,
      updated_at = NOW()
    WHERE id = p_person_id;
  END IF;

  -- Count remaining members in the old household
  SELECT COUNT(*)::int INTO member_count
  FROM connect.people
  WHERE household = p_household_id;

  IF member_count = 0 THEN
    DELETE FROM connect.households WHERE id = p_household_id;
  END IF;
END;
$$;
