import { Mail, MessageCircle } from 'lucide-react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { contact, images } from '../data/site'

/** Se quiser mostrar o CNPJ na política, escreva aqui, por exemplo: '00.000.000/0001-00'. Vazio = não aparece. */
const cnpj: string = ''

const updatedAt = '4 de novembro de 2026'

interface PolicySection {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

const sections: PolicySection[] = [
  {
    title: '1. Quem somos',
    paragraphs: [
      'Este site é da Royal Marine - Garagem Náutica, localizada na Rua Marginal, 181, Saco da Ribeira, Ubatuba - SP, CEP 11680-000. Somos responsáveis pelo cuidado com os dados pessoais que você nos enviar, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).',
    ],
  },
  {
    title: '2. Quais dados coletamos',
    paragraphs: [
      'Coletamos apenas o que você mesmo digita no formulário da página Contato (ou nos envia por WhatsApp e e-mail):',
    ],
    bullets: [
      'nome, e-mail e telefone;',
      'nome e tamanho da sua embarcação;',
      'o que você procura (garagem náutica ou embarcação);',
      'a mensagem que você escrever.',
    ],
  },
  {
    title: '3. Como o formulário funciona',
    paragraphs: [
      'Este site não tem banco de dados e não guarda o que você preenche. As informações ficam só no seu aparelho até você clicar para enviar. Nesse momento, o site monta uma mensagem e abre o seu WhatsApp, já com o texto pronto para a Royal Marine.',
      'Depois que você envia, a conversa passa a existir no WhatsApp, que tem a sua própria política de privacidade, e fica com a nossa equipe de atendimento.',
    ],
  },
  {
    title: '4. Para que usamos os seus dados',
    paragraphs: ['Usamos os dados apenas para:'],
    bullets: [
      'responder à sua mensagem e tirar suas dúvidas;',
      'informar sobre vagas, condições e valores;',
      'agendar a sua visita e dar andamento ao atendimento.',
    ],
  },
  {
    title: '5. Por que podemos tratar esses dados',
    paragraphs: [
      'Tratamos os seus dados porque você os envia espontaneamente para pedir informações ou contratar o nosso serviço (LGPD, art. 7º, incisos I e V: consentimento e procedimentos preliminares a um contrato, a pedido de quem escreve).',
    ],
  },
  {
    title: '6. Cookies',
    paragraphs: [
      'Este site não usa cookies de publicidade nem ferramentas que acompanham a sua navegação. Se isso mudar, esta política será atualizada e o site avisará você.',
    ],
  },
  {
    title: '7. Serviços de terceiros que aparecem no site',
    paragraphs: [
      'Para funcionar, o site usa serviços de outras empresas. Ao abrir uma página que usa um deles, o seu aparelho se conecta ao serviço, que pode receber o seu endereço de IP e informações técnicas do navegador:',
    ],
    bullets: [
      'Google Fonts: carrega as letras (fontes) do site.',
      'Google Maps: mostra o mapa na página Contato.',
      'YouTube: nas notícias com vídeo, a imagem de capa é carregada do YouTube. O vídeo só começa quando você clica, e usa o modo de privacidade ampliada (youtube-nocookie).',
      'Open-Meteo: fornece a previsão do tempo e do mar da página Previsão do Tempo.',
      'WhatsApp (Meta): recebe a mensagem que você decidir enviar.',
      'Vercel: empresa que hospeda o site e guarda registros técnicos de acesso, como data, hora e IP, para manter a segurança.',
    ],
  },
  {
    title: '8. Compartilhamento',
    paragraphs: [
      'Não vendemos nem alugamos os seus dados. Só os compartilhamos com os serviços acima, quando necessário para o site funcionar, ou se uma lei ou ordem judicial exigir.',
    ],
  },
  {
    title: '9. Por quanto tempo guardamos',
    paragraphs: [
      'Mantemos as conversas de atendimento pelo tempo necessário para atender você e cumprir obrigações legais. Se você pedir para apagar, apagamos, salvo quando a lei nos obrigar a manter alguma informação.',
    ],
  },
  {
    title: '10. Seus direitos',
    paragraphs: ['Pela LGPD, você pode pedir a qualquer momento:'],
    bullets: [
      'confirmar se tratamos dados seus e ter acesso a eles;',
      'corrigir dados incompletos ou errados;',
      'pedir a exclusão ou o bloqueio de dados desnecessários;',
      'saber com quem os dados foram compartilhados;',
      'retirar o seu consentimento.',
    ],
  },
  {
    title: '11. Segurança',
    paragraphs: [
      'O site usa conexão segura (HTTPS) e proteções contra ataques comuns. Mesmo assim, nenhum sistema é totalmente livre de riscos. Por isso, nunca envie senhas, números de cartão ou documentos pelo formulário.',
    ],
  },
  {
    title: '12. Mudanças nesta política',
    paragraphs: [
      `Podemos atualizar esta política quando for preciso. A data da última atualização aparece no topo desta página. Última atualização: ${updatedAt}.`,
    ],
  },
]

export default function Privacy() {
  const phone = contact.phones[0]
  return (
    <>
      <PageHero
        title="POLÍTICA DE PRIVACIDADE"
        subtitle="Como cuidamos dos seus dados, em linguagem simples"
        image={images.ubatubaOndas}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal>
          <p className="font-serif text-sm italic text-teal-dark">Atualizada em {updatedAt}</p>
          {cnpj ? <p className="mt-2 text-sm font-light">CNPJ: {cnpj}</p> : null}
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
            </Reveal>
          ))}

          <Reveal>
            <div className="rounded-3xl border border-teal/40 bg-teal/10 p-6">
              <h2 className="font-display text-2xl font-light tracking-wide text-navy">13. Fale com a gente</h2>
              <div className="my-3 h-0.5 w-10 bg-teal" />
              <p className="mb-4 font-light leading-relaxed">
                Para qualquer pedido ou dúvida sobre os seus dados, escreva para a Royal Marine:
              </p>
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
