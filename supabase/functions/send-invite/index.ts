import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to check role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check manager or super_admin role
    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = (roleData || []).map((r: any) => r.role);
    const isManager = roles.includes("manager");
    const isSuperAdmin = roles.includes("super_admin");

    if (!isManager && !isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get manager's dealership_id from profile
    const { data: profileData } = await userClient
      .from("profiles")
      .select("dealership_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const managerDealershipId = profileData?.dealership_id;

    const { email, resend, dealership_id } = await req.json();
    const inviteDealershipId = isSuperAdmin && dealership_id ? dealership_id : managerDealershipId;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already invited
    const { data: existing } = await adminClient
      .from("invitations")
      .select("id, status")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existing && !resend) {
      return new Response(
        JSON.stringify({ error: "This email has already been invited" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existing && existing.status === "accepted") {
      return new Response(
        JSON.stringify({ error: "This user has already joined" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert or update invitation record
    if (!existing) {
      const { error: insertError } = await adminClient
        .from("invitations")
        .insert({ email: trimmedEmail, invited_by: user.id, dealership_id: inviteDealershipId });
      if (insertError) throw insertError;
    }

    // Send invite via Supabase Auth admin API
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      trimmedEmail,
      { redirectTo: "https://cnatraining.lovable.app" }
    );

    if (inviteError) {
      // Clean up invitation record if email fails
      await adminClient.from("invitations").delete().eq("email", trimmedEmail);
      throw inviteError;
    }

    // Mark as sent
    await adminClient
      .from("invitations")
      .update({ status: "sent" })
      .eq("email", trimmedEmail);

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${trimmedEmail}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to send invitation" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
