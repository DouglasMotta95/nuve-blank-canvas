create table public.vip_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  interest text,
  created_at timestamptz not null default now(),
  unique(email)
);

GRANT SELECT, DELETE ON public.vip_waitlist TO authenticated;
GRANT ALL ON public.vip_waitlist TO service_role;

alter table public.vip_waitlist enable row level security;

create policy "admins read vip list"
  on public.vip_waitlist for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admins delete vip list"
  on public.vip_waitlist for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));