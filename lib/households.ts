import supabase from "@/lib/supabase";

export type Household = {
  id: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  home_campus: string | null;
  created_at: string;
  updated_at: string;
};

export type HouseholdMemberRole = "head" | "member";
export type HouseholdRelationship = "married_to" | "in_a_relationship_with" | "parent_of";

export type HouseholdMember = {
  id: string;
  household_id: string;
  person_id: string;
  role: HouseholdMemberRole;
  relationship: HouseholdRelationship | null;
  created_at: string;
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    preferred_name: string;
    avatar_path: string | null;
  };
  has_account?: boolean;
};

export type HouseholdWithMembers = Household & {
  members: HouseholdMember[];
  display_name: string;
};

export type CampusLocation = {
  location: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  type: string;
};

/** Locations that are physical campuses (for home campus dropdown). */
export async function getCampusLocations(): Promise<CampusLocation[]> {
  const { data, error } = await supabase
    .schema("connect")
    .from("locations")
    .select("location, address, city, state, zip, type")
    .in("type", ["physical_campus", "physical_property"]);
  if (error) return [];
  return (data ?? []) as CampusLocation[];
}

/** Get the household the current user belongs to (if any), with members and person details. */
export async function getMyHousehold(personId: string): Promise<HouseholdWithMembers | null> {
  const { data: membership } = await supabase
    .schema("connect")
    .from("household_members")
    .select("household_id")
    .eq("person_id", personId)
    .limit(1)
    .single();
  if (!membership?.household_id) return null;

  const { data: household, error: hError } = await supabase
    .schema("connect")
    .from("households")
    .select("*")
    .eq("id", membership.household_id)
    .single();
  if (hError || !household) return null;

  const { data: members, error: mError } = await supabase
    .schema("connect")
    .from("household_members")
    .select(`
      id, household_id, person_id, role, relationship, created_at,
      person:people(id, first_name, last_name, email, preferred_name, avatar_path)
    `)
    .eq("household_id", household.id)
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });
  if (mError) return null;

  const personIds = (members ?? []).map((m: { person_id: string }) => m.person_id);
  const { data: idsWithAccount } = await supabase.schema("connect").rpc("person_ids_with_accounts", {
    person_ids: personIds,
  });
  const accountSet = new Set<string>(
    Array.isArray(idsWithAccount)
      ? idsWithAccount.map((id: unknown) =>
          typeof id === "string" ? id : (id as { person_ids_with_accounts?: string })?.person_ids_with_accounts ?? ""
        ).filter(Boolean)
      : []
  );

  const membersWithAccount = (members ?? []).map((m: HouseholdMember & { person?: unknown }) => ({
    ...m,
    person: Array.isArray(m.person) ? m.person[0] : m.person,
    has_account: accountSet.has(m.person_id),
  })) as HouseholdMember[];

  const firstHead = membersWithAccount.find((m) => m.role === "head");
  const firstHeadLastName =
    firstHead && firstHead.person ? (firstHead.person as { last_name: string }).last_name : "";
  const display_name = [firstHeadLastName, household.street_address, household.city]
    .filter(Boolean)
    .join(" | ") || "My household";

  return {
    ...(household as Household),
    members: membersWithAccount,
    display_name,
  };
}

/** Create a new household and add the given person as head. */
export async function createHousehold(personId: string, address: {
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  home_campus?: string | null;
}): Promise<{ household: Household } | { error: string }> {
  const { data: household, error: insertError } = await supabase
    .schema("connect")
    .from("households")
    .insert({
      street_address: address.street_address || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || "",
      home_campus: address.home_campus ?? null,
    })
    .select()
    .single();
  if (insertError || !household) return { error: insertError?.message ?? "Failed to create household" };

  const { error: memberError } = await supabase
    .schema("connect")
    .from("household_members")
    .insert({
      household_id: household.id,
      person_id: personId,
      role: "head",
      relationship: null,
    });
  if (memberError) {
    await supabase.schema("connect").from("households").delete().eq("id", household.id);
    return { error: memberError.message };
  }
  return { household: household as Household };
}

/** Update household address/campus (caller must be a head). */
export async function updateHousehold(
  householdId: string,
  address: {
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    home_campus?: string | null;
  }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .schema("connect")
    .from("households")
    .update({
      ...address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", householdId);
  return { error: error?.message };
}

/** Add a person (by id) to the household. Fails if person is already in another household. */
export async function addMemberToHousehold(
  householdId: string,
  personId: string,
  role: HouseholdMemberRole,
  relationship: HouseholdRelationship | null
): Promise<{ error?: string }> {
  const { error } = await supabase.schema("connect").from("household_members").insert({
    household_id: householdId,
    person_id: personId,
    role,
    relationship,
  });
  return { error: error?.message };
}

/** Create a new person (no account) and add to household. */
export async function addPersonWithoutAccount(
  householdId: string,
  role: HouseholdMemberRole,
  relationship: HouseholdRelationship | null,
  person: { first_name: string; last_name: string; email?: string | null }
): Promise<{ person_id: string } | { error: string }> {
  const { data: newPerson, error: personError } = await supabase
    .schema("connect")
    .from("people")
    .insert({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email ?? null,
      preferred_name: person.first_name,
      phone_number: "",
      date_of_birth: "1900-01-01",
      gender: "male",
      marital_status: "single",
    })
    .select("id")
    .single();
  if (personError || !newPerson) return { error: personError?.message ?? "Failed to create person" };

  const { error: memberError } = await supabase.schema("connect").from("household_members").insert({
    household_id: householdId,
    person_id: newPerson.id,
    role,
    relationship,
  });
  if (memberError) {
    await supabase.schema("connect").from("people").delete().eq("id", newPerson.id);
    return { error: memberError.message };
  }
  return { person_id: newPerson.id };
}

/** Find person by email (in people table). Returns null if not found. */
export async function findPersonByEmail(email: string): Promise<{ id: string } | null> {
  const { data } = await supabase
    .schema("connect")
    .from("people")
    .select("id")
    .ilike("email", email.trim())
    .limit(1)
    .single();
  return data ? { id: (data as { id: string }).id } : null;
}

/** Check if a person has an account (exists in profiles). */
export async function personHasAccount(personId: string): Promise<boolean> {
  const { data } = await supabase
    .schema("connect")
    .from("profiles")
    .select("id")
    .eq("person_id", personId)
    .limit(1)
    .single();
  return !!data;
}

/** Add member by email. If they have an account, adds to household. If not, creates person, adds to household, and invites via Edge Function. */
export async function addMemberByEmail(
  householdId: string,
  email: string,
  role: HouseholdMemberRole,
  relationship: HouseholdRelationship | null,
  options: { first_name?: string; last_name?: string }
): Promise<{ success: true } | { error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { error: "Email is required." };

  const person = await findPersonByEmail(trimmed);
  const hasAccount = person ? await personHasAccount(person.id) : false;

  if (person && hasAccount) {
    const err = await addMemberToHousehold(householdId, person.id, role, relationship);
    return err.error ? { error: err.error } : { success: true };
  }

  if (person && !hasAccount) {
    const err = await addMemberToHousehold(householdId, person.id, role, relationship);
    if (err.error) return { error: err.error };
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: "Not authenticated." };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") + "/functions/v1/invite-household-member";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ household_id: householdId, email: trimmed }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: (json as { error?: string }).error ?? "Failed to send invite." };
    return { success: true };
  }

  if (!person) {
    const { data: newPerson, error: personError } = await supabase
      .schema("connect")
      .from("people")
      .insert({
        first_name: options.first_name ?? "",
        last_name: options.last_name ?? "",
        email: trimmed,
        preferred_name: options.first_name ?? "",
        phone_number: "",
        date_of_birth: "1900-01-01",
        gender: "male",
        marital_status: "single",
      })
      .select("id")
      .single();
    if (personError || !newPerson) return { error: personError?.message ?? "Failed to create person." };
    const err = await addMemberToHousehold(householdId, newPerson.id, role, relationship);
    if (err.error) {
      await supabase.schema("connect").from("people").delete().eq("id", newPerson.id);
      return { error: err.error };
    }
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: "Not authenticated." };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") + "/functions/v1/invite-household-member";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ household_id: householdId, email: trimmed }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: (json as { error?: string }).error ?? "Failed to send invite." };
    return { success: true };
  }

  return { error: "Unable to add member." };
}

/** Update a member's role or relationship. */
export async function updateHouseholdMember(
  memberId: string,
  updates: { role?: HouseholdMemberRole; relationship?: HouseholdRelationship | null }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .schema("connect")
    .from("household_members")
    .update(updates)
    .eq("id", memberId);
  return { error: error?.message };
}

/** Remove a member from the household. If they were the last member, delete the household. */
export async function removeMemberFromHousehold(
  householdId: string,
  memberId: string
): Promise<{ error?: string }> {
  const { error: delError } = await supabase
    .schema("connect")
    .from("household_members")
    .delete()
    .eq("id", memberId);
  if (delError) return { error: delError.message };

  const { data: remaining } = await supabase
    .schema("connect")
    .from("household_members")
    .select("id")
    .eq("household_id", householdId);
  if (remaining && remaining.length === 0) {
    await supabase.schema("connect").from("households").delete().eq("id", householdId);
  }
  return {};
}
