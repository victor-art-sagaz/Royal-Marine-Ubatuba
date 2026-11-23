import { useEffect, useState } from 'react'
import { Check, LogOut, Mail, Phone, RefreshCw, Ship, User } from 'lucide-react'
import { BottomSheet } from './AppExtras'
import { getMyProfile, onSessionChange, readSession, saveMyProfile, signInWithGoogle, signOut } from './supabase'
import type { Session } from './supabase'

/** Perfil da pessoa: nome e e-mail vêm do Google (só leitura); telefone e embarcação ela preenche */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [session, setSession] = useState<Session | null>(readSession)
  const [telefone, setTelefone] = useState('')
  const [tipo, setTipo] = useState('')
  const [nomeBarco, setNomeBarco] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => onSessionChange(() => setSession(readSession())), [])

  const userId = session?.user.id

  useEffect(() => {
    if (!open || !userId) return
    setCarregando(true)
    setAviso(null)
    setSalvo(false)
    getMyProfile()
      .then((p) => {
        setTelefone(p?.telefone ?? '')
        setTipo(p?.tipo_embarcacao ?? '')
        setNomeBarco(p?.nome_embarcacao ?? '')
      })
      .catch(() => setAviso('Não consegui carregar seu perfil. Tente de novo.'))
      .finally(() => setCarregando(false))
  }, [open, userId])

  const digitos = telefone.replace(/\D/g, '').length
  const podeSalvar = Boolean(session) && digitos >= 8 && nomeBarco.trim().length >= 2 && !salvando && !carregando

  const salvar = async () => {
    if (!podeSalvar) return
    setSalvando(true)
    setAviso(null)
    try {
      await saveMyProfile({ telefone: telefone.trim(), tipo_embarcacao: tipo.trim(), nome_embarcacao: nomeBarco.trim() })
      setSalvo(true)
    } catch {
      setAviso('Não consegui salvar. Confira os dados e tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  const campo =
    'mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white outline-none placeholder:text-white/35 focus:border-teal'

  return (
    <BottomSheet open={open} onClose={onClose} title="Meu perfil" labelId="meu-perfil">
      {!session ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-white/80">Entre com sua conta Google para cadastrar seu perfil e publicar fotos no Mural.</p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-navy shadow"
          >
            Entrar com Google
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-2 rounded-2xl bg-white/[0.06] p-3">
            <p className="flex items-center gap-2 text-sm text-white">
              <User size={15} className="shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate">{session.user.name || 'Sem nome'}</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Mail size={15} className="shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate">{session.user.email}</span>
            </p>
            <p className="text-[11px] leading-relaxed text-white/55">
              Nome e e-mail vêm da sua conta Google e não podem ser alterados aqui.
            </p>
          </div>

          <label className="block text-xs font-semibold text-white/80">
            Telefone (WhatsApp) <span className="font-normal text-white/50">obrigatório</span>
            <span className="relative block">
              <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                type="tel"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.slice(0, 20))}
                placeholder="(12) 99999-9999"
                disabled={carregando}
                className={`${campo} pl-9`}
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-white/80">
            Tipo de embarcação <span className="font-normal text-white/50">opcional</span>
            <span className="relative block">
              <Ship size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value.slice(0, 40))}
                placeholder="Lancha, veleiro, jet ski..."
                disabled={carregando}
                className={`${campo} pl-9`}
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-white/80">
            Nome da embarcação <span className="font-normal text-white/50">obrigatório</span>
            <input
              value={nomeBarco}
              onChange={(e) => setNomeBarco(e.target.value.slice(0, 60))}
              disabled={carregando}
              className={campo}
            />
          </label>

          <p className="text-[11px] leading-relaxed text-white/55">
            Só você e a equipe da Royal Marine veem essas informações. No feed aparecem apenas o seu nome e o local da foto.
          </p>

          {aviso ? <p className="rounded-xl bg-amber-400/15 p-3 text-xs text-amber-100">{aviso}</p> : null}
          {salvo ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-teal/15 p-3 text-xs text-teal">
              <Check size={14} aria-hidden="true" /> Perfil salvo.
            </p>
          ) : null}

          <button
            type="button"
            onClick={salvar}
            disabled={!podeSalvar}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e2bd45] py-3.5 text-sm font-semibold text-navy-dark transition disabled:opacity-40"
          >
            {salvando ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : null}
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>

          <button
            type="button"
            onClick={() => {
              signOut()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 py-2 text-xs text-white/60 hover:text-white"
          >
            <LogOut size={13} aria-hidden="true" /> Sair da conta
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
