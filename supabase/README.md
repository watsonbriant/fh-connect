# Supabase migrations

This folder holds SQL that defines **connect** schema functions and the auth trigger used by FHConnect.

## How to run

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Copy the contents of `migrations/20250226000000_connect_functions_and_trigger.sql` and paste into the editor.
4. Click **Run**.

## What it sets up

- **Trigger `on_auth_user_created`** on `auth.users`: when a new user signs up, `connect.handle_new_user()` runs and:
  - Inserts a row into `connect.people` (id, first_name, last_name, email from signup).
  - Inserts a row into `connect.profiles` (id = auth user id, person_id = new person, first_name, last_name, email).
- **Functions** in schema `connect`:
  - `current_person_id()` – person_id for the current JWT user.
  - `person_has_account(check_person_id)` – whether that person has a profile.
  - `person_ids_with_accounts(person_ids)` – subset of person_ids that have a profile.
  - `remove_household_member(p_household_id, p_person_id, p_is_user)` – remove member; if user, create new household and set as Head; if last member, delete household.

## Prerequisites

- Schema **connect** must exist with tables: **people**, **profiles**, **households**, **household_invitations** (and any columns they reference).
- Tables **people** and **profiles** must have at least the columns referenced in the migration (e.g. people: id, first_name, last_name, email, updated_at; profiles: id, person_id, first_name, last_name, email, created_at, updated_at).

If you re-run the migration, the trigger is dropped and recreated; functions are replaced.
