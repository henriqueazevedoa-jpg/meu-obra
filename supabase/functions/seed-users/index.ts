import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: any[] = [];

  // 1. Ensure plans exist
  const { data: plans } = await supabase.from("plans").select("*");
  const proPlan = plans?.find((p: any) => p.slug === "pro");
  if (!proPlan) {
    return new Response(JSON.stringify({ error: "Plans not seeded" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  // 2. Create or get demo company
  let { data: company } = await supabase.from("companies").select("*").eq("nome", "Construtora Demo").single();
  if (!company) {
    const { data: newCompany } = await supabase.from("companies").insert({
      nome: "Construtora Demo",
      cnpj: "12.345.678/0001-90",
      email: "contato@construtorademo.com.br",
      telefone: "(11) 99999-0000",
      plan_id: proPlan.id,
      status: "ativo",
    }).select().single();
    company = newCompany;
  }

  if (!company) {
    return new Response(JSON.stringify({ error: "Failed to create company" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const companyId = (company as any).id;

  // 3. Create subscription if not exists
  const { data: existingSub } = await supabase.from("subscriptions").select("id").eq("company_id", companyId).limit(1).single();
  if (!existingSub) {
    await supabase.from("subscriptions").insert({
      company_id: companyId,
      plan_id: proPlan.id,
      status: "active",
      ciclo: "mensal",
      data_inicio: new Date().toISOString().split("T")[0],
    });
  }

  // 4. Create users (including admin)
  const users = [
    { email: "admin@teste.com", password: "123456", nome: "Admin Plataforma", role: "admin" as const },
    { email: "gestor@teste.com", password: "123456", nome: "Henrique Gestor", role: "gestor" as const },
    { email: "funcionario@teste.com", password: "123456", nome: "José Silva", role: "funcionario" as const },
    { email: "cliente@teste.com", password: "123456", nome: "Roberto Mendes", role: "cliente" as const },
  ];

  for (const u of users) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((eu: any) => eu.email === u.email);

    const isAdmin = u.role === "admin";

    if (existing) {
      await supabase.from("user_roles").upsert(
        { user_id: existing.id, role: u.role, company_id: isAdmin ? null : companyId },
        { onConflict: "user_id" }
      );
      await supabase.from("profiles").upsert(
        { user_id: existing.id, nome: u.nome, email: u.email, company_id: isAdmin ? null : companyId },
        { onConflict: "user_id" }
      );

      if (!isAdmin) {
        const { data: obras } = await supabase.from("obras").select("id");
        if (obras) {
          for (const obra of obras) {
            await supabase.from("obra_memberships").upsert(
              { user_id: existing.id, obra_id: obra.id, role: u.role },
              { onConflict: "user_id,obra_id" }
            );
          }
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

    const newUserId = authData.user.id;
    await supabase.from("user_roles").upsert(
      { user_id: newUserId, role: u.role, company_id: isAdmin ? null : companyId },
      { onConflict: "user_id" }
    );
    await supabase.from("profiles").update({ company_id: isAdmin ? null : companyId }).eq("user_id", newUserId);

    if (!isAdmin) {
      const { data: obras } = await supabase.from("obras").select("id");
      if (obras) {
        for (const obra of obras) {
          await supabase.from("obra_memberships").insert({ user_id: newUserId, obra_id: obra.id, role: u.role });
        }
      }
    }

    results.push({ email: u.email, role: u.role, userId: newUserId, action: "created" });
  }

  // 5. Update all existing obras to belong to this company
  await supabase.from("obras").update({ company_id: companyId }).is("company_id", null);

  return new Response(JSON.stringify({ results, companyId }), {
    headers: { "Content-Type": "application/json" },
  });
});
