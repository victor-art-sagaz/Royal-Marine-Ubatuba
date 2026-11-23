-- =====================================================================
-- ROYAL MARINE · PERFIL DO USUÁRIO + ALERTA DE DENÚNCIAS
-- Rode este arquivo UMA VEZ no Supabase (SQL Editor › New query › Run),
-- depois de já ter rodado o mural.sql. Pode rodar de novo sem problema.
--
-- O que ele faz:
--   • cria o perfil (telefone e embarcação), visível só para a própria pessoa e a equipe
--   • o nome da publicação passa a ser sempre o nome da conta Google
--   • exige telefone e embarcação antes de publicar
--   • com 3 denúncias, envia um e-mail para a equipe (tabela "admins")
-- =====================================================================

-- ---------- Perfil ----------
create table if not exists public.perfis (
  user_id uuid primary key references auth.users on delete cascade,
  telefone text check (char_length(telefone) between 8 and 20),
  tipo_embarcacao text check (char_length(tipo_embarcacao) between 2 and 40),
  nome_embarcacao text check (char_length(nome_embarcacao) between 2 and 60),
  atualizado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;

drop policy if exists "ver o proprio perfil" on public.perfis;
create policy "ver o proprio perfil" on public.perfis
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "criar o proprio perfil" on public.perfis;
create policy "criar o proprio perfil" on public.perfis
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "editar o proprio perfil" on public.perfis;
create policy "editar o proprio perfil" on public.perfis
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- Nome da conta Google (a pessoa não consegue mudar) ----------
create or replace function public.nome_google(uid uuid)
returns text
language sql stable security definer set search_path = public, auth
as $$
  select left(coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(u.email, '@', 1), ''),
    'Pessoa'), 30)
  from auth.users u
  where u.id = uid;
$$;

-- Ao publicar, o nome vem sempre da conta Google, nunca do que a pessoa digitar
create or replace function public.define_nome_da_publicacao()
returns trigger
language plpgsql security definer set search_path = public, auth
as $$
begin
  new.nickname := coalesce(public.nome_google(new.user_id), 'Pessoa');
  return new;
end;
$$;

drop trigger if exists nome_da_publicacao on public.posts;
create trigger nome_da_publicacao
  before insert on public.posts
  for each row execute function public.define_nome_da_publicacao();

-- ---------- Publicar só com telefone e embarcação preenchidos ----------
drop policy if exists "publicar a propria foto" on public.posts;
create policy "publicar a propria foto" on public.posts
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and hidden = false
    and report_count = 0
    and image_path like auth.uid()::text || '/%'
    and public.fotos_hoje() < 10
    and exists (
      select 1 from public.perfis p
      where p.user_id = auth.uid()
        and p.telefone is not null
        and p.nome_embarcacao is not null
    )
  );

-- ---------- E-mail para a equipe quando uma foto chega a 3 denúncias ----------
-- A chave do Resend fica no Vault com o nome 'resend_key' (ver o passo a passo).
create or replace function public.avisar_equipe(post uuid)
returns void
language plpgsql security definer set search_path = public, auth, vault, net
as $$
declare
  chave text;
  destinos text[];
  p record;
  corpo text;
begin
  select decrypted_secret into chave from vault.decrypted_secrets where name = 'resend_key';
  if chave is null then
    return;
  end if;

  select array_agg(a.email) into destinos from public.admins a;
  if destinos is null then
    return;
  end if;

  select po.nickname, po.place, po.caption, po.created_at,
         u.email as email_conta, pf.telefone, pf.tipo_embarcacao, pf.nome_embarcacao
    into p
    from public.posts po
    left join auth.users u on u.id = po.user_id
    left join public.perfis pf on pf.user_id = po.user_id
   where po.id = post;

  corpo := format(
    E'Uma publicacao recebeu 3 denuncias e foi escondida do feed.\n\nAutor: %s\nE-mail da conta: %s\nTelefone: %s\nEmbarcacao: %s (%s)\nLocal: %s\nLegenda: %s\nPublicada em: %s\nID: %s\n\nRevise na aba Mural do app: restaure ou apague a publicacao.',
    coalesce(p.nickname, '-'),
    coalesce(p.email_conta, '-'),
    coalesce(p.telefone, '-'),
    coalesce(p.nome_embarcacao, '-'),
    coalesce(p.tipo_embarcacao, '-'),
    coalesce(p.place, '-'),
    coalesce(p.caption, '-'),
    to_char(p.created_at at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
    post
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || chave, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Royal Marine <onboarding@resend.dev>',
      'to', to_jsonb(destinos),
      'subject', 'Denuncia no Mural: publicacao escondida',
      'text', corpo
    )
  );
end;
$$;

-- Ao chegar a 3 denúncias (e só nesse momento), avisa a equipe
create or replace function public.contar_denuncia()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  novo_total int;
begin
  update public.posts
     set report_count = report_count + 1,
         hidden = (report_count + 1) >= 3
   where id = new.post_id
  returning report_count into novo_total;

  if novo_total = 3 then
    perform public.avisar_equipe(new.post_id);
  end if;
  return new;
end;
$$;
