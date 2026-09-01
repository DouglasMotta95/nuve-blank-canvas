CREATE OR REPLACE FUNCTION public.grant_owner_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.email, '')) = 'nuveadvanced@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grant_owner_admin_role_trg ON public.profiles;
CREATE TRIGGER grant_owner_admin_role_trg
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin_role();