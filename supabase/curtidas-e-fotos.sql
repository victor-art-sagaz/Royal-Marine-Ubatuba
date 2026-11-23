-- =====================================================================
-- ROYAL MARINE · CURTIDAS E FOTO DE PERFIL
-- Rode este arquivo UMA VEZ no SQL Editor do Supabase. Pode rodar de novo.
-- =====================================================================

-- ---------- Curtidas ----------
create table if not exists public.curtidas (
  post_id uuid not null references public.posts on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.curtidas enable row level security;
grant select on public.curtidas to anon, authenticated;
grant insert, delete on public.curtidas to authenticated;

drop policy if exists "ver curtidas" on public.curtidas;
create policy "ver curtidas" on public.curtidas
  for select to anon, authenticated
  using (true);

drop policy if exists "curtir" on public.curtidas;
create policy "curtir" on public.curtidas
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "descurtir" on public.curtidas;
create policy "descurtir" on public.curtidas
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------- Foto de perfil (visível no feed) ----------
create table if not exists public.avatares (
  user_id uuid primary key references auth.users on delete cascade,
  url text not null check (
    char_length(url) <= 500
    and (url like 'https://lh3.googleusercontent.com/%' or url like '%/storage/v1/object/public/avatares/%')
  ),
  personalizada boolean not null default false,
  atualizado_em timestamptz not null default now()
);
alter table public.avatares enable row level security;
grant select on public.avatares to anon, authenticated;
grant insert, update on public.avatares to authenticated;

drop policy if exists "ver fotos de perfil" on public.avatares;
create policy "ver fotos de perfil" on public.avatares
  for select to anon, authenticated
  using (true);

drop policy if exists "criar a propria foto de perfil" on public.avatares;
create policy "criar a propria foto de perfil" on public.avatares
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "trocar a propria foto de perfil" on public.avatares;
create policy "trocar a propria foto de perfil" on public.avatares
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- Pasta pública "avatares" (fotos escolhidas na galeria) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 1048576, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg', 'image/webp'];

drop policy if exists "enviar foto de perfil na propria pasta" on storage.objects;
create policy "enviar foto de perfil na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "apagar foto de perfil propria" on storage.objects;
create policy "apagar foto de perfil propria" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
