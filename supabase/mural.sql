-- =====================================================================
-- ROYAL MARINE · MURAL DE FOTOS DO APP
-- Cole TODO este arquivo no Supabase: SQL Editor › New query › Run.
-- Pode rodar de novo sem problema (ele não duplica nada).
--
-- O que ele cria:
--   • tabela de publicações (posts) e de denúncias (reports)
--   • pasta pública de fotos "fotos" (máx. 2 MB, só JPEG/WebP)
--   • regras de segurança: cada pessoa só publica e apaga o que é dela
--   • limite de 10 fotos por pessoa por dia
--   • com 3 denúncias a foto some até a equipe revisar
--   • LIMPEZA AUTOMÁTICA todo dia às 23:59 (horário de Brasília):
--     apaga todas as publicações, denúncias e fotos do dia
--   • contas sem uso há 30 dias são apagadas
-- =====================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- Equipe da Royal Marine (pode apagar qualquer foto) ----------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- (sem regras: ninguém lê esta tabela pelo app)

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'));
$$;

-- ---------- Publicações ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 30),
  caption text check (char_length(caption) <= 280),
  image_path text not null,
  place text check (char_length(place) <= 60),
  hidden boolean not null default false,
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
alter table public.posts enable row level security;

-- Início do dia de hoje no horário de Brasília
create or replace function public.inicio_do_dia()
returns timestamptz
language sql stable
as $$
  select (date_trunc('day', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo';
$$;

-- Quantas fotos a pessoa já publicou hoje
create or replace function public.fotos_hoje()
returns int
language sql stable security definer set search_path = public
as $$
  select count(*)::int from public.posts where user_id = auth.uid() and created_at >= public.inicio_do_dia();
$$;

drop policy if exists "ver publicacoes de hoje" on public.posts;
create policy "ver publicacoes de hoje" on public.posts
  for select to anon, authenticated
  using (
    created_at >= public.inicio_do_dia()
    and (hidden = false or user_id = auth.uid() or public.is_admin())
  );

drop policy if exists "publicar a propria foto" on public.posts;
create policy "publicar a propria foto" on public.posts
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and hidden = false
    and report_count = 0
    and image_path like auth.uid()::text || '/%'
    and public.fotos_hoje() < 10
  );

drop policy if exists "apagar a propria foto" on public.posts;
create policy "apagar a propria foto" on public.posts
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "equipe revisa" on public.posts;
create policy "equipe revisa" on public.posts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- Denúncias ----------
create table if not exists public.reports (
  post_id uuid not null references public.posts on delete cascade,
  reporter uuid not null default auth.uid() references auth.users on delete cascade,
  reason text check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  primary key (post_id, reporter)
);
alter table public.reports enable row level security;

drop policy if exists "denunciar" on public.reports;
create policy "denunciar" on public.reports
  for insert to authenticated
  with check (reporter = auth.uid());

drop policy if exists "equipe ve denuncias" on public.reports;
create policy "equipe ve denuncias" on public.reports
  for select to authenticated
  using (public.is_admin());

-- Com 3 denúncias a foto fica escondida
create or replace function public.contar_denuncia()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.posts
     set report_count = report_count + 1,
         hidden = (report_count + 1) >= 3
   where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists ao_denunciar on public.reports;
create trigger ao_denunciar after insert on public.reports
  for each row execute function public.contar_denuncia();

-- ---------- Apagar a própria conta (LGPD) ----------
create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.reports where reporter = auth.uid();
  delete from public.posts where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from anon;

-- ---------- Pasta de fotos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/webp'];

drop policy if exists "enviar foto na propria pasta" on storage.objects;
create policy "enviar foto na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listar a propria pasta" on storage.objects;
create policy "listar a propria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "apagar foto propria ou equipe" on storage.objects;
create policy "apagar foto propria ou equipe" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- LIMPEZA DIÁRIA ÀS 23:59 ----------
-- As fotos são apagadas pela própria "porta" de arquivos do Supabase.
-- Para isso, a função usa o endereço do projeto e a chave secreta guardados no cofre (Vault).
-- (o passo a passo mostra como guardar as duas — elas nunca ficam no app nem no site)
create or replace function public.limpeza_diaria()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  endereco text;
  chave text;
begin
  delete from public.reports;
  delete from public.posts;

  select decrypted_secret into endereco from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into chave from vault.decrypted_secrets where name = 'service_role_key';
  if endereco is not null and chave is not null then
    perform net.http_post(
      url := rtrim(endereco, '/') || '/storage/v1/bucket/fotos/empty',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || chave,
        'apikey', chave,
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  end if;

  -- Contas sem entrar há 30 dias são apagadas (guardamos o mínimo possível)
  delete from auth.users where coalesce(last_sign_in_at, created_at) < now() - interval '30 days';
end;
$$;
revoke all on function public.limpeza_diaria() from anon, authenticated;

-- 23:59 em Brasília = 02:59 no horário universal (UTC)
select cron.unschedule(jobid) from cron.job where jobname = 'limpeza-diaria-mural';
select cron.schedule('limpeza-diaria-mural', '59 2 * * *', $$select public.limpeza_diaria()$$);
