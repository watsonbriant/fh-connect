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
