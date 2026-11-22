import { Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { contact, images } from '../data/site'

const updatedAt = '22 de novembro de 2026'

interface TermsSection {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

/** Termos de uso do site e do app instalável. Para mudar um texto, edite aqui. */
const sections: TermsSection[] = [
  {
    title: '1. Sobre estes termos',
    paragraphs: [
      'Estes termos valem para o site royalmarineubatuba.com.br e para o app instalável (PWA) da Royal Marine - Garagem Náutica, localizada na Rua Marginal, 181, Saco da Ribeira, Ubatuba - SP. Ao usar o site ou o app, você concorda com estas regras.',
    ],
  },
  {
    title: '2. Tábua de maré, previsão do tempo e alertas',
    paragraphs: [
      'As informações de maré, tempo, vento, ondas e atividade dos peixes são estimativas feitas por modelos de previsão de serviços externos (Open-Meteo) e por cálculos astronômicos. Elas servem para planejar passeios e pescarias.',
    ],
    bullets: [
      'Não servem para navegação e não substituem as fontes oficiais, como a Marinha do Brasil e a Capitania dos Portos.',
      'A previsão pode mudar a qualquer momento, e os alertas salvos na agenda ou no app não são atualizados automaticamente.',
      'As notificações do app dependem do celular: elas aparecem com o app aberto ou em segundo plano, e podem não chegar com o app fechado, em economia de bateria, sem internet ou com as notificações bloqueadas. Para avisos importantes, salve também na agenda.',
      'A decisão de sair para navegar é sempre do condutor da embarcação, que deve avaliar as condições do mar e do tempo no momento e seguir as normas da autoridade marítima.',
      'A Royal Marine não se responsabiliza por decisões tomadas apenas com base nessas estimativas.',
    ],
  },
  {
    title: '3. Dicas de cuidados',
    paragraphs: [
      'As dicas da página Cuidados a Bordo são orientações gerais. Para manutenção, siga sempre o manual do fabricante e a avaliação de um profissional.',
    ],
  },
  {
    title: '4. Valores, planos e reservas',
    paragraphs: [
      'Os planos descritos no site são informativos. Valores, disponibilidade de vagas e condições são confirmados pela nossa equipe no atendimento, pelo WhatsApp ou pessoalmente, e podem mudar sem aviso no site.',
    ],
  },
  {
    title: '5. Uso adequado',
    bullets: [
      'Não tente invadir, copiar em massa ou atrapalhar o funcionamento do site e do app.',
      'Não use o formulário ou o WhatsApp para enviar conteúdo ofensivo, falso ou ilegal.',
      'Nunca envie senhas, números de cartão ou documentos pelo formulário.',
    ],
  },
  {
    title: '6. Mural de fotos do app',
    paragraphs: [
      'O Mural é um espaço aberto para a comunidade compartilhar fotos do mar de Ubatuba. Para publicar, é preciso entrar com a conta Google e aceitar estas regras. Cada pessoa pode publicar até 10 fotos por dia.',
      'Todas as publicações são apagadas automaticamente todos os dias às 23:59 (horário de Brasília). Se quiser guardar uma foto, mantenha a original no seu celular.',
    ],
    bullets: [
      'Publique apenas fotos que você mesmo tirou ou que tem o direito de usar.',
      'Não mostre o rosto de outras pessoas sem autorização delas, nem crianças identificáveis, documentos ou placas de veículos e embarcações.',
      'Não publique propaganda, ofensas, conteúdo violento, sexual, falso ou ilegal.',
      'Quem publica é responsável pela foto e pela legenda. A Royal Marine pode esconder ou apagar publicações que desrespeitem estas regras e bloquear quem insistir.',
      'Viu algo errado? Toque na bandeira da foto para denunciar. Com 3 denúncias, a foto fica escondida até a equipe revisar.',
    ],
  },
  {
    title: '7. Marca e conteúdo',
    paragraphs: [
      'O nome Royal Marine, a logo, os textos e as imagens do site pertencem à Royal Marine - Garagem Náutica ou são usados com autorização. Não podem ser copiados para fins comerciais sem permissão.',
    ],
  },
  {
    title: '8. Links para outros sites',
    paragraphs: [
      'O site tem links para serviços de terceiros, como WhatsApp, Google Agenda, Google Maps, Instagram, YouTube e tabuademares.com. Esses serviços têm regras próprias, e a Royal Marine não controla o conteúdo deles.',
    ],
  },
  {
    title: '9. Disponibilidade',
    paragraphs: [
      'Fazemos o possível para manter o site e o app sempre no ar, mas eles podem ficar indisponíveis por manutenção ou por falhas de serviços externos.',
    ],
  },
  {
    title: '10. Privacidade',
    paragraphs: [
      'O cuidado com os seus dados está explicado na nossa Política de Privacidade.',
    ],
  },
  {
    title: '11. Mudanças nestes termos',
    paragraphs: [
      `Podemos atualizar estes termos quando for preciso. A data da última atualização aparece no topo desta página. Última atualização: ${updatedAt}. Estes termos seguem a lei brasileira.`,
    ],
  },
]

export default function Terms() {
  const phone = contact.quotePhone
  return (
    <>
      <PageHero title="TERMOS DE USO" subtitle="Regras do site e do app da Royal Marine" image={images.ubatubaOndas} />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <p className="font-serif text-sm italic text-teal-dark">Atualizados em {updatedAt}</p>
        </Reveal>

        <div className="mt-6 space-y-10">
          {sections.map((section) => (
            <Reveal key={section.title}>
              <h2 className="font-display text-2xl font-light tracking-wide text-navy">{section.title}</h2>
              <div className="my-3 h-0.5 w-10 bg-teal" />
              {section.paragraphs?.map((p) => (
                <p key={p} className="mb-3 font-light leading-relaxed">
                  {p}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-6 font-light leading-relaxed marker:text-teal-dark">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {section.title.startsWith('9.') ? (
                <Link to="/privacidade" className="text-sm font-medium text-teal-dark underline-offset-4 hover:underline">
                  Ler a Política de Privacidade
                </Link>
              ) : null}
            </Reveal>
          ))}

          <Reveal>
            <div className="rounded-3xl border border-teal/40 bg-teal/10 p-6">
              <h2 className="font-display text-2xl font-light tracking-wide text-navy">12. Fale com a gente</h2>
              <div className="my-3 h-0.5 w-10 bg-teal" />
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 break-all text-navy transition hover:text-teal-dark"
                  >
                    <Mail size={18} className="shrink-0 text-teal-dark" />
                    {contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${phone.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-navy transition hover:text-teal-dark"
                  >
                    <MessageCircle size={18} className="shrink-0 text-teal-dark" />
                    WhatsApp {phone.display}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
