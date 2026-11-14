import { Anchor, CalendarCheck, Clock, MapPin, MessageCircle, ShieldCheck, Warehouse, Wrench } from 'lucide-react'
import type { FaqItem } from '../types'

/**
 * Perguntas frequentes. Para mudar um texto, edite aqui; o visual se ajusta sozinho.
 * Cada item de "answer" vira um parágrafo.
 */
export const faq: FaqItem[] = [
  {
    id: 'onde-fica',
    question: 'Onde fica a Royal Marine?',
    icon: MapPin,
    answer: [
      'Ficamos no Saco da Ribeira, em Ubatuba, no Litoral Norte de São Paulo.',
      'A recepção fica na Rua Marginal, 181 (CEP 11685-702), e a garagem fica na Rua Codó, 96 (CEP 11680-000).',
    ],
  },
  {
    id: 'estrutura',
    question: 'Como é a estrutura da garagem náutica?',
    icon: Warehouse,
    answer: [
      'São 10.000 m² de espaço coberto, com capacidade para até 150 embarcações. Todas as vagas são cobertas.',
      'Temos hall social, vestiários, home-box e Wi-Fi, além de 8 poitas próximas ao canal do Saco da Ribeira, exclusivas para nossos clientes.',
    ],
  },
  {
    id: 'seguranca',
    question: 'Minha embarcação fica segura?',
    icon: ShieldCheck,
    answer: [
      'Sim. A garagem conta com sistema de alarme e monitoramento 24 horas da sua embarcação, sempre em local coberto.',
    ],
  },
  {
    id: 'cuidados',
    question: 'Vocês cuidam da manutenção e da limpeza?',
    icon: Wrench,
    answer: [
      'Temos uma equipe 100% técnica, responsável pelo funcionamento e pela análise das embarcações. Cada embarcação tem uma ficha exclusiva, que registra data, horário, tempo de funcionamento e as ocorrências encontradas.',
      'A limpeza e a estética da embarcação são feitas pela WashBoat, empresa parceira que atende dentro da própria marina. Nos nossos planos, você tem acesso a esse serviço sem sair da Royal Marine.',
      'Dentro da própria marina você também encontra prestação de serviços naval/marítimo: tapeceiro, mecânico, eletricista, serralheiro inox (náutico), serviços náuticos em geral, além de despachante náutico.',
    ],
  },
  {
    id: 'lancamentos',
    question: 'Como funciona a subida e a descida da embarcação?',
    icon: Anchor,
    answer: [
      'Depende do plano: no Mensal Premium e no Mensal – Jet Ski as descidas são ilimitadas, e no Mensal Basic são 4 descidas e 4 subidas por mês. Também fazemos operações avulsas de lançamento e retirada ao mar. Para combinar o horário da sua saída, fale com a nossa equipe pelo WhatsApp.',
      'Também oferecemos atendimento pré e pós passeio.',
    ],
  },
  {
    id: 'horario',
    question: 'Qual é o horário de funcionamento?',
    icon: Clock,
    answer: [
      'Abrimos todos os dias da semana e não fechamos para o almoço, para dar mais flexibilidade ao uso e à manutenção da sua embarcação. Nos feriados, o atendimento é exclusivo.',
      'De segunda a sexta, das 8h às 17h. Aos sábados, domingos e feriados, das 8h às 18h. Na temporada de verão, das 8h às 19h.',
      'Os horários podem mudar em datas especiais. Se for ir em um dia de feriado, vale confirmar antes pelo WhatsApp.',
    ],
  },
  {
    id: 'valores',
    question: 'Quanto custa e como faço para reservar uma vaga?',
    icon: MessageCircle,
    answer: [
      'Temos os planos Mensal Premium, Mensal Basic, Vagas para manutenção, Mensal – Jet Ski e Operações avulsas. Os valores de cada um estão na seção Planos e valores, na Página Inicial e na página Contato.',
      'Quem tem mais de uma lancha, ou um jet ski junto com a lancha, pode ter um desconto especial. A vaga diária depende de disponibilidade.',
      'Para um orçamento, preencha o formulário na página Contato com o nome e o tamanho da sua embarcação, ou chame no WhatsApp (12) 99775-7520.',
    ],
  },
  {
    id: 'visita',
    question: 'Posso conhecer a garagem antes de fechar?',
    icon: CalendarCheck,
    answer: [
      'Claro! Será um prazer receber você. Agende a sua visita pelo formulário da página Contato ou pelo WhatsApp.',
    ],
  },
]
