import supabase from "@/lib/supabase";

export type Profile = {
  id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

/** Full person record from connect.people (for profile information section). */
export type Person = {
  id: string;
  prefix: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  suffix: string | null;
  preferred_name: string | null;
  email: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  marital_status: string | null;
  enneagram: string | null;
  myersbriggs: string | null;
  avatar_path: string | null;
};

/** Calculate age from date_of_birth (yyyy-mm-dd). Returns null if invalid or missing. */
export function getAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth || typeof dateOfBirth !== "string" || !dateOfBirth.trim()) return null;
  const d = new Date(dateOfBirth.trim());
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age < 0 ? null : age;
}

/** Get full person record from connect.people by id. */
export async function getPerson(personId: string): Promise<Person | null> {
  const { data, error } = await supabase
    .schema("connect")
    .from("people")
    .select(
      "id, prefix, first_name, middle_name, last_name, suffix, preferred_name, email, phone_number, date_of_birth, gender, marital_status, enneagram, myersbriggs, avatar_path"
    )
    .eq("id", personId)
    .single();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    prefix: (row.prefix as string) ?? null,
    first_name: (row.first_name as string) ?? null,
    middle_name: (row.middle_name as string) ?? null,
    last_name: (row.last_name as string) ?? null,
    suffix: (row.suffix as string) ?? null,
    preferred_name: (row.preferred_name as string) ?? null,
    email: (row.email as string) ?? null,
    phone_number: (row.phone_number as string) ?? null,
    date_of_birth: (row.date_of_birth as string) ?? null,
    gender: (row.gender as string) ?? null,
    marital_status: (row.marital_status as string) ?? null,
    enneagram: (row.enneagram as string) ?? null,
    myersbriggs: (row.myersbriggs as string) ?? null,
    avatar_path: (row.avatar_path as string) ?? null,
  };
}

/** Editable person fields (all except id). first_name/last_name are also synced to profiles when profileId is provided. */
export type PersonUpdates = {
  prefix?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  suffix?: string | null;
  preferred_name?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  enneagram?: string | null;
  myersbriggs?: string | null;
};

/** Update person in connect.people. If profileId is set and first_name or last_name changed, also updates connect.profiles. */
export async function updatePerson(
  personId: string,
  updates: PersonUpdates,
  profileId?: string
): Promise<{ error?: string }> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...updates,
    updated_at: now,
  };
  const { error: peopleError } = await supabase
    .schema("connect")
    .from("people")
    .update(payload)
    .eq("id", personId);
  if (peopleError) return { error: peopleError.message };

  if (profileId && (updates.first_name !== undefined || updates.last_name !== undefined)) {
    const profilePayload: Record<string, unknown> = { updated_at: now };
    if (updates.first_name !== undefined) profilePayload.first_name = updates.first_name ?? "";
    if (updates.last_name !== undefined) profilePayload.last_name = updates.last_name ?? "";
    const { error: profileError } = await supabase
      .schema("connect")
      .from("profiles")
      .update(profilePayload)
      .eq("id", profileId);
    if (profileError) return { error: profileError.message };
  }
  return {};
}

const AVATARS_BUCKET = "avatars";

/** Get the current user's profile (requires authenticated user). Avatar is read from the linked person. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .schema("connect")
    .from("profiles")
    .select("id, person_id, first_name, last_name, email, created_at, updated_at, people(avatar_path)")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const people = row.people as { avatar_path?: string | null } | { avatar_path?: string | null }[] | null;
  const avatarPath = Array.isArray(people) ? people[0]?.avatar_path : people?.avatar_path;
  return {
    id: row.id as string,
    person_id: row.person_id as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    email: row.email as string,
    avatar_path: avatarPath ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/** Get public URL for an avatar path (e.g. "userId/avatar.jpg"). Optional cacheBust appends ?t= so new uploads show immediately. */
export function getAvatarUrl(avatarPath: string | null, cacheBust?: string): string | null {
  if (!avatarPath) return null;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
  const url = data.publicUrl;
  if (cacheBust) return `${url}${url.includes("?") ? "&" : "?"}t=${encodeURIComponent(cacheBust)}`;
  return url;
}

/** Upload avatar for the current user (stored on the person record). Deletes previous file if any, then uploads. Returns path on success or an error message. */
export async function uploadAvatar(
  userId: string,
  file: File,
  existingAvatarPath?: string | null
): Promise<{ path: string } | { error: string }> {
  const { data: profile } = await supabase
    .schema("connect")
    .from("profiles")
    .select("person_id")
    .eq("id", userId)
    .single();
  if (!profile?.person_id) return { error: "Profile not found." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  if (existingAvatarPath?.trim()) {
    await supabase.storage.from(AVATARS_BUCKET).remove([existingAvatarPath]);
  }

  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (uploadError) return { error: uploadError.message };
  const { error: updateError } = await supabase
    .schema("connect")
    .from("people")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", profile.person_id);
  if (updateError) return { error: updateError.message };
  return { path };
}

export { AVATARS_BUCKET };
