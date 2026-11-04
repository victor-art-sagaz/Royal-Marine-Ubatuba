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
      'A recepção fica na Rua Marginal, 181, e a garagem fica na Rua Codó, 96. O CEP das duas é 11680-000.',
    ],
  },
  {
    id: 'estrutura',
    question: 'Como é a estrutura da garagem náutica?',
    icon: Warehouse,
    answer: [
      'São mais de 3.000 m² de espaço coberto, com capacidade para até 80 embarcações. Todas as vagas são cobertas.',
      'Temos hall social, vestiários, home-box, Wi-Fi e sala de rádio.',
    ],
  },
  {
    id: 'seguranca',
    question: 'Minha embarcação fica segura?',
    icon: ShieldCheck,
    answer: [
      'Sim. A garagem conta com sistema de alarme e monitoramento online 24 horas da sua embarcação, sempre em local coberto.',
    ],
  },
  {
    id: 'cuidados',
    question: 'Vocês cuidam da manutenção e da limpeza?',
    icon: Wrench,
    answer: [
      'Temos uma equipe 100% técnica, responsável pelo funcionamento e pela análise das embarcações. Cada embarcação tem uma ficha exclusiva, que registra data, horário, tempo de funcionamento e as ocorrências encontradas.',
      'A limpeza interna e externa é feita por outra equipe, dedicada só a essa função.',
    ],
  },
  {
    id: 'lancamentos',
    question: 'Como funciona a subida e a descida da embarcação?',
    icon: Anchor,
    answer: [
      'Os lançamentos (subida e descida) são ilimitados. Para combinar o horário da sua saída, fale com a nossa equipe pelo WhatsApp.',
    ],
  },
  {
    id: 'horario',
    question: 'Qual é o horário de funcionamento?',
    icon: Clock,
    answer: [
      'Abrimos todos os dias da semana, inclusive no horário de almoço, para dar mais flexibilidade ao uso e à manutenção da sua embarcação.',
      'Segunda, terça e quinta, das 9h às 17h. Na quarta abrimos de 10h às 16h. Nas sextas, sábados, domingos e feriados, das 8h às 18h.',
      'Os horários podem mudar em datas especiais. Se for ir em um dia de feriado, vale confirmar antes pelo WhatsApp.',
    ],
  },
  {
    id: 'valores',
    question: 'Como faço para saber os valores e reservar uma vaga?',
    icon: MessageCircle,
    answer: [
      'Preencha o formulário na página Contato, com o nome e o tamanho da sua embarcação. Ele abre uma conversa no WhatsApp da Royal Marine já com as informações preenchidas, e a nossa equipe responde com as melhores condições.',
      'Se preferir, é só chamar direto pelo WhatsApp.',
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
