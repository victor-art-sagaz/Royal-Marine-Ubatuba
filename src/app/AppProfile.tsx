import { useEffect, useState } from 'react'
import { Check, ExternalLink, LogOut, Mail, Phone, RefreshCw, Ship, User } from 'lucide-react'
import { BottomSheet } from './AppExtras'
import type { Lang } from './i18n'
import { useApp } from './i18n'
import { getMyProfile, onSessionChange, readSession, saveMyProfile, signInWithGoogle, signOut } from './supabase'
import type { Session } from './supabase'

/** Endereço do site oficial (troque aqui quando o domínio próprio estiver ativo) */
export const SITE_URL = 'https://royal-marine-ubatuba.vercel.app'

type Texts = {
  title: string
  signInIntro: string
  signIn: string
  loadError: string
  noName: string
  readonlyNote: string
  phone: string
  required: string
  optional: string
  boatType: string
  boatTypePh: string
  boatName: string
  privacy: string
  saved: string
  saveError: string
  saving: string
  save: string
  signOut: string
  visitSite: string
  nameNote: string
  profileWarn: string
  noPhone: string
  noBoat: string
}

const TEXTS: Record<Lang, Texts> = {
  'pt-BR': {
    title: 'Meu perfil',
    signInIntro: 'Entre com sua conta Google para cadastrar seu perfil e publicar fotos no Mural.',
    signIn: 'Entrar com Google',
    loadError: 'Não consegui carregar seu perfil. Tente de novo.',
    noName: 'Sem nome',
    readonlyNote: 'Nome e e-mail vêm da sua conta Google e não podem ser alterados aqui.',
    phone: 'Telefone (WhatsApp)',
    required: 'obrigatório',
    optional: 'opcional',
    boatType: 'Tipo de embarcação',
    boatTypePh: 'Lancha, veleiro, jet ski...',
    boatName: 'Nome da embarcação',
    privacy: 'Só você e a equipe da Royal Marine veem essas informações. No feed aparecem apenas o seu nome e o local da foto.',
    saved: 'Perfil salvo.',
    saveError: 'Não consegui salvar. Confira os dados e tente de novo.',
    saving: 'Salvando...',
    save: 'Salvar perfil',
    signOut: 'Sair da conta',
    visitSite: 'Visitar o site oficial',
    nameNote: 'Nome da sua conta Google. Não pode ser alterado.',
    profileWarn: 'Antes de publicar, complete seu telefone e o nome da embarcação no seu perfil (ícone de pessoa, no topo).',
    noPhone: 'sem telefone',
    noBoat: 'sem embarcação',
  },
  en: {
    title: 'My profile',
    signInIntro: 'Sign in with your Google account to set up your profile and post photos to the Mural.',
    signIn: 'Sign in with Google',
    loadError: "I couldn't load your profile. Please try again.",
    noName: 'No name',
    readonlyNote: "Name and email come from your Google account and can't be changed here.",
    phone: 'Phone (WhatsApp)',
    required: 'required',
    optional: 'optional',
    boatType: 'Boat type',
    boatTypePh: 'Motorboat, sailboat, jet ski...',
    boatName: 'Boat name',
    privacy: "Only you and the Royal Marine team can see this information. The feed only shows your name and the photo's location.",
    saved: 'Profile saved.',
    saveError: "I couldn't save. Check the details and try again.",
    saving: 'Saving...',
    save: 'Save profile',
    signOut: 'Sign out',
    visitSite: 'Visit the official website',
    nameNote: "Name from your Google account. It can't be changed.",
    profileWarn: 'Before posting, complete your phone and boat name in your profile (person icon at the top).',
    noPhone: 'no phone',
    noBoat: 'no boat',
  },
  es: {
    title: 'Mi perfil',
    signInIntro: 'Inicia sesión con tu cuenta de Google para crear tu perfil y publicar fotos en el Mural.',
    signIn: 'Iniciar sesión con Google',
    loadError: 'No pude cargar tu perfil. Inténtalo de nuevo.',
    noName: 'Sin nombre',
    readonlyNote: 'El nombre y el correo vienen de tu cuenta de Google y no se pueden cambiar aquí.',
    phone: 'Teléfono (WhatsApp)',
    required: 'obligatorio',
    optional: 'opcional',
    boatType: 'Tipo de embarcación',
    boatTypePh: 'Lancha, velero, moto acuática...',
    boatName: 'Nombre de la embarcación',
    privacy: 'Solo tú y el equipo de Royal Marine ven esta información. En el feed solo aparecen tu nombre y el lugar de la foto.',
    saved: 'Perfil guardado.',
    saveError: 'No pude guardar. Revisa los datos e inténtalo de nuevo.',
    saving: 'Guardando...',
    save: 'Guardar perfil',
    signOut: 'Cerrar sesión',
    visitSite: 'Visitar el sitio oficial',
    nameNote: 'Nombre de tu cuenta de Google. No se puede cambiar.',
    profileWarn: 'Antes de publicar, completa tu teléfono y el nombre de la embarcación en tu perfil (icono de persona, arriba).',
    noPhone: 'sin teléfono',
    noBoat: 'sin embarcación',
  },
  fr: {
    title: 'Mon profil',
    signInIntro: 'Connectez-vous avec votre compte Google pour créer votre profil et publier des photos sur le Mural.',
    signIn: 'Se connecter avec Google',
    loadError: "Je n'ai pas pu charger votre profil. Réessayez.",
    noName: 'Sans nom',
    readonlyNote: "Le nom et l'e-mail viennent de votre compte Google et ne peuvent pas être modifiés ici.",
    phone: 'Téléphone (WhatsApp)',
    required: 'obligatoire',
    optional: 'facultatif',
    boatType: 'Type de bateau',
    boatTypePh: 'Vedette, voilier, jet ski...',
    boatName: 'Nom du bateau',
    privacy: "Seuls vous et l'équipe Royal Marine voyez ces informations. Le fil n'affiche que votre nom et le lieu de la photo.",
    saved: 'Profil enregistré.',
    saveError: "Échec de l'enregistrement. Vérifiez les informations et réessayez.",
    saving: 'Enregistrement...',
    save: 'Enregistrer le profil',
    signOut: 'Se déconnecter',
    visitSite: 'Visiter le site officiel',
    nameNote: 'Nom de votre compte Google. Il ne peut pas être modifié.',
    profileWarn: 'Avant de publier, renseignez votre téléphone et le nom du bateau dans votre profil (icône personne, en haut).',
    noPhone: 'sans téléphone',
    noBoat: 'sans bateau',
  },
  'pt-PT': {
    title: 'O meu perfil',
    signInIntro: 'Inicie sessão com a sua conta Google para criar o seu perfil e publicar fotos no Mural.',
    signIn: 'Iniciar sessão com Google',
    loadError: 'Não consegui carregar o seu perfil. Tente novamente.',
    noName: 'Sem nome',
    readonlyNote: 'O nome e o e-mail vêm da sua conta Google e não podem ser alterados aqui.',
    phone: 'Telefone (WhatsApp)',
    required: 'obrigatório',
    optional: 'opcional',
    boatType: 'Tipo de embarcação',
    boatTypePh: 'Lancha, veleiro, jet ski...',
    boatName: 'Nome da embarcação',
    privacy: 'Só você e a equipa Royal Marine veem estas informações. No feed aparecem apenas o seu nome e o local da foto.',
    saved: 'Perfil guardado.',
    saveError: 'Não consegui guardar. Verifique os dados e tente novamente.',
    saving: 'A guardar...',
    save: 'Guardar perfil',
    signOut: 'Terminar sessão',
    visitSite: 'Visitar o site oficial',
    nameNote: 'Nome da sua conta Google. Não pode ser alterado.',
    profileWarn: 'Antes de publicar, complete o seu telefone e o nome da embarcação no seu perfil (ícone de pessoa, no topo).',
    noPhone: 'sem telefone',
    noBoat: 'sem embarcação',
  },
}

/** Textos do perfil e do Mural no idioma escolhido no app */
export function profileText(lang: Lang): Texts {
  return TEXTS[lang] ?? TEXTS['pt-BR']
}

/** Perfil da pessoa: nome e e-mail vêm do Google (só leitura); telefone e embarcação ela preenche */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useApp()
  const tx = profileText(lang)
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
      .catch(() => setAviso(tx.loadError))
      .finally(() => setCarregando(false))
    // tx muda só com o idioma; não recarrega o perfil por isso
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setAviso(tx.saveError)
    } finally {
      setSalvando(false)
    }
  }

  const campo =
    'mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white outline-none placeholder:text-white/35 focus:border-teal'

  return (
    <BottomSheet open={open} onClose={onClose} title={tx.title} labelId="meu-perfil">
      {!session ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-white/80">{tx.signInIntro}</p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-navy shadow"
          >
            {tx.signIn}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-2 rounded-2xl bg-white/[0.06] p-3">
            <p className="flex items-center gap-2 text-sm text-white">
              <User size={15} className="shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate">{session.user.name || tx.noName}</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Mail size={15} className="shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate">{session.user.email}</span>
            </p>
            <p className="text-[11px] leading-relaxed text-white/55">{tx.readonlyNote}</p>
          </div>

          <label className="block text-xs font-semibold text-white/80">
            {tx.phone} <span className="font-normal text-white/50">{tx.required}</span>
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
            {tx.boatType} <span className="font-normal text-white/50">{tx.optional}</span>
            <span className="relative block">
              <Ship size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value.slice(0, 40))}
                placeholder={tx.boatTypePh}
                disabled={carregando}
                className={`${campo} pl-9`}
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-white/80">
            {tx.boatName} <span className="font-normal text-white/50">{tx.required}</span>
            <input
              value={nomeBarco}
              onChange={(e) => setNomeBarco(e.target.value.slice(0, 60))}
              disabled={carregando}
              className={campo}
            />
          </label>

          <p className="text-[11px] leading-relaxed text-white/55">{tx.privacy}</p>

          {aviso ? <p className="rounded-xl bg-amber-400/15 p-3 text-xs text-amber-100">{aviso}</p> : null}
          {salvo ? (
            <p className="flex items-center gap-1.5 rounded-xl bg-teal/15 p-3 text-xs text-teal">
              <Check size={14} aria-hidden="true" /> {tx.saved}
            </p>
          ) : null}

          <button
            type="button"
            onClick={salvar}
            disabled={!podeSalvar}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e2bd45] py-3.5 text-sm font-semibold text-navy-dark transition disabled:opacity-40"
          >
            {salvando ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : null}
            {salvando ? tx.saving : tx.save}
          </button>

          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-sm text-white/85 hover:bg-white/10"
          >
            <ExternalLink size={14} aria-hidden="true" /> {tx.visitSite}
          </a>

          <button
            type="button"
            onClick={() => {
              signOut()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 py-2 text-xs text-white/60 hover:text-white"
          >
            <LogOut size={13} aria-hidden="true" /> {tx.signOut}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
