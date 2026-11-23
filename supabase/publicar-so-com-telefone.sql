-- Rode no SQL Editor do Supabase (uma vez). Para publicar, basta o telefone no perfil.
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
    )
  );
