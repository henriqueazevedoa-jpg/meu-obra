
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  _nome text,
  _cnpj text DEFAULT '',
  _email text DEFAULT '',
  _telefone text DEFAULT '',
  _plan_slug text DEFAULT 'start'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _plan_id uuid;
  _company_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Check if user already has a company
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = _user_id AND company_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Usuário já possui empresa vinculada';
  END IF;

  -- Find plan
  SELECT id INTO _plan_id FROM plans WHERE slug = _plan_slug AND ativo = true;
  IF _plan_id IS NULL THEN
    RAISE EXCEPTION 'Plano não encontrado: %', _plan_slug;
  END IF;

  -- Create company
  INSERT INTO companies (nome, cnpj, email, telefone, plan_id, status)
  VALUES (_nome, _cnpj, _email, _telefone, _plan_id, 'ativo')
  RETURNING id INTO _company_id;

  -- Create subscription
  INSERT INTO subscriptions (company_id, plan_id, status, ciclo, trial_start, trial_end)
  VALUES (_company_id, _plan_id, 'trial', 'mensal', CURRENT_DATE, CURRENT_DATE + 14);

  -- Link profile
  UPDATE profiles SET company_id = _company_id WHERE user_id = _user_id;

  -- Link user_roles
  UPDATE user_roles SET company_id = _company_id WHERE user_id = _user_id;

  RETURN _company_id;
END;
$$;
