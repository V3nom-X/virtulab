import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve an avatar reference to a viewable URL.
 *
 * - Full http(s) URLs (e.g. Google OAuth photos) are returned as-is.
 * - Storage paths inside the `avatars` bucket are returned as short-lived
 *   signed URLs so private objects remain inaccessible by direct path.
 */
export async function getAvatarUrl(
  pathOrUrl: string | null | undefined,
  expiresInSec = 3600,
): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  // Accept either "<userId>/<file>" or a full /object/public/avatars/... URL fragment.
  const path = pathOrUrl.replace(/^\/?(storage\/v1\/object\/(public|sign)\/avatars\/)?/, "");
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, expiresInSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
