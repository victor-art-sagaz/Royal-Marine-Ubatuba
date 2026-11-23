/**
 * Ligação simples com o Supabase (banco de dados, login com Google e fotos do Mural).
 * Usa só "fetch", sem biblioteca extra, para o app continuar leve.
 *
 * As duas chaves vêm do Vercel (Settings › Environment Variables):
 *   VITE_SUPABASE_URL       ex.: https://abcdefgh.supabase.co
 *   VITE_SUPABASE_ANON_KEY  a chave "anon" ou "publishable" (é pública, a segurança fica nas regras do banco)
 */

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}
const URL_BASE = (env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '')
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? ''

/** O Mural só funciona depois que as chaves do Supabase forem colocadas no Vercel */
export const feedEnabled = Boolean(URL_BASE && ANON_KEY)

export const BUCKET = 'fotos'
const SESSION_KEY = 'rm-sessao'

export interface SessionUser {
  id: string
  email: string
  name: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  /** quando o acesso vence (milissegundos) */
  expiresAt: number
  user: SessionUser
}

export interface Post {
  id: string
  user_id: string
  nickname: string
  caption: string | null
  image_path: string
  place: string | null
  hidden: boolean
  created_at: string
}

/* ------------------------------ Sessão ------------------------------ */

const listeners = new Set<() => void>()
export const onSessionChange = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function saveSession(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* sem armazenamento */
  }
  listeners.forEach((fn) => fn())
}

async function fetchUser(accessToken: string): Promise<SessionUser> {
  const res = await fetch(`${URL_BASE}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`auth ${res.status}`)
  const u = (await res.json()) as {
    id: string
    email?: string
    user_metadata?: { full_name?: string; name?: string; given_name?: string }
  }
  const meta = u.user_metadata ?? {}
  return { id: u.id, email: u.email ?? '', name: meta.given_name || meta.full_name || meta.name || '' }
}

/** Abre a tela de login do Google. Depois do login, o Google volta para o Mural. */
export function signInWithGoogle() {
  const back = `${window.location.origin}/app/mural`
  window.location.assign(
    `${URL_BASE}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(back)}&apikey=${encodeURIComponent(ANON_KEY)}`,
  )
}

/** Ao voltar do Google, o endereço traz o acesso depois do "#". Guarda e limpa o endereço. */
export async function completeSignInFromUrl(): Promise<boolean> {
  if (!feedEnabled || !window.location.hash.includes('access_token=')) return false
  const params = new URLSearchParams(window.location.hash.slice(1))
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) return false
  const expiresIn = Number(params.get('expires_in') ?? '3600')
  const user = await fetchUser(accessToken)
  saveSession({ accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, user })
  return true
}

/** Renova o acesso quando está perto de vencer */
async function validSession(): Promise<Session | null> {
  const s = readSession()
  if (!s) return null
  if (s.expiresAt - Date.now() > 60_000) return s
  try {
    const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refreshToken }),
    })
    if (!res.ok) throw new Error(`refresh ${res.status}`)
    const data = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number }
    const next: Session = {
      ...s,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    saveSession(next)
    return next
  } catch {
    saveSession(null)
    return null
  }
}

export async function signOut() {
  const s = readSession()
  saveSession(null)
  if (s) {
    fetch(`${URL_BASE}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${s.accessToken}` },
    }).catch(() => undefined)
  }
}

/* ------------------------------ Pedidos ------------------------------ */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function call<T>(path: string, init: RequestInit = {}, needsLogin = false): Promise<T> {
  const s = await validSession()
  if (needsLogin && !s) throw new ApiError(401, 'login')
  const headers = new Headers(init.headers)
  headers.set('apikey', ANON_KEY)
  if (s) headers.set('Authorization', `Bearer ${s.accessToken}`)
  const res = await fetch(`${URL_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text)
  }
  const type = res.headers.get('content-type') ?? ''
  return (type.includes('json') ? await res.json() : undefined) as T
}

export const PAGE_SIZE = 12

/** Publicações mais novas primeiro, de 12 em 12 */
export function listPosts(offset: number): Promise<Post[]> {
  return call<Post[]>(
    `/rest/v1/posts?select=id,user_id,nickname,caption,image_path,place,hidden,created_at&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`,
  )
}

/** A pessoa conectada é da equipe da Royal Marine (pode apagar e mostrar de novo)? */
export async function amIAdmin(): Promise<boolean> {
  try {
    return await call<boolean>('/rest/v1/rpc/is_admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  } catch {
    return false
  }
}

export const photoUrl = (path: string) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${path}`

/* ------------------------------ Perfil ------------------------------ */

export interface Perfil {
  user_id: string
  telefone: string | null
  tipo_embarcacao: string | null
  nome_embarcacao: string | null
}

/** Telefone e embarcação da pessoa conectada (só ela e a equipe conseguem ler) */
export async function getMyProfile(): Promise<Perfil | null> {
  const s = await validSession()
  if (!s) return null
  const rows = await call<Perfil[]>(
    `/rest/v1/perfis?select=user_id,telefone,tipo_embarcacao,nome_embarcacao&user_id=eq.${s.user.id}`,
    {},
    true,
  )
  return rows[0] ?? null
}

/** Salva o perfil. O nome e o e-mail vêm sempre da conta Google, por isso não são gravados aqui. */
export async function saveMyProfile(dados: { telefone: string; tipo_embarcacao: string; nome_embarcacao: string }): Promise<void> {
  const s = await validSession()
  if (!s) throw new ApiError(401, 'login')
  await call(
    '/rest/v1/perfis?on_conflict=user_id',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: s.user.id,
        telefone: dados.telefone,
        tipo_embarcacao: dados.tipo_embarcacao || null,
        nome_embarcacao: dados.nome_embarcacao || null,
        atualizado_em: new Date().toISOString(),
      }),
    },
    true,
  )
}

/** Equipe: telefone e embarcação de quem publicou. Para as outras pessoas, o banco não devolve nada. */
export async function listContatos(): Promise<Record<string, Perfil>> {
  const rows = await call<Perfil[]>(
    '/rest/v1/perfis?select=user_id,telefone,tipo_embarcacao,nome_embarcacao',
    {},
    true,
  ).catch(() => [] as Perfil[])
  return Object.fromEntries(rows.map((r) => [r.user_id, r]))
}

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** Envia a foto (já reduzida) e cria a publicação */
export async function createPost(input: { photo: Blob; caption: string; place: string }): Promise<Post> {
  const s = await validSession()
  if (!s) throw new ApiError(401, 'login')
  const path = `${s.user.id}/${randomId()}.jpg`
  await call(`/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false', 'cache-control': '31536000' },
    body: input.photo,
  }, true)
  try {
    const rows = await call<Post[]>('/rest/v1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        caption: input.caption || null,
        image_path: path,
        place: input.place || null,
      }),
    }, true)
    return rows[0]
  } catch (e) {
    // Se a publicação não foi aceita (ex.: limite do dia), apaga a foto enviada
    await removeFiles([path]).catch(() => undefined)
    throw e
  }
}

async function removeFiles(paths: string[]) {
  if (!paths.length) return
  await call(`/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: paths }),
  }, true)
}

export async function deletePost(post: Post) {
  await removeFiles([post.image_path]).catch(() => undefined)
  await call(`/rest/v1/posts?id=eq.${post.id}`, { method: 'DELETE' }, true)
}

/** Denuncia uma publicação. Com 3 denúncias ela some até a equipe revisar. */
export async function reportPost(postId: string, reason: string): Promise<'ok' | 'already'> {
  try {
    await call('/rest/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ post_id: postId, reason: reason || null }),
    }, true)
    return 'ok'
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return 'already'
    throw e
  }
}

/** Equipe: volta a mostrar uma publicação escondida por denúncias */
export async function restorePost(postId: string) {
  await call(`/rest/v1/posts?id=eq.${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ hidden: false, report_count: 0 }),
  }, true)
}

/** Apaga todas as fotos, publicações e a conta da pessoa (direito garantido pela LGPD) */
export async function deleteMyAccount() {
  const s = await validSession()
  if (!s) return
  const files = await call<{ name: string }[]>(`/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: s.user.id, limit: 1000 }),
  }, true).catch(() => [])
  await removeFiles(files.map((f) => `${s.user.id}/${f.name}`)).catch(() => undefined)
  await call('/rest/v1/rpc/delete_my_account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, true)
  saveSession(null)
}

/* ------------------------------ Foto ------------------------------ */

/**
 * Reduz a foto para no máximo 1280 px e salva como JPEG.
 * Redesenhar a imagem também apaga os dados escondidos nela (como a localização do GPS).
 */
export async function preparePhoto(file: File): Promise<Blob> {
  const MAX = 1280
  let source: ImageBitmap | HTMLImageElement
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('imagem'))
      img.src = URL.createObjectURL(file)
    })
  }
  const w = source.width
  const h = source.height
  const scale = Math.min(1, MAX / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  const toBlob = (q: number) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', q),
    )
  let blob = await toBlob(0.82)
  if (blob.size > 1_500_000) blob = await toBlob(0.65)
  return blob
}
