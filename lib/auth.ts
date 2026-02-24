import supabase from "@/lib/supabase";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

const AVATARS_BUCKET = "avatars";

/** Get the current user's profile (requires authenticated user). */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .schema("connect")
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

/** Get public URL for an avatar path (e.g. "userId/avatar.jpg"). Optional cacheBust appends ?t= so new uploads show immediately. */
export function getAvatarUrl(avatarPath: string | null, cacheBust?: string): string | null {
  if (!avatarPath) return null;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
  const url = data.publicUrl;
  if (cacheBust) return `${url}${url.includes("?") ? "&" : "?"}t=${encodeURIComponent(cacheBust)}`;
  return url;
}

/** Upload avatar for the current user. Deletes only the previous avatar file (if any), then uploads the new one. Returns path on success or an error message. */
export async function uploadAvatar(
  userId: string,
  file: File,
  existingAvatarPath?: string | null
): Promise<{ path: string } | { error: string }> {
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
    .from("profiles")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (updateError) return { error: updateError.message };
  return { path };
}

export { AVATARS_BUCKET };
