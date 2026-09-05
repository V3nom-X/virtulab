import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const uid = user.id;

    // Remove owner-scoped rows first, then rows where the user is host.
    const ownerTables = [
      "chat_messages",
      "room_participants",
      "experiment_likes",
      "experiment_comments",
      "experiment_requests",
      "quiz_results",
      "user_progress",
      "user_badges",
      "custom_experiments",
      "favorite_channels",
      "user_preferences",
      "user_roles",
      "profiles",
    ];

    for (const table of ownerTables) {
      const { error } = await admin.from(table).delete().eq("user_id", uid);
      if (error) console.error(`delete-account: failed clearing ${table}: ${error.message}`);
    }

    const { error: roomError } = await admin
      .from("collaboration_rooms")
      .delete()
      .eq("host_id", uid);
    if (roomError) console.error(`delete-account: failed clearing rooms: ${roomError.message}`);

    // Finally remove the authentication account itself.
    const { error: deleteError } = await admin.auth.admin.deleteUser(uid);
    if (deleteError) {
      console.error(`delete-account: auth deletion failed: ${deleteError.message}`);
      return json({ error: "Could not delete the account. Please try again." }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("delete-account: unexpected error", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
