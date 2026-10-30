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

    const body = await req.json();
    const { email, resend, role } = body;
    const dealershipId = body.dealershipId || body.dealership_id;
    const clean = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, 60) : "");
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const allowedRoles = ["salesperson", "manager"] as const;
    const inviteRole = allowedRoles.includes(role) ? role : "salesperson";

    // Resolve target dealership with authorization
    let inviteDealershipId: string | null = null;
    if (isSuperAdmin) {
      // Super admin can invite to any dealership; must provide one
      inviteDealershipId = dealershipId || managerDealershipId || null;
    } else {
      // Manager: always pinned to their own dealership, ignore any client-provided value
      inviteDealershipId = managerDealershipId || null;
      if (dealershipId && dealershipId !== managerDealershipId) {
        return new Response(
          JSON.stringify({ error: "Managers can only invite to their own dealership" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    if (!inviteDealershipId) {
      return new Response(JSON.stringify({ error: "Dealership is required" }), {
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

    if (existing && existing.status === "accepted") {
      return new Response(
        JSON.stringify({ error: "This user has already joined" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!existing && (!firstName || !lastName)) {
      return new Response(JSON.stringify({ error: "First and last name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const nameFields = firstName && lastName ? { first_name: firstName, last_name: lastName } : {};

    // New accounts need an invitation for the signup trigger. Defer changes to
    // existing invitations until the existing-account dealership check passes.
    if (!existing) {
      const { error: insertError } = await adminClient
        .from("invitations")
        .insert({ email: trimmedEmail, invited_by: user.id, dealership_id: inviteDealershipId, role: inviteRole, ...nameFields });
      if (insertError) throw insertError;
    }

    // Send invite via Supabase Auth admin API
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      trimmedEmail,
      { redirectTo: "https://automotivesalespro.com/auth", data: firstName && lastName ? { full_name: `${firstName} ${lastName}` } : undefined }
    );

    if (inviteError) {
      // Clean up invitation record if email fails
      if (!existing) {
        await adminClient.from("invitations").delete().eq("email", trimmedEmail);
      }
      const msg = (inviteError as any)?.message || "";
      if (msg.toLowerCase().includes("already been registered") || msg.toLowerCase().includes("already exists")) {
        // Auth's default first page is not a reliable email lookup.
        let found: { id: string } | undefined;
        const perPage = 1000;
        for (let page = 1; ; page += 1) {
          const { data: list, error: listError } = await adminClient.auth.admin.listUsers({ page, perPage });
          if (listError) throw listError;
          found = list.users.find((u) => (u.email || "").toLowerCase() === trimmedEmail);
          if (found || list.users.length < perPage) break;
        }
        if (found) {
          const { data: existingProfile, error: profileError } = await adminClient
            .from("profiles")
            .select("dealership_id")
            .eq("user_id", found.id)
            .maybeSingle();
          if (profileError) throw profileError;
          if (existingProfile?.dealership_id && existingProfile.dealership_id !== inviteDealershipId && !isSuperAdmin) {
            return new Response(
              JSON.stringify({ error: "This user belongs to another dealership. Contact a WerkandMe admin." }),
              { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const { data: existingRoles, error: rolesError } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", found.id);
          if (rolesError) throw rolesError;
          const { error: updateError } = await adminClient.from("profiles").update({ dealership_id: inviteDealershipId, ...(firstName && lastName ? { full_name: `${firstName} ${lastName}` } : {}) }).eq("user_id", found.id);
          if (updateError) throw updateError;
          // Never replace or downgrade an existing Super Admin's roles.
          if (!existingRoles?.some((r) => r.role === "super_admin")) {
            const { error: roleError } = await adminClient.from("user_roles").upsert(
              { user_id: found.id, role: inviteRole },
              { onConflict: "user_id,role", ignoreDuplicates: true }
            );
            if (roleError) throw roleError;
          }
          const acceptedFields = { status: "accepted", used_at: new Date().toISOString(), dealership_id: inviteDealershipId, role: inviteRole, ...nameFields };
          const { error: acceptedError } = existing
            ? await adminClient.from("invitations").update(acceptedFields).eq("id", existing.id)
            : await adminClient.from("invitations").insert({ email: trimmedEmail, invited_by: user.id, ...acceptedFields });
          if (acceptedError) throw acceptedError;
          return new Response(
            JSON.stringify({ success: true, message: `${trimmedEmail} already had an account — assigned to dealership.` }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "This user already has an account." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw inviteError;
    }

    // Mark as sent
    await adminClient
      .from("invitations")
      .update({ status: "sent", role: inviteRole, dealership_id: inviteDealershipId, ...nameFields })
      .eq("email", trimmedEmail);

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${trimmedEmail}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send invite error:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: "Failed to send invitation" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
