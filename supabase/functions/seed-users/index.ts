import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const users = [
    { email: "funcionario@teste.com", password: "123456", nome: "José Silva", role: "funcionario" as const },
    { email: "cliente@teste.com", password: "123456", nome: "Roberto Mendes", role: "cliente" as const },
  ];

  const results = [];

  for (const u of users) {
    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { nome: u.nome },
    });

    if (authError) {
      results.push({ email: u.email, error: authError.message });
      continue;
    }

    const userId = authData.user.id;

    // Update role (trigger creates as 'gestor' by default)
    await supabase.from("user_roles").update({ role: u.role }).eq("user_id", userId);

    // Get all obras
    const { data: obras } = await supabase.from("obras").select("id");
    
    // Add memberships to all obras
    if (obras) {
      for (const obra of obras) {
        await supabase.from("obra_memberships").insert({
          user_id: userId,
          obra_id: obra.id,
          role: u.role,
        });
      }
    }

    results.push({ email: u.email, role: u.role, userId, success: true });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
