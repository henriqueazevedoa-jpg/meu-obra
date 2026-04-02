import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const users = [
    { email: "gestor@teste.com", password: "123456", nome: "Henrique Gestor", role: "gestor" as const },
    { email: "funcionario@teste.com", password: "123456", nome: "José Silva", role: "funcionario" as const },
    { email: "cliente@teste.com", password: "123456", nome: "Roberto Mendes", role: "cliente" as const },
  ];

  const results = [];

  for (const u of users) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(eu => eu.email === u.email);

    if (existing) {
      await supabase.from("user_roles").upsert({ user_id: existing.id, role: u.role }, { onConflict: "user_id" });
      await supabase.from("profiles").upsert({ user_id: existing.id, nome: u.nome, email: u.email }, { onConflict: "user_id" });
      const { data: obras } = await supabase.from("obras").select("id");
      if (obras) {
        for (const obra of obras) {
          await supabase.from("obra_memberships").upsert(
            { user_id: existing.id, obra_id: obra.id, role: u.role },
            { onConflict: "user_id,obra_id" }
          );
        }
      }
      results.push({ email: u.email, role: u.role, userId: existing.id, action: "updated" });
      continue;
    }

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
    await supabase.from("user_roles").upsert({ user_id: userId, role: u.role }, { onConflict: "user_id" });

    const { data: obras } = await supabase.from("obras").select("id");
    if (obras) {
      for (const obra of obras) {
        await supabase.from("obra_memberships").insert({ user_id: userId, obra_id: obra.id, role: u.role });
      }
    }

    results.push({ email: u.email, role: u.role, userId, action: "created" });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
