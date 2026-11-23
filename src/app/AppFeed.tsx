import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Clock, Flag, ImagePlus, LogOut, MapPin, RefreshCw, ShieldCheck, Trash2, Eye, UserX } from 'lucide-react'
import { BottomSheet } from './AppExtras'
import { profileText } from './AppProfile'
import { BEACHES, useApp } from './i18n'
import {
  ApiError,
  PAGE_SIZE,
  amIAdmin,
  completeSignInFromUrl,
  createPost,
  deleteMyAccount,
  deletePost,
  feedEnabled,
  getMyProfile,
  listContatos,
  listPosts,
  onSessionChange,
  photoUrl,
  preparePhoto,
  readSession,
  reportPost,
  restorePost,
  signInWithGoogle,
  signOut,
} from './supabase'
import type { Perfil, Post, Session } from './supabase'

/** Milissegundos até a próxima limpeza (23:59 no horário de Brasília) */
function msUntilWipe(now = Date.now()) {
  const brt = new Date(now - 3 * 3600000)
  const wipe = Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate(), 23, 59) + 3 * 3600000
  return wipe > now ? wipe - now : wipe + 86400000 - now
}

function useSession() {
  const [session, setSession] = useState<Session | null>(readSession)
  useEffect(() => onSessionChange(() => setSession(readSession())), [])
  return session
}

/** Contagem regressiva até a limpeza diária */
function WipeBanner() {
  const { t } = useApp()
  const [ms, setMs] = useState(msUntilWipe)
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilWipe()), 30000)
    return () => window.clearInterval(id)
  }, [])
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#e2bd45]/30 bg-[#e2bd45]/10 p-3">
      <Clock size={18} className="mt-0.5 shrink-0 text-[#e2bd45]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#e2bd45]">{t('feedWipeIn', { time: h ? `${h} h ${m} min` : `${m} min` })}</p>
        <p className="text-[11px] leading-relaxed text-white/70">{t('feedWipe')}</p>
      </div>
    </div>
  )
}

function Composer({ open, onClose, onDone, defaultName }: { open: boolean; onClose: () => void; onDone: (p: Post) => void; defaultName: string }) {
  const { t, place, lang } = useApp()
  const pt = profileText(lang)
  const fileRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [perfilOk, setPerfilOk] = useState<boolean | null>(null)
  const [caption, setCaption] = useState('')
  const [beach, setBeach] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPerfilOk(null)
    getMyProfile()
      .then((p) => setPerfilOk(Boolean(p?.telefone)))
      .catch(() => setPerfilOk(false))
    setCaption('')
    setBeach(place.name)
    setAccepted(false)
    setError(null)
    setPhoto(null)
    setPreview(null)
  }, [open, defaultName, place.name])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const blob = await preparePhoto(file)
      setPhoto(blob)
      setPreview(URL.createObjectURL(blob))
    } catch {
      setError(t('feedError'))
    }
  }

  const canSend = Boolean(photo) && perfilOk === true && accepted && !busy

  const send = async () => {
    if (!photo || !canSend) return
    setBusy(true)
    setError(null)
    try {
      const post = await createPost({ photo, caption: caption.trim(), place: beach })
      onDone(post)
      onClose()
    } catch (e) {
      // O banco recusa a 11ª foto do dia (regra de segurança)
      setError(e instanceof ApiError && (e.status === 403 || e.status === 401) && readSession() ? t('feedLimit') : t('feedError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={t('feedNew')} labelId="mural-publicar">
      <div className="mt-4 space-y-3">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/25 bg-white/5 text-white/70"
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-2 right-2 rounded-full bg-navy-dark/80 px-3 py-1 text-xs">{t('feedChange')}</span>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm">
              <ImagePlus size={28} className="text-teal" aria-hidden="true" />
              {t('feedChoose')}
            </span>
          )}
        </button>

        <div className="text-xs font-semibold text-white/80">
          {t('feedNickname')}
          <p className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-normal text-white/85">{defaultName || 'Sem nome'}</p>
          <span className="block text-[10px] font-normal text-white/40">{pt.nameNote}</span>
        </div>

        <label className="block text-xs font-semibold text-white/80">
          {t('feedCaption')} <span className="font-normal text-white/50">{t('optional')}</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={2}
            placeholder={t('feedCaptionPh')}
            className="mt-1 w-full resize-none rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white outline-none placeholder:text-white/35 focus:border-teal"
          />
          <span className="block text-right text-[10px] font-normal text-white/40">{caption.length}/280</span>
        </label>

        <label className="block text-xs font-semibold text-white/80">
          {t('feedPlace')}
          <select
            value={beach}
            onChange={(e) => setBeach(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-[#16305a] px-3 py-2.5 text-sm font-normal text-white outline-none focus:border-teal"
          >
            <option value="">{t('feedNoPlace')}</option>
            {BEACHES.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-white/[0.06] p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <ShieldCheck size={14} className="text-teal" aria-hidden="true" /> {t('feedRulesTitle')}
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-white/70">
            <li>{t('feedRule1')}</li>
            <li>{t('feedRule2')}</li>
            <li>{t('feedRule3')}</li>
            <li>{t('feedWipe')}</li>
          </ul>
          <label className="mt-2 flex items-start gap-2 text-xs text-white/85">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#e2bd45]" />
            <span>
              {t('feedAccept')} ·{' '}
              <a href="/termos-de-uso" target="_blank" rel="noreferrer" className="text-teal underline">
                {t('feedTerms')}
              </a>
            </span>
          </label>
        </div>

        {perfilOk === false ? (
          <p className="rounded-xl bg-amber-400/15 p-3 text-xs text-amber-100">
            {pt.profileWarn}
          </p>
        ) : null}
        {error ? <p className="rounded-xl bg-amber-400/15 p-3 text-xs text-amber-100">{error}</p> : null}

        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e2bd45] py-3.5 text-sm font-semibold text-navy-dark transition disabled:opacity-40"
        >
          {busy ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
          {busy ? t('feedPublishing') : t('feedPublish')}
        </button>
      </div>
    </BottomSheet>
  )
}

function PostCard({
  post,
  mine,
  admin,
  contato,
  onDeleted,
  onRestored,
  onNotice,
}: {
  post: Post
  mine: boolean
  admin: boolean
  contato?: Perfil
  onDeleted: () => void
  onRestored: () => void
  onNotice: (text: string) => void
}) {
  const { t, locale, lang } = useApp()
  const pt = profileText(lang)
  const session = readSession()
  const minutes = Math.round((Date.now() - new Date(post.created_at).getTime()) / 60000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const ago = minutes < 60 ? rtf.format(-Math.max(0, minutes), 'minute') : rtf.format(-Math.round(minutes / 60), 'hour')

  const remove = async () => {
    if (!window.confirm(t('feedDeleteConfirm'))) return
    try {
      await deletePost(post)
      onDeleted()
    } catch {
      onNotice(t('feedError'))
    }
  }
  const report = async () => {
    if (!session) {
      signInWithGoogle()
      return
    }
    if (!window.confirm(t('feedReportConfirm'))) return
    try {
      const r = await reportPost(post.id, '')
      onNotice(r === 'already' ? t('feedAlready') : t('feedReported'))
    } catch {
      onNotice(t('feedError'))
    }
  }
  const restore = async () => {
    try {
      await restorePost(post.id)
      onRestored()
    } catch {
      onNotice(t('feedError'))
    }
  }

  const digitos = (contato?.telefone ?? '').replace(/\D/g, '')
  const wa = `https://wa.me/55${digitos.replace(/^55/, '')}`

  return (
    <article className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] ${post.hidden ? 'opacity-60' : ''}`}>
      <img
        src={photoUrl(post.image_path)}
        alt={post.caption ? post.caption : t('feedPhotoBy', { name: post.nickname })}
        loading="lazy"
        decoding="async"
        className="aspect-[4/3] w-full bg-white/5 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{post.nickname}</p>
            {admin ? (
              <p className="mt-0.5 break-words text-[11px] text-[#e2bd45]">
                {digitos ? (
                  <a href={wa} target="_blank" rel="noreferrer" className="underline">
                    {contato?.telefone}
                  </a>
                ) : (
                  pt.noPhone
                )}
                {' · '}
                {contato?.nome_embarcacao ?? pt.noBoat}
                {contato?.tipo_embarcacao ? ` (${contato.tipo_embarcacao})` : ''}
              </p>
            ) : null}
            <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-white/55">
              <span>{ago}</span>
              {post.place ? (
                <span className="flex items-center gap-1">
                  <MapPin size={11} aria-hidden="true" /> {post.place}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            {admin && post.hidden ? (
              <button type="button" onClick={restore} aria-label={t('feedRestore')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-teal">
                <Eye size={16} />
              </button>
            ) : null}
            {mine || admin ? (
              <button type="button" onClick={remove} aria-label={t('feedDelete')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white">
                <Trash2 size={16} />
              </button>
            ) : (
              <button type="button" onClick={report} aria-label={t('feedReport')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white">
                <Flag size={15} />
              </button>
            )}
          </div>
        </div>
        {post.caption ? <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-white/85">{post.caption}</p> : null}
        {post.hidden ? <p className="mt-2 text-[11px] text-amber-200">{t('feedHidden')}</p> : null}
      </div>
    </article>
  )
}

export default function AppFeed() {
  const { t } = useApp()
  const session = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [composing, setComposing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [contatos, setContatos] = useState<Record<string, Perfil>>({})

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const rows = await listPosts(0)
      setPosts(rows)
      setHasMore(rows.length === PAGE_SIZE)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  // Volta do login do Google e carrega o Mural
  useEffect(() => {
    if (!feedEnabled) return
    completeSignInFromUrl()
      .catch(() => false)
      .finally(() => load())
  }, [load])

  useEffect(() => {
    if (!feedEnabled || !session) {
      setAdmin(false)
      return
    }
    amIAdmin().then(setAdmin)
  }, [session])

  // Só a equipe carrega os contatos (o banco não entrega para mais ninguém)
  useEffect(() => {
    if (!admin) {
      setContatos({})
      return
    }
    listContatos().then(setContatos)
  }, [admin, posts.length])

  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(id)
  }, [notice])

  const more = async () => {
    setLoadingMore(true)
    try {
      const rows = await listPosts(posts.length)
      setPosts((p) => [...p, ...rows.filter((r) => !p.some((x) => x.id === r.id))])
      setHasMore(rows.length === PAGE_SIZE)
    } catch {
      setNotice(t('feedLoadError'))
    } finally {
      setLoadingMore(false)
    }
  }

  const removeAccount = async () => {
    if (!window.confirm(t('feedDeleteAccountConfirm'))) return
    try {
      await deleteMyAccount()
      setNotice(t('feedAccountDeleted'))
      load()
    } catch {
      setNotice(t('feedError'))
    }
  }

  const header = (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-teal">{t('feedKicker')}</p>
      <h1 className="font-display text-2xl tracking-wide text-white">{t('feedTitle')}</h1>
    </div>
  )

  if (!feedEnabled) {
    return (
      <div className="space-y-4">
        {header}
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/20 text-teal">
            <Camera size={26} aria-hidden="true" />
          </span>
          <p className="text-sm text-white/80">{t('feedSoon')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        {header}
        <button
          type="button"
          onClick={load}
          aria-label={t('refresh')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15"
        >
          <RefreshCw size={16} className={status === 'loading' ? 'animate-spin' : ''} />
        </button>
      </div>

      <WipeBanner />

      {/* Entrar / publicar */}
      {session ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e2bd45] py-3.5 text-sm font-semibold text-navy-dark shadow-lg"
          >
            <Camera size={18} aria-hidden="true" /> {t('feedNew')}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-white/55">
            <span className="truncate">{t('feedSignedAs', { name: session.user.name || session.user.email })}</span>
            <span className="flex gap-3">
              <button type="button" onClick={() => signOut()} className="flex items-center gap-1 hover:text-white">
                <LogOut size={12} aria-hidden="true" /> {t('feedSignOut')}
              </button>
              <button type="button" onClick={removeAccount} className="flex items-center gap-1 text-amber-200/80 hover:text-amber-100">
                <UserX size={12} aria-hidden="true" /> {t('feedDeleteAccount')}
              </button>
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-navy shadow"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {t('feedSignIn')}
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-white/55">
            {t('feedSignInNote')}{' '}
            <a href="/privacidade" target="_blank" rel="noreferrer" className="text-teal underline">
              {t('feedPrivacy')}
            </a>
          </p>
        </div>
      )}

      {/* Fotos */}
      {status === 'loading' && !posts.length ? (
        <div className="space-y-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-[1.75rem] bg-white/[0.06]" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-3xl bg-white/10 p-6 text-center">
          <p className="text-sm">{t('feedLoadError')}</p>
          <button type="button" onClick={load} className="mt-3 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-navy-dark">
            {t('tryAgain')}
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-3xl bg-white/[0.05] p-6 text-center text-sm text-white/65">{t('feedEmpty')}</p>
      ) : (
        <div className="grid gap-4 landscape:grid-cols-2">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              mine={session?.user.id === p.user_id}
              admin={admin}
              contato={contatos[p.user_id]}
              onDeleted={() => setPosts((list) => list.filter((x) => x.id !== p.id))}
              onRestored={() => setPosts((list) => list.map((x) => (x.id === p.id ? { ...x, hidden: false } : x)))}
              onNotice={setNotice}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={more}
          disabled={loadingMore}
          className="mx-auto flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-white/80 hover:bg-white/15"
        >
          {loadingMore ? <RefreshCw size={14} className="animate-spin" aria-hidden="true" /> : null}
          {t('feedMore')}
        </button>
      ) : null}

      <Composer
        open={composing}
        onClose={() => setComposing(false)}
        defaultName={session?.user.name ?? ''}
        onDone={(p) => {
          setPosts((list) => [p, ...list])
          setNotice(t('feedPublished'))
        }}
      />

      {notice ? (
        <div role="status" className="fixed inset-x-0 bottom-24 z-40 mx-auto w-fit max-w-[90vw] animate-fade-up rounded-full bg-white px-4 py-2.5 text-center text-xs font-semibold text-navy shadow-xl">
          {notice}
        </div>
      ) : null}
    </div>
  )
}
