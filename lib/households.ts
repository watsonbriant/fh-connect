import supabase from "@/lib/supabase";

export type Household = {
  id: string;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type HouseholdMembershipType = "Head of Household" | "Child" | "Other";

export type HouseholdMemberPerson = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  preferred_name: string;
  avatar_path: string | null;
  date_of_birth?: string;
  household_membership_type: HouseholdMembershipType | null;
};

export type HouseholdMember = {
  person_id: string;
  person: HouseholdMemberPerson;
  household_membership_type: HouseholdMembershipType;
  has_account?: boolean;
};

export type HouseholdWithMembers = Household & {
  members: HouseholdMember[];
};

export type HouseholdInvitation = {
  id: string;
  household_id: string;
  inviter_person_id: string;
  invitee_person_id: string;
  membership_type: HouseholdMembershipType;
  created_at: string;
  inviter?: { first_name: string; last_name: string; preferred_name: string };
};

export type CampusLocation = {
  location: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  type: string;
};

const MEMBERSHIP_ORDER: Record<HouseholdMembershipType, number> = {
  "Head of Household": 0,
  Child: 1,
  Other: 2,
};

function sortMembers(members: HouseholdMember[]): HouseholdMember[] {
  return [...members].sort((a, b) => {
    const orderA = MEMBERSHIP_ORDER[a.household_membership_type] ?? 3;
    const orderB = MEMBERSHIP_ORDER[b.household_membership_type] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    const lnA = (a.person?.last_name ?? "").toLowerCase();
    const lnB = (b.person?.last_name ?? "").toLowerCase();
    if (lnA !== lnB) return lnA.localeCompare(lnB);
    const dobA = a.person?.date_of_birth ?? "";
    const dobB = b.person?.date_of_birth ?? "";
    return dobA.localeCompare(dobB);
  });
}

/** Get the household the current user belongs to (by people.household), with members. */
export async function getMyHousehold(personId: string): Promise<HouseholdWithMembers | null> {
  const { data: person, error: pError } = await supabase
    .schema("connect")
    .from("people")
    .select("household")
    .eq("id", personId)
    .single();
  if (pError || !person?.household) return null;

  const householdId = person.household as string;
  const { data: household, error: hError } = await supabase
    .schema("connect")
    .from("households")
    .select("id, street_address, city, state, zip")
    .eq("id", householdId)
    .single();
  if (hError || !household) return null;

  const { data: peopleRows, error: peopleError } = await supabase
    .schema("connect")
    .from("people")
    .select("id, first_name, last_name, email, preferred_name, avatar_path, date_of_birth, household_membership_type")
    .eq("household", householdId);
  if (peopleError || !peopleRows?.length) {
    return { ...(household as Household), members: [] };
  }

  const personIds = peopleRows.map((p: { id: string }) => p.id);
  let accountSet = new Set<string>();
  const { data: idsWithAccount } = await supabase.schema("connect").rpc("person_ids_with_accounts", {
    person_ids: personIds,
  });
  if (Array.isArray(idsWithAccount)) {
    accountSet = new Set(
      idsWithAccount
        .map((id: unknown) =>
          typeof id === "string" ? id : (id as { person_ids_with_accounts?: string })?.person_ids_with_accounts ?? ""
        )
        .filter(Boolean)
    );
  }

  const members: HouseholdMember[] = peopleRows.map((p: Record<string, unknown>) => ({
    person_id: p.id as string,
    person: {
      id: p.id as string,
      first_name: (p.first_name as string) ?? "",
      last_name: (p.last_name as string) ?? "",
      email: (p.email as string | null) ?? null,
      preferred_name: (p.preferred_name as string) ?? "",
      avatar_path: (p.avatar_path as string | null) ?? null,
      date_of_birth: p.date_of_birth as string | undefined,
      household_membership_type: (p.household_membership_type as HouseholdMembershipType | null) ?? null,
    },
    household_membership_type: (p.household_membership_type as HouseholdMembershipType) ?? "Other",
    has_account: accountSet.has(p.id as string),
  }));

  return {
    ...(household as Household),
    members: sortMembers(members),
  };
}

/** Update household address (caller must be a Head). */
export async function updateHousehold(
  householdId: string,
  address: {
    street_address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .schema("connect")
    .from("households")
    .update({
      street_address: address.street_address ?? null,
      city: address.city ?? null,
      state: address.state ?? null,
      zip: address.zip ?? null,
    })
    .eq("id", householdId);
  return { error: error?.message };
}

/** Ensure this person has a household (create one if missing). Used after account creation / backfill gap. */
export async function ensureHouseholdForPerson(personId: string): Promise<{ household_id: string } | { error: string }> {
  const { data: person, error: pError } = await supabase
    .schema("connect")
    .from("people")
    .select("household")
    .eq("id", personId)
    .single();
  if (pError || !person) return { error: "Person not found." };
  if (person.household) return { household_id: person.household as string };

  const { data: household, error: hError } = await supabase
    .schema("connect")
    .from("households")
    .insert({})
    .select("id")
    .single();
  if (hError || !household) return { error: hError?.message ?? "Failed to create household." };

  const { error: uError } = await supabase
    .schema("connect")
    .from("people")
    .update({
      household: household.id,
      household_membership_type: "Head of Household",
      updated_at: new Date().toISOString(),
    })
    .eq("id", personId);
  if (uError) {
    await supabase.schema("connect").from("households").delete().eq("id", household.id);
    return { error: uError.message };
  }
  return { household_id: household.id };
}

/** Get pending invitations for the given person (invitee). */
export async function getPendingInvitationsForPerson(personId: string): Promise<HouseholdInvitation[]> {
  const { data: rows, error } = await supabase
    .schema("connect")
    .from("household_invitations")
    .select("id, household_id, inviter_person_id, invitee_person_id, membership_type, created_at")
    .eq("invitee_person_id", personId);
  if (error || !rows?.length) return [];

  const inviterIds = [...new Set((rows as Record<string, unknown>[]).map((r) => r.inviter_person_id as string))];
  const { data: peopleRows } = await supabase
    .schema("connect")
    .from("people")
    .select("id, first_name, last_name, preferred_name")
    .in("id", inviterIds);
  const inviterMap = new Map(
    (peopleRows ?? []).map((p: Record<string, unknown>) => [
      p.id,
      {
        first_name: (p.first_name as string) ?? "",
        last_name: (p.last_name as string) ?? "",
        preferred_name: (p.preferred_name as string) ?? "",
      },
    ])
  );

  return rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    household_id: row.household_id as string,
    inviter_person_id: row.inviter_person_id as string,
    invitee_person_id: row.invitee_person_id as string,
    membership_type: row.membership_type as HouseholdMembershipType,
    created_at: row.created_at as string,
    inviter: inviterMap.get(row.inviter_person_id as string),
  }));
}

/** Count of pending invitations for a person (for header badge). */
export async function getPendingInviteCount(personId: string): Promise<number> {
  const { count, error } = await supabase
    .schema("connect")
    .from("household_invitations")
    .select("id", { count: "exact", head: true })
    .eq("invitee_person_id", personId);
  if (error) return 0;
  return count ?? 0;
}

/** Invite a user (by email) to the household. Only Heads should call. Creates invitation. */
export async function inviteToHousehold(
  householdId: string,
  inviterPersonId: string,
  email: string,
  membershipType: HouseholdMembershipType
): Promise<{ success: true } | { error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { error: "Email is required." };

  const person = await findPersonByEmail(trimmed);
  if (!person) return { error: "No account found with that email." };
  const hasAccount = await personHasAccount(person.id);
  if (!hasAccount) return { error: "No account found with that email." };

  const { error } = await supabase.schema("connect").from("household_invitations").insert({
    household_id: householdId,
    inviter_person_id: inviterPersonId,
    invitee_person_id: person.id,
    membership_type: membershipType,
  });
  if (error) {
    if (error.code === "23505") return { error: "This person has already been invited to this household." };
    return { error: error.message };
  }
  return { success: true };
}

/** Accept one invitation; decline (delete) all others for this user. */
export async function acceptInvitation(
  invitationId: string,
  inviteePersonId: string
): Promise<{ success: true } | { error: string }> {
  const { data: inv, error: fetchError } = await supabase
    .schema("connect")
    .from("household_invitations")
    .select("household_id, membership_type")
    .eq("id", invitationId)
    .eq("invitee_person_id", inviteePersonId)
    .single();
  if (fetchError || !inv) return { error: "Invitation not found." };

  const oldHouseholdId = await getPersonHouseholdId(inviteePersonId);

  const { error: updateError } = await supabase
    .schema("connect")
    .from("people")
    .update({
      household: inv.household_id,
      household_membership_type: inv.membership_type,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inviteePersonId);
  if (updateError) return { error: updateError.message };

  await supabase.schema("connect").from("household_invitations").delete().eq("invitee_person_id", inviteePersonId);

  if (oldHouseholdId) {
    const { count } = await supabase
      .schema("connect")
      .from("people")
      .select("id", { count: "exact", head: true })
      .eq("household", oldHouseholdId);
    if (count === 0) {
      await supabase.schema("connect").from("households").delete().eq("id", oldHouseholdId);
    }
  }
  return { success: true };
}

/** Decline one invitation (delete it). */
export async function declineInvitation(
  invitationId: string,
  inviteePersonId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .schema("connect")
    .from("household_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("invitee_person_id", inviteePersonId);
  return { error: error?.message };
}

async function getPersonHouseholdId(personId: string): Promise<string | null> {
  const { data } = await supabase
    .schema("connect")
    .from("people")
    .select("household")
    .eq("id", personId)
    .single();
  return (data?.household as string) ?? null;
}

/** Add a non-user to the household (create people row, set household + membership_type). */
export async function addPersonWithoutAccount(
  householdId: string,
  membershipType: "Child" | "Other",
  person: {
    first_name: string;
    last_name: string;
    email?: string | null;
    preferred_name?: string;
    date_of_birth?: string;
    phone_number?: string;
    gender?: string;
    marital_status?: string;
  }
): Promise<{ person_id: string } | { error: string }> {
  const { data: newPerson, error: personError } = await supabase
    .schema("connect")
    .from("people")
    .insert({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email ?? null,
      preferred_name: person.preferred_name ?? person.first_name,
      phone_number: person.phone_number ?? "",
      date_of_birth: person.date_of_birth ?? "1900-01-01",
      gender: person.gender ?? "male",
      marital_status: person.marital_status ?? "single",
      household: householdId,
      household_membership_type: membershipType,
    })
    .select("id")
    .single();
  if (personError || !newPerson) return { error: personError?.message ?? "Failed to create person." };
  return { person_id: newPerson.id };
}

/** Update a household member's membership type. Caller must be a Head. */
export async function updateHouseholdMemberMembershipType(
  personId: string,
  membershipType: HouseholdMembershipType
): Promise<{ error?: string }> {
  const { error } = await supabase
    .schema("connect")
    .from("people")
    .update({
      household_membership_type: membershipType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", personId);
  return { error: error?.message };
}

/** Remove a person from the household. If user (has account), create new household and set as Head. If non-user, set household null. If last member, delete household. */
export async function removeMemberFromHousehold(
  householdId: string,
  personId: string,
  isUser: boolean
): Promise<{ error?: string }> {
  if (isUser) {
    const { data: newHousehold, error: createErr } = await supabase
      .schema("connect")
      .from("households")
      .insert({})
      .select("id")
      .single();
    if (createErr || !newHousehold) return { error: createErr?.message ?? "Failed to create household." };
    const { error: updateErr } = await supabase
      .schema("connect")
      .from("people")
      .update({
        household: newHousehold.id,
        household_membership_type: "Head of Household",
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId);
    if (updateErr) return { error: updateErr.message };
  } else {
    const { error: updateErr } = await supabase
      .schema("connect")
      .from("people")
      .update({
        household: null,
        household_membership_type: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", personId);
    if (updateErr) return { error: updateErr.message };
  }

  const { count } = await supabase
    .schema("connect")
    .from("people")
    .select("id", { count: "exact", head: true })
    .eq("household", householdId);
  if (count === 0) {
    await supabase.schema("connect").from("households").delete().eq("id", householdId);
  }
  return {};
}

/** Find person by email. Returns null if not found. */
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

/** Check if a person has an account (exists in profiles). Uses RPC to avoid RLS blocking read of other users' profiles. */
export async function personHasAccount(personId: string): Promise<boolean> {
  const { data, error } = await supabase.schema("connect").rpc("person_has_account", {
    check_person_id: personId,
  });
  if (error) return false;
  return data === true;
}

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
