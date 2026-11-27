import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BEACHES, beachById } from './places'
import type { Beach } from './places'

/* =====================================================================
 * Idiomas do app (o site continua só em português)
 * ===================================================================== */

export type Lang = 'pt-BR' | 'en' | 'es' | 'fr' | 'pt-PT'

export const LANGS: { code: Lang; name: string; flag: string; locale: string }[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', locale: 'pt-BR' },
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹', locale: 'pt-PT' },
]

const ptBR = {
  // Casca do app
  appTitle: 'Maré & Tempo',
  tabTide: 'Maré',
  tabWeather: 'Tempo',
  navLabel: 'Seções do app',
  openSite: 'Abrir o site da Royal Marine',
  language: 'Idioma',
  chooseLanguage: 'Escolha o idioma',
  close: 'Fechar',
  myAlerts: 'Meus alertas',
  alertsScheduled: '{n} agendados',
  notifBanner: 'Ative as notificações para receber os avisos de maré, chuva e vento.',
  enable: 'Ativar',
  allowNotifText: 'Permita as notificações para receber os avisos.',
  allowNotif: 'Permitir notificações',
  notifDenied: 'As notificações estão bloqueadas. Libere nas configurações do celular (Notificações › Royal Marine).',
  notifUnsupported:
    'Este aparelho não aceita notificações do app. No iPhone, instale o app pela Tela de Início (iOS 16.4 ou mais novo).',
  noAlerts: 'Nenhum alerta agendado. Toque no sino de uma maré, chuva ou vento para criar.',
  pastAlerts: 'Já passaram',
  sent: 'enviado',
  notSent: 'não enviado',
  deleteAlert: 'Apagar alerta {name}',
  alertsFoot:
    'Os alertas ficam guardados só neste aparelho. O aviso aparece com o app aberto ou em segundo plano; com o app fechado, o celular pode não avisar. Estimativas por modelo, não use para navegação.',
  choosePlace: 'Escolha a praia',
  changePlace: 'Trocar praia',
  placeNote: 'Localização aproximada de cada praia. Os dados vêm de modelos de previsão para o ponto escolhido.',
  siteLink: 'Abrir o site da Royal Marine',

  // Maré
  tideTable: 'Tábua de Maré',
  loadingTides: 'Carregando as marés…',
  tideError: 'Não conseguimos carregar a maré agora.',
  checkInternet: 'Confira a internet e tente de novo.',
  tryAgain: 'Tentar de novo',
  now: 'Agora',
  rising: 'Subindo',
  falling: 'Descendo',
  high: 'Preia-mar',
  low: 'Baixa-mar',
  nextIn: '{type} em',
  atTime: 'às {time}',
  notifyMe: 'Me avise',
  today: 'Hoje',
  chooseDay: 'Escolha o dia',
  extremesLabel: 'Preia-mares e baixa-mares',
  alertFor: 'Criar alerta para {type} às {time}',
  tideSummary: '{type} às {time} ({height})',
  chartLabel: 'Gráfico da maré',
  chartHeight: 'Altura (m)',
  chartNow: 'agora',
  chartFish: 'Atividade dos peixes',
  chartTime: 'Tempo (h)',
  fish: 'Peixes',
  fishActivity: 'Atividade {level}',
  lvlVeryHigh: 'muito alta',
  lvlHigh: 'alta',
  lvlMedium: 'média',
  lvlLow: 'baixa',
  fishNote: 'Destaque = período maior (Lua passando). Estimativa para pescaria.',
  tideDisclaimer:
    'Alturas em relação ao nível médio do mar, estimadas por modelo (Open-Meteo). Não use para navegação.',
  seeAlso: 'Ver também no tabuademares.com',
  waveWind: 'Ondas e vento',
  showWaveWind: 'Mostrar ondas e vento',
  hideWaveWind: 'Ocultar ondas e vento',
  waves: 'Ondas',
  wind: 'Vento',
  waveWindNote: 'As setas apontam para onde vão as ondas e o vento. Ondas: altura e período.',
  noWaveData: 'Sem dados de ondas e vento para este dia.',

  // Lua
  moonTitle: 'Fases da Lua',
  moonLit: '{pct}% iluminada',
  moonNext: 'Próximas fases',
  moonNew: 'Lua Nova',
  moonWaxingCrescent: 'Lua Crescente',
  moonFirstQuarter: 'Quarto Crescente',
  moonWaxingGibbous: 'Crescente Gibosa',
  moonFull: 'Lua Cheia',
  moonWaningGibbous: 'Minguante Gibosa',
  moonLastQuarter: 'Quarto Minguante',
  moonWaningCrescent: 'Lua Minguante',
  moonSpringNow: 'Maré de sizígia (maré viva)',
  moonNeapNow: 'Maré de quadratura (maré morta)',
  moonMidNow: 'Maré intermediária',
  moonSpring:
    'Lua Nova e Lua Cheia trazem marés de sizígia: a água sobe e desce mais, as correntes ficam mais fortes e o mar tende a mexer mais.',
  moonNeap: 'Nos quartos crescente e minguante a diferença entre maré alta e baixa é menor.',

  // Cuidado com o mar
  oceanTitle: 'Cuide do nosso mar',
  ocean1:
    'No Saco da Ribeira, navegue devagar perto das poitas e evite fazer marolas: as ondas balançam muito as embarcações amarradas.',
  ocean2: 'Não jogue lixo no mar. Traga de volta tudo o que levou a bordo.',
  ocean3: 'Respeite a vida marinha e as áreas de banhistas.',

  // Tempo
  forecast: 'Previsão do Tempo',
  loadingWeather: 'Carregando a previsão…',
  weatherError: 'Não conseguimos carregar a previsão.',
  refresh: 'Atualizar previsão',
  feelsLike: 'Sensação de {t}°',
  windDir: 'Vento {dir}',
  gusts: 'Rajadas',
  rainToday: 'Chuva hoje',
  seaState: 'Mar {level}',
  seaCalm: 'calmo',
  seaModerate: 'moderado',
  seaRough: 'agitado',
  wavesM: 'ondas {h} m',
  rainWindTitle: 'Chuva e vento nas próximas 24 h',
  noEvents: 'Sem previsão de chuva começando nem de vento forte. Bom mar!',
  rainFrom: 'Chuva a partir das {time} ({v}%)',
  windFrom: 'Vento forte a partir das {time} ({v} km/h)',
  createAlertX: 'Criar alerta: {x}',
  nextHours: 'Próximas horas',
  next7: 'Próximos 7 dias',
  dataBy: 'Dados por Open-Meteo.com · atualiza a cada 15 minutos.',
  details: 'O tempo agora em detalhes',
  condition: 'Condição',
  cloudCover: 'Cobertura de nuvens',
  precipitation: 'Precipitação',
  comesFrom: 'Provém de {dir} ({deg}°)',
  gustsOf: 'Rajadas de {v} km/h',
  temperature: 'Temperatura',
  maxMin: 'Máx. {max}° · Mín. {min}°',
  humidity: 'Umidade',
  dewPoint: 'Ponto de orvalho {t}°',
  visibility: 'Visibilidade',
  waveNow: 'Ondas agora',
  wavePeriod: 'Período de {s} s',
  seaTemp: 'Água a {t}°',
  uvTitle: 'Raios solares (UV)',
  uvNow: 'Índice UV agora',
  uvMaxToday: 'Máximo de hoje: {v}',
  uvLow: 'Baixo',
  uvModerate: 'Moderado',
  uvHigh: 'Alto',
  uvVeryHigh: 'Muito alto',
  uvExtreme: 'Extremo',
  uvNone: 'Sem proteção',
  uvNoneText: 'Pode ficar ao ar livre sem risco.',
  uvWith: 'Com proteção',
  uvWithText: 'Sombra ao meio-dia, camiseta, chapéu, óculos e protetor solar.',
  uvExtra: 'Proteção extra',
  uvExtraText: 'Evite o sol das 10h às 16h. Sombra, roupa, chapéu, óculos e protetor são obrigatórios.',
  uvNote: 'No mar, o reflexo da água aumenta a radiação.',
  wxClear: 'Céu limpo',
  wxMostlySunny: 'Predomínio de sol',
  wxPartly: 'Parcialmente nublado',
  wxCloudy: 'Nublado',
  wxFog: 'Neblina',
  wxDrizzle: 'Garoa',
  wxRain: 'Chuva',
  wxCold: 'Frio intenso',
  wxShowers: 'Pancadas de chuva',
  wxStorm: 'Tempestade',
  wxUnstable: 'Tempo instável',

  // Criar alerta
  newAlert: 'Novo alerta',
  notifyBefore: 'Avisar antes',
  alertName: 'Nome do alerta',
  note: 'Observação',
  optional: '(opcional)',
  notePh: 'Ex.: levar a lancha para a poita',
  tooLate: 'Esse horário já passou. Escolha um tempo menor.',
  notifyOn: 'Aviso',
  allowAndCreate: 'Permitir notificações e criar alerta',
  createAlert: 'Criar alerta',
  created: 'Alerta criado!',
  createdOk:
    'A notificação aparece com o app aberto ou em segundo plano. Para garantir o aviso com o app fechado, salve também na agenda.',
  createdBlocked:
    'As notificações estão bloqueadas ou não são aceitas neste aparelho. Salve o alerta na agenda para receber o aviso.',
  preferCalendar: 'Prefiro salvar na agenda',
  googleCal: 'Google Agenda',
  calendarFile: 'Calendário',
  kindTideHigh: 'Maré subindo',
  kindTideLow: 'Maré baixando',
  kindRain: 'Chuva chegando',
  kindWind: 'Vento forte chegando',
  suggested: '{kind} em {lead}',
  leadBefore: '{lead} antes',

  // Instalar
  installApp: 'Instalar o app Royal Marine',
  installIos: 'Instalar no iPhone',
  ios1: 'Abra este site no Safari e toque em Compartilhar.',
  ios2: 'Escolha "Adicionar à Tela de Início".',
  ios3: 'Toque em "Adicionar". O ícone da Royal Marine aparece na sua tela.',
}

export type TKey = keyof typeof ptBR
type Dict = Record<TKey, string>

const en: Dict = {
  appTitle: 'Tide & Weather',
  tabTide: 'Tide',
  tabWeather: 'Weather',
  navLabel: 'App sections',
  openSite: 'Open the Royal Marine website',
  language: 'Language',
  chooseLanguage: 'Choose the language',
  close: 'Close',
  myAlerts: 'My alerts',
  alertsScheduled: '{n} scheduled',
  notifBanner: 'Turn on notifications to get tide, rain and wind alerts.',
  enable: 'Turn on',
  allowNotifText: 'Allow notifications to receive the alerts.',
  allowNotif: 'Allow notifications',
  notifDenied: 'Notifications are blocked. Allow them in your phone settings (Notifications › Royal Marine).',
  notifUnsupported:
    'This device does not accept app notifications. On iPhone, install the app from the Home Screen (iOS 16.4 or newer).',
  noAlerts: 'No alerts scheduled. Tap the bell on a tide, rain or wind event to create one.',
  pastAlerts: 'Already passed',
  sent: 'sent',
  notSent: 'not sent',
  deleteAlert: 'Delete alert {name}',
  alertsFoot:
    'Alerts are stored on this device only. They show while the app is open or in the background; with the app closed, your phone may not notify you. Model estimates, not for navigation.',
  choosePlace: 'Choose the beach',
  changePlace: 'Change beach',
  placeNote: 'Approximate location of each beach. Data comes from forecast models for the chosen point.',
  siteLink: 'Open the Royal Marine website',

  tideTable: 'Tide Table',
  loadingTides: 'Loading tides…',
  tideError: 'We could not load the tide right now.',
  checkInternet: 'Check your connection and try again.',
  tryAgain: 'Try again',
  now: 'Now',
  rising: 'Rising',
  falling: 'Falling',
  high: 'High tide',
  low: 'Low tide',
  nextIn: '{type} in',
  atTime: 'at {time}',
  notifyMe: 'Notify me',
  today: 'Today',
  chooseDay: 'Choose the day',
  extremesLabel: 'High and low tides',
  alertFor: 'Create alert for {type} at {time}',
  tideSummary: '{type} at {time} ({height})',
  chartLabel: 'Tide chart',
  chartHeight: 'Height (m)',
  chartNow: 'now',
  chartFish: 'Fish activity',
  chartTime: 'Time (h)',
  fish: 'Fish',
  fishActivity: '{level} activity',
  lvlVeryHigh: 'very high',
  lvlHigh: 'high',
  lvlMedium: 'medium',
  lvlLow: 'low',
  fishNote: 'Highlighted = major period (Moon overhead). Fishing estimate.',
  tideDisclaimer: 'Heights relative to mean sea level, estimated by model (Open-Meteo). Not for navigation.',
  seeAlso: 'Also see tabuademares.com',
  waveWind: 'Waves & wind',
  showWaveWind: 'Show waves and wind',
  hideWaveWind: 'Hide waves and wind',
  waves: 'Waves',
  wind: 'Wind',
  waveWindNote: 'Arrows point where the waves and wind are going. Waves: height and period.',
  noWaveData: 'No wave or wind data for this day.',

  moonTitle: 'Moon Phases',
  moonLit: '{pct}% illuminated',
  moonNext: 'Next phases',
  moonNew: 'New Moon',
  moonWaxingCrescent: 'Waxing Crescent',
  moonFirstQuarter: 'First Quarter',
  moonWaxingGibbous: 'Waxing Gibbous',
  moonFull: 'Full Moon',
  moonWaningGibbous: 'Waning Gibbous',
  moonLastQuarter: 'Last Quarter',
  moonWaningCrescent: 'Waning Crescent',
  moonSpringNow: 'Spring tides',
  moonNeapNow: 'Neap tides',
  moonMidNow: 'Intermediate tides',
  moonSpring:
    'New and full moons bring spring tides: water rises and falls more, currents get stronger and the sea tends to be livelier.',
  moonNeap: 'Around the quarter moons the difference between high and low tide is smaller.',

  oceanTitle: 'Take care of our sea',
  ocean1: 'In Saco da Ribeira, go slow near the moorings and avoid making wakes: they rock the moored boats a lot.',
  ocean2: 'Do not throw trash into the sea. Bring back everything you took on board.',
  ocean3: 'Respect marine life and swimming areas.',

  forecast: 'Weather Forecast',
  loadingWeather: 'Loading the forecast…',
  weatherError: 'We could not load the forecast.',
  refresh: 'Refresh forecast',
  feelsLike: 'Feels like {t}°',
  windDir: 'Wind {dir}',
  gusts: 'Gusts',
  rainToday: 'Rain today',
  seaState: 'Sea {level}',
  seaCalm: 'calm',
  seaModerate: 'moderate',
  seaRough: 'rough',
  wavesM: 'waves {h} m',
  rainWindTitle: 'Rain and wind in the next 24 h',
  noEvents: 'No rain starting and no strong wind expected. Enjoy the sea!',
  rainFrom: 'Rain from {time} ({v}%)',
  windFrom: 'Strong wind from {time} ({v} km/h)',
  createAlertX: 'Create alert: {x}',
  nextHours: 'Next hours',
  next7: 'Next 7 days',
  dataBy: 'Data by Open-Meteo.com · updates every 15 minutes.',
  details: 'Weather now in detail',
  condition: 'Condition',
  cloudCover: 'Cloud cover',
  precipitation: 'Precipitation',
  comesFrom: 'From {dir} ({deg}°)',
  gustsOf: 'Gusts of {v} km/h',
  temperature: 'Temperature',
  maxMin: 'Max {max}° · Min {min}°',
  humidity: 'Humidity',
  dewPoint: 'Dew point {t}°',
  visibility: 'Visibility',
  waveNow: 'Waves now',
  wavePeriod: 'Period {s} s',
  seaTemp: 'Water {t}°',
  uvTitle: 'Sun rays (UV)',
  uvNow: 'UV index now',
  uvMaxToday: "Today's max: {v}",
  uvLow: 'Low',
  uvModerate: 'Moderate',
  uvHigh: 'High',
  uvVeryHigh: 'Very high',
  uvExtreme: 'Extreme',
  uvNone: 'No protection',
  uvNoneText: 'You can safely stay outdoors.',
  uvWith: 'Protection',
  uvWithText: 'Shade at midday, shirt, hat, sunglasses and sunscreen.',
  uvExtra: 'Extra protection',
  uvExtraText: 'Avoid the sun from 10am to 4pm. Shade, clothing, hat, sunglasses and sunscreen are a must.',
  uvNote: 'At sea, water reflection increases radiation.',
  wxClear: 'Clear sky',
  wxMostlySunny: 'Mostly sunny',
  wxPartly: 'Partly cloudy',
  wxCloudy: 'Cloudy',
  wxFog: 'Fog',
  wxDrizzle: 'Drizzle',
  wxRain: 'Rain',
  wxCold: 'Very cold',
  wxShowers: 'Rain showers',
  wxStorm: 'Thunderstorm',
  wxUnstable: 'Unsettled weather',

  newAlert: 'New alert',
  notifyBefore: 'Notify before',
  alertName: 'Alert name',
  note: 'Note',
  optional: '(optional)',
  notePh: 'E.g.: take the boat to the mooring',
  tooLate: 'That time has passed. Choose a shorter time.',
  notifyOn: 'Alert on',
  allowAndCreate: 'Allow notifications and create alert',
  createAlert: 'Create alert',
  created: 'Alert created!',
  createdOk:
    'The notification shows while the app is open or in the background. To be sure you get it with the app closed, also save it to your calendar.',
  createdBlocked: 'Notifications are blocked or not supported on this device. Save the alert to your calendar to get it.',
  preferCalendar: 'I prefer to save it in my calendar',
  googleCal: 'Google Calendar',
  calendarFile: 'Calendar',
  kindTideHigh: 'Tide rising',
  kindTideLow: 'Tide falling',
  kindRain: 'Rain coming',
  kindWind: 'Strong wind coming',
  suggested: '{kind} in {lead}',
  leadBefore: '{lead} before',

  installApp: 'Install the Royal Marine app',
  installIos: 'Install on iPhone',
  ios1: 'Open this site in Safari and tap Share.',
  ios2: 'Choose "Add to Home Screen".',
  ios3: 'Tap "Add". The Royal Marine icon appears on your screen.',
}

const es: Dict = {
  appTitle: 'Marea y Tiempo',
  tabTide: 'Marea',
  tabWeather: 'Tiempo',
  navLabel: 'Secciones de la app',
  openSite: 'Abrir el sitio de Royal Marine',
  language: 'Idioma',
  chooseLanguage: 'Elige el idioma',
  close: 'Cerrar',
  myAlerts: 'Mis alertas',
  alertsScheduled: '{n} programadas',
  notifBanner: 'Activa las notificaciones para recibir avisos de marea, lluvia y viento.',
  enable: 'Activar',
  allowNotifText: 'Permite las notificaciones para recibir los avisos.',
  allowNotif: 'Permitir notificaciones',
  notifDenied: 'Las notificaciones están bloqueadas. Actívalas en los ajustes del móvil (Notificaciones › Royal Marine).',
  notifUnsupported:
    'Este dispositivo no acepta notificaciones de la app. En iPhone, instala la app desde la pantalla de inicio (iOS 16.4 o posterior).',
  noAlerts: 'No hay alertas programadas. Toca la campana de una marea, lluvia o viento para crear una.',
  pastAlerts: 'Ya pasaron',
  sent: 'enviada',
  notSent: 'no enviada',
  deleteAlert: 'Borrar alerta {name}',
  alertsFoot:
    'Las alertas se guardan solo en este dispositivo. El aviso aparece con la app abierta o en segundo plano; con la app cerrada, el móvil puede no avisar. Estimaciones por modelo, no usar para navegación.',
  choosePlace: 'Elige la playa',
  changePlace: 'Cambiar playa',
  placeNote: 'Ubicación aproximada de cada playa. Los datos vienen de modelos de previsión para el punto elegido.',
  siteLink: 'Abrir el sitio de Royal Marine',

  tideTable: 'Tabla de Mareas',
  loadingTides: 'Cargando las mareas…',
  tideError: 'No pudimos cargar la marea ahora.',
  checkInternet: 'Revisa tu conexión e inténtalo de nuevo.',
  tryAgain: 'Intentar de nuevo',
  now: 'Ahora',
  rising: 'Subiendo',
  falling: 'Bajando',
  high: 'Pleamar',
  low: 'Bajamar',
  nextIn: '{type} en',
  atTime: 'a las {time}',
  notifyMe: 'Avísame',
  today: 'Hoy',
  chooseDay: 'Elige el día',
  extremesLabel: 'Pleamares y bajamares',
  alertFor: 'Crear alerta para {type} a las {time}',
  tideSummary: '{type} a las {time} ({height})',
  chartLabel: 'Gráfico de la marea',
  chartHeight: 'Altura (m)',
  chartNow: 'ahora',
  chartFish: 'Actividad de los peces',
  chartTime: 'Hora (h)',
  fish: 'Peces',
  fishActivity: 'Actividad {level}',
  lvlVeryHigh: 'muy alta',
  lvlHigh: 'alta',
  lvlMedium: 'media',
  lvlLow: 'baja',
  fishNote: 'Destacado = periodo mayor (paso de la Luna). Estimación para la pesca.',
  tideDisclaimer:
    'Alturas respecto al nivel medio del mar, estimadas por modelo (Open-Meteo). No usar para navegación.',
  seeAlso: 'Ver también en tabuademares.com',
  waveWind: 'Olas y viento',
  showWaveWind: 'Mostrar olas y viento',
  hideWaveWind: 'Ocultar olas y viento',
  waves: 'Olas',
  wind: 'Viento',
  waveWindNote: 'Las flechas apuntan hacia donde van las olas y el viento. Olas: altura y periodo.',
  noWaveData: 'Sin datos de olas y viento para este día.',

  moonTitle: 'Fases de la Luna',
  moonLit: '{pct}% iluminada',
  moonNext: 'Próximas fases',
  moonNew: 'Luna Nueva',
  moonWaxingCrescent: 'Luna Creciente',
  moonFirstQuarter: 'Cuarto Creciente',
  moonWaxingGibbous: 'Gibosa Creciente',
  moonFull: 'Luna Llena',
  moonWaningGibbous: 'Gibosa Menguante',
  moonLastQuarter: 'Cuarto Menguante',
  moonWaningCrescent: 'Luna Menguante',
  moonSpringNow: 'Mareas vivas',
  moonNeapNow: 'Mareas muertas',
  moonMidNow: 'Mareas intermedias',
  moonSpring:
    'La Luna Nueva y la Luna Llena traen mareas vivas: el agua sube y baja más, las corrientes son más fuertes y el mar suele moverse más.',
  moonNeap: 'En los cuartos creciente y menguante la diferencia entre pleamar y bajamar es menor.',

  oceanTitle: 'Cuida nuestro mar',
  ocean1:
    'En Saco da Ribeira, navega despacio cerca de los fondeos y evita hacer olas: mueven mucho las embarcaciones amarradas.',
  ocean2: 'No tires basura al mar. Trae de vuelta todo lo que llevaste a bordo.',
  ocean3: 'Respeta la vida marina y las zonas de bañistas.',

  forecast: 'Previsión del Tiempo',
  loadingWeather: 'Cargando la previsión…',
  weatherError: 'No pudimos cargar la previsión.',
  refresh: 'Actualizar previsión',
  feelsLike: 'Sensación de {t}°',
  windDir: 'Viento {dir}',
  gusts: 'Ráfagas',
  rainToday: 'Lluvia hoy',
  seaState: 'Mar {level}',
  seaCalm: 'en calma',
  seaModerate: 'moderado',
  seaRough: 'agitado',
  wavesM: 'olas {h} m',
  rainWindTitle: 'Lluvia y viento en las próximas 24 h',
  noEvents: 'No se prevé lluvia ni viento fuerte. ¡Buen mar!',
  rainFrom: 'Lluvia desde las {time} ({v}%)',
  windFrom: 'Viento fuerte desde las {time} ({v} km/h)',
  createAlertX: 'Crear alerta: {x}',
  nextHours: 'Próximas horas',
  next7: 'Próximos 7 días',
  dataBy: 'Datos de Open-Meteo.com · se actualiza cada 15 minutos.',
  details: 'El tiempo ahora en detalle',
  condition: 'Condición',
  cloudCover: 'Nubosidad',
  precipitation: 'Precipitación',
  comesFrom: 'Procede del {dir} ({deg}°)',
  gustsOf: 'Ráfagas de {v} km/h',
  temperature: 'Temperatura',
  maxMin: 'Máx. {max}° · Mín. {min}°',
  humidity: 'Humedad',
  dewPoint: 'Punto de rocío {t}°',
  visibility: 'Visibilidad',
  waveNow: 'Olas ahora',
  wavePeriod: 'Periodo de {s} s',
  seaTemp: 'Agua a {t}°',
  uvTitle: 'Rayos solares (UV)',
  uvNow: 'Índice UV ahora',
  uvMaxToday: 'Máximo de hoy: {v}',
  uvLow: 'Bajo',
  uvModerate: 'Moderado',
  uvHigh: 'Alto',
  uvVeryHigh: 'Muy alto',
  uvExtreme: 'Extremo',
  uvNone: 'Sin protección',
  uvNoneText: 'Puedes estar al aire libre sin riesgo.',
  uvWith: 'Con protección',
  uvWithText: 'Sombra al mediodía, camiseta, sombrero, gafas de sol y protector solar.',
  uvExtra: 'Protección extra',
  uvExtraText: 'Evita el sol de 10 a 16 h. Sombra, ropa, sombrero, gafas y protector son imprescindibles.',
  uvNote: 'En el mar, el reflejo del agua aumenta la radiación.',
  wxClear: 'Despejado',
  wxMostlySunny: 'Mayormente soleado',
  wxPartly: 'Parcialmente nublado',
  wxCloudy: 'Nublado',
  wxFog: 'Niebla',
  wxDrizzle: 'Llovizna',
  wxRain: 'Lluvia',
  wxCold: 'Frío intenso',
  wxShowers: 'Chubascos',
  wxStorm: 'Tormenta',
  wxUnstable: 'Tiempo inestable',

  newAlert: 'Nueva alerta',
  notifyBefore: 'Avisar antes',
  alertName: 'Nombre de la alerta',
  note: 'Nota',
  optional: '(opcional)',
  notePh: 'Ej.: llevar la lancha al fondeo',
  tooLate: 'Esa hora ya pasó. Elige un tiempo menor.',
  notifyOn: 'Aviso el',
  allowAndCreate: 'Permitir notificaciones y crear alerta',
  createAlert: 'Crear alerta',
  created: '¡Alerta creada!',
  createdOk:
    'La notificación aparece con la app abierta o en segundo plano. Para asegurar el aviso con la app cerrada, guárdala también en el calendario.',
  createdBlocked:
    'Las notificaciones están bloqueadas o no se admiten en este dispositivo. Guarda la alerta en el calendario para recibir el aviso.',
  preferCalendar: 'Prefiero guardarla en el calendario',
  googleCal: 'Google Calendar',
  calendarFile: 'Calendario',
  kindTideHigh: 'Marea subiendo',
  kindTideLow: 'Marea bajando',
  kindRain: 'Llega la lluvia',
  kindWind: 'Llega viento fuerte',
  suggested: '{kind} en {lead}',
  leadBefore: '{lead} antes',

  installApp: 'Instalar la app Royal Marine',
  installIos: 'Instalar en iPhone',
  ios1: 'Abre este sitio en Safari y toca Compartir.',
  ios2: 'Elige "Añadir a pantalla de inicio".',
  ios3: 'Toca "Añadir". El icono de Royal Marine aparece en tu pantalla.',
}

const fr: Dict = {
  appTitle: 'Marée & Météo',
  tabTide: 'Marée',
  tabWeather: 'Météo',
  navLabel: "Sections de l'app",
  openSite: 'Ouvrir le site Royal Marine',
  language: 'Langue',
  chooseLanguage: 'Choisissez la langue',
  close: 'Fermer',
  myAlerts: 'Mes alertes',
  alertsScheduled: '{n} programmées',
  notifBanner: 'Activez les notifications pour recevoir les alertes de marée, pluie et vent.',
  enable: 'Activer',
  allowNotifText: 'Autorisez les notifications pour recevoir les alertes.',
  allowNotif: 'Autoriser les notifications',
  notifDenied:
    'Les notifications sont bloquées. Autorisez-les dans les réglages du téléphone (Notifications › Royal Marine).',
  notifUnsupported:
    "Cet appareil n'accepte pas les notifications de l'app. Sur iPhone, installez l'app depuis l'écran d'accueil (iOS 16.4 ou plus récent).",
  noAlerts: "Aucune alerte programmée. Touchez la cloche d'une marée, d'une pluie ou d'un vent pour en créer une.",
  pastAlerts: 'Déjà passées',
  sent: 'envoyée',
  notSent: 'non envoyée',
  deleteAlert: "Supprimer l'alerte {name}",
  alertsFoot:
    "Les alertes sont enregistrées uniquement sur cet appareil. L'avis s'affiche avec l'app ouverte ou en arrière-plan ; app fermée, le téléphone peut ne pas prévenir. Estimations par modèle, pas pour la navigation.",
  choosePlace: 'Choisissez la plage',
  changePlace: 'Changer de plage',
  placeNote: 'Position approximative de chaque plage. Les données viennent de modèles de prévision pour le point choisi.',
  siteLink: 'Ouvrir le site Royal Marine',

  tideTable: 'Horaires des Marées',
  loadingTides: 'Chargement des marées…',
  tideError: "Impossible de charger la marée pour l'instant.",
  checkInternet: 'Vérifiez la connexion et réessayez.',
  tryAgain: 'Réessayer',
  now: 'Maintenant',
  rising: 'Montante',
  falling: 'Descendante',
  high: 'Pleine mer',
  low: 'Basse mer',
  nextIn: '{type} dans',
  atTime: 'à {time}',
  notifyMe: 'Me prévenir',
  today: "Aujourd'hui",
  chooseDay: 'Choisissez le jour',
  extremesLabel: 'Pleines et basses mers',
  alertFor: 'Créer une alerte pour {type} à {time}',
  tideSummary: '{type} à {time} ({height})',
  chartLabel: 'Graphique de la marée',
  chartHeight: 'Hauteur (m)',
  chartNow: 'maintenant',
  chartFish: 'Activité des poissons',
  chartTime: 'Heure (h)',
  fish: 'Poissons',
  fishActivity: 'Activité {level}',
  lvlVeryHigh: 'très forte',
  lvlHigh: 'forte',
  lvlMedium: 'moyenne',
  lvlLow: 'faible',
  fishNote: 'En surbrillance = période majeure (passage de la Lune). Estimation pour la pêche.',
  tideDisclaimer:
    'Hauteurs par rapport au niveau moyen de la mer, estimées par modèle (Open-Meteo). Pas pour la navigation.',
  seeAlso: 'Voir aussi sur tabuademares.com',
  waveWind: 'Vagues et vent',
  showWaveWind: 'Afficher vagues et vent',
  hideWaveWind: 'Masquer vagues et vent',
  waves: 'Vagues',
  wind: 'Vent',
  waveWindNote: 'Les flèches indiquent où vont les vagues et le vent. Vagues : hauteur et période.',
  noWaveData: 'Pas de données de vagues et de vent pour ce jour.',

  moonTitle: 'Phases de la Lune',
  moonLit: '{pct} % éclairée',
  moonNext: 'Prochaines phases',
  moonNew: 'Nouvelle Lune',
  moonWaxingCrescent: 'Premier croissant',
  moonFirstQuarter: 'Premier quartier',
  moonWaxingGibbous: 'Gibbeuse croissante',
  moonFull: 'Pleine Lune',
  moonWaningGibbous: 'Gibbeuse décroissante',
  moonLastQuarter: 'Dernier quartier',
  moonWaningCrescent: 'Dernier croissant',
  moonSpringNow: 'Marées de vives-eaux',
  moonNeapNow: 'Marées de mortes-eaux',
  moonMidNow: 'Marées intermédiaires',
  moonSpring:
    "La Nouvelle Lune et la Pleine Lune amènent les vives-eaux : l'eau monte et descend davantage, les courants sont plus forts et la mer bouge plus.",
  moonNeap: "Aux quartiers, l'écart entre pleine mer et basse mer est plus faible.",

  oceanTitle: 'Prenez soin de notre mer',
  ocean1:
    'À Saco da Ribeira, naviguez lentement près des corps-morts et évitez de faire des vagues : elles secouent beaucoup les bateaux amarrés.',
  ocean2: 'Ne jetez pas de déchets en mer. Rapportez tout ce que vous avez embarqué.',
  ocean3: 'Respectez la vie marine et les zones de baignade.',

  forecast: 'Prévisions Météo',
  loadingWeather: 'Chargement des prévisions…',
  weatherError: 'Impossible de charger les prévisions.',
  refresh: 'Actualiser les prévisions',
  feelsLike: 'Ressenti {t}°',
  windDir: 'Vent {dir}',
  gusts: 'Rafales',
  rainToday: "Pluie aujourd'hui",
  seaState: 'Mer {level}',
  seaCalm: 'calme',
  seaModerate: 'modérée',
  seaRough: 'agitée',
  wavesM: 'vagues {h} m',
  rainWindTitle: 'Pluie et vent dans les prochaines 24 h',
  noEvents: 'Ni pluie ni vent fort prévus. Bonne mer !',
  rainFrom: 'Pluie à partir de {time} ({v} %)',
  windFrom: 'Vent fort à partir de {time} ({v} km/h)',
  createAlertX: 'Créer une alerte : {x}',
  nextHours: 'Prochaines heures',
  next7: '7 prochains jours',
  dataBy: 'Données Open-Meteo.com · mises à jour toutes les 15 minutes.',
  details: 'La météo actuelle en détail',
  condition: 'Conditions',
  cloudCover: 'Couverture nuageuse',
  precipitation: 'Précipitations',
  comesFrom: 'Provient du {dir} ({deg}°)',
  gustsOf: 'Rafales de {v} km/h',
  temperature: 'Température',
  maxMin: 'Max {max}° · Min {min}°',
  humidity: 'Humidité',
  dewPoint: 'Point de rosée {t}°',
  visibility: 'Visibilité',
  waveNow: 'Vagues maintenant',
  wavePeriod: 'Période de {s} s',
  seaTemp: 'Eau à {t}°',
  uvTitle: 'Rayons du soleil (UV)',
  uvNow: 'Indice UV actuel',
  uvMaxToday: "Maximum aujourd'hui : {v}",
  uvLow: 'Faible',
  uvModerate: 'Modéré',
  uvHigh: 'Élevé',
  uvVeryHigh: 'Très élevé',
  uvExtreme: 'Extrême',
  uvNone: 'Sans protection',
  uvNoneText: 'Vous pouvez rester dehors sans risque.',
  uvWith: 'Avec protection',
  uvWithText: 'Ombre à midi, t-shirt, chapeau, lunettes de soleil et crème solaire.',
  uvExtra: 'Protection renforcée',
  uvExtraText: 'Évitez le soleil de 10 h à 16 h. Ombre, vêtements, chapeau, lunettes et crème sont indispensables.',
  uvNote: "En mer, le reflet de l'eau augmente le rayonnement.",
  wxClear: 'Ciel dégagé',
  wxMostlySunny: 'Plutôt ensoleillé',
  wxPartly: 'Partiellement nuageux',
  wxCloudy: 'Nuageux',
  wxFog: 'Brouillard',
  wxDrizzle: 'Bruine',
  wxRain: 'Pluie',
  wxCold: 'Froid intense',
  wxShowers: 'Averses',
  wxStorm: 'Orage',
  wxUnstable: 'Temps instable',

  newAlert: 'Nouvelle alerte',
  notifyBefore: 'Prévenir avant',
  alertName: "Nom de l'alerte",
  note: 'Remarque',
  optional: '(facultatif)',
  notePh: 'Ex. : amener le bateau au corps-mort',
  tooLate: 'Cette heure est passée. Choisissez un délai plus court.',
  notifyOn: 'Alerte le',
  allowAndCreate: "Autoriser les notifications et créer l'alerte",
  createAlert: "Créer l'alerte",
  created: 'Alerte créée !',
  createdOk:
    "La notification s'affiche avec l'app ouverte ou en arrière-plan. Pour être sûr d'être prévenu app fermée, enregistrez-la aussi dans l'agenda.",
  createdBlocked:
    "Les notifications sont bloquées ou non prises en charge sur cet appareil. Enregistrez l'alerte dans l'agenda pour être prévenu.",
  preferCalendar: "Je préfère l'enregistrer dans l'agenda",
  googleCal: 'Google Agenda',
  calendarFile: 'Calendrier',
  kindTideHigh: 'Marée montante',
  kindTideLow: 'Marée descendante',
  kindRain: 'Pluie en approche',
  kindWind: 'Vent fort en approche',
  suggested: '{kind} dans {lead}',
  leadBefore: '{lead} avant',

  installApp: "Installer l'app Royal Marine",
  installIos: 'Installer sur iPhone',
  ios1: 'Ouvrez ce site dans Safari et touchez Partager.',
  ios2: 'Choisissez « Sur l’écran d’accueil ».',
  ios3: "Touchez « Ajouter ». L'icône Royal Marine apparaît sur votre écran.",
}

/** Português de Portugal: só o que muda em relação ao do Brasil */
const ptPT: Partial<Dict> = {
  navLabel: 'Secções da aplicação',
  chooseLanguage: 'Escolha o idioma',
  notifBanner: 'Ative as notificações para receber os avisos de maré, chuva e vento.',
  notifDenied: 'As notificações estão bloqueadas. Autorize nas definições do telemóvel (Notificações › Royal Marine).',
  notifUnsupported:
    'Este dispositivo não aceita notificações da aplicação. No iPhone, instale a aplicação pelo ecrã principal (iOS 16.4 ou mais recente).',
  noAlerts: 'Nenhum alerta agendado. Toque no sino de uma maré, chuva ou vento para criar.',
  alertsFoot:
    'Os alertas ficam guardados apenas neste dispositivo. O aviso aparece com a aplicação aberta ou em segundo plano; com a aplicação fechada, o telemóvel pode não avisar. Estimativas por modelo, não use para navegação.',
  placeNote: 'Localização aproximada de cada praia. Os dados vêm de modelos de previsão para o ponto escolhido.',
  checkInternet: 'Verifique a ligação à internet e tente novamente.',
  tryAgain: 'Tentar novamente',
  notifyMe: 'Avise-me',
  nextIn: '{type} daqui a',
  fishNote: 'Destaque = período maior (passagem da Lua). Estimativa para a pesca.',
  moonWaxingCrescent: 'Lua Crescente',
  moonSpringNow: 'Marés vivas',
  moonNeapNow: 'Marés mortas',
  moonSpring:
    'A Lua Nova e a Lua Cheia trazem marés vivas: a água sobe e desce mais, as correntes ficam mais fortes e o mar tende a mexer mais.',
  moonNeap: 'Nos quartos crescente e minguante, a diferença entre a maré alta e a baixa é menor.',
  ocean1:
    'No Saco da Ribeira, navegue devagar junto às boias de amarração e evite fazer ondulação: as ondas abanam muito as embarcações amarradas.',
  ocean2: 'Não deite lixo ao mar. Traga de volta tudo o que levou a bordo.',
  ocean3: 'Respeite a vida marinha e as zonas balneares.',
  forecast: 'Previsão Meteorológica',
  humidity: 'Humidade',
  noEvents: 'Sem previsão de chuva nem de vento forte. Bom mar!',
  uvWithText: 'Sombra ao meio-dia, t-shirt, chapéu, óculos de sol e protetor solar.',
  wxClear: 'Céu limpo',
  wxDrizzle: 'Chuvisco',
  wxShowers: 'Aguaceiros',
  wxStorm: 'Trovoada',
  notePh: 'Ex.: levar o barco para a boia',
  preferCalendar: 'Prefiro guardar no calendário',
  googleCal: 'Google Calendar',
  createdOk:
    'A notificação aparece com a aplicação aberta ou em segundo plano. Para garantir o aviso com a aplicação fechada, guarde também no calendário.',
  createdBlocked:
    'As notificações estão bloqueadas ou não são suportadas neste dispositivo. Guarde o alerta no calendário para receber o aviso.',
  installApp: 'Instalar a aplicação Royal Marine',
  ios2: 'Escolha "Adicionar ao ecrã principal".',
  ios3: 'Toque em "Adicionar". O ícone da Royal Marine aparece no seu ecrã.',
}

const DICTS: Record<Lang, Dict> = {
  'pt-BR': ptBR,
  en,
  es,
  fr,
  'pt-PT': { ...ptBR, ...ptPT },
}

/* Pontos cardeais (16 direções). Em português do Brasil, Leste = L e Oeste = O. */
const COMPASS: Record<Lang, string[]> = {
  'pt-BR': ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
  en: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
  es: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
  fr: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
  'pt-PT': ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
}

const TZ = 'America/Sao_Paulo'

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* sem armazenamento: só não lembra a escolha */
  }
}

/** Idioma inicial: o salvo, senão o do aparelho, senão português do Brasil */
function initialLang(): Lang {
  const saved = readStored('rm-lang')
  if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'pt-BR').toLowerCase()
  if (nav.startsWith('pt-pt')) return 'pt-PT'
  if (nav.startsWith('pt')) return 'pt-BR'
  if (nav.startsWith('es')) return 'es'
  if (nav.startsWith('fr')) return 'fr'
  if (nav.startsWith('en')) return 'en'
  return 'pt-BR'
}

export interface AppPrefs {
  lang: Lang
  setLang: (lang: Lang) => void
  place: Beach
  setPlace: (id: string) => void
  locale: string
  t: (key: TKey, vars?: Record<string, string | number>) => string
  /** Número no formato do idioma (vírgula ou ponto) */
  num: (value: number, digits?: number) => string
  /** Hora "14:30" no horário de Brasília */
  time: (date: Date) => string
  /** "segunda-feira, 16/11" no horário de Brasília */
  longDay: (date: Date) => string
  /** "Seg" / "Mon" a partir de AAAA-MM-DD */
  weekdayShort: (isoDate: string) => string
  /** "16/11" a partir de AAAA-MM-DD */
  dayMonth: (isoDate: string) => string
  /** Direção em pontos cardeais (16 direções) */
  dir: (degrees: number) => string
}

const AppContext = createContext<AppPrefs | null>(null)

const capitalize = (s: string) => s.replace(/^\p{L}/u, (c) => c.toUpperCase())

export function AppPrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [placeId, setPlaceId] = useState<string>(() => beachById(readStored('rm-place')).id)

  useEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = lang
    return () => {
      document.documentElement.lang = previous
    }
  }, [lang])

  const value = useMemo<AppPrefs>(() => {
    const dict = DICTS[lang]
    const locale = LANGS.find((l) => l.code === lang)?.locale ?? 'pt-BR'
    const noon = (iso: string) => new Date(`${iso}T12:00:00-03:00`)
    return {
      lang,
      setLang: (next) => {
        store('rm-lang', next)
        setLangState(next)
      },
      place: beachById(placeId),
      setPlace: (id) => {
        const beach = beachById(id)
        store('rm-place', beach.id)
        setPlaceId(beach.id)
      },
      locale,
      t: (key, vars) => {
        let text = dict[key] ?? ptBR[key] ?? key
        if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v))
        return text
      },
      num: (v, digits = 1) => v.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }),
      time: (date) => date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ }),
      longDay: (date) =>
        date.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: TZ }),
      weekdayShort: (iso) =>
        capitalize(noon(iso).toLocaleDateString(locale, { weekday: 'short', timeZone: TZ }).replace('.', '').slice(0, 3)),
      dayMonth: (iso) => noon(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', timeZone: TZ }),
      dir: (degrees) => COMPASS[lang][Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16],
    }
  }, [lang, placeId])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppPrefs {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa estar dentro de AppPrefsProvider')
  return ctx
}

/** Texto do tempo (código WMO) no idioma escolhido */
export function weatherKey(code: number): TKey {
  if (code === 0) return 'wxClear'
  if (code === 1) return 'wxMostlySunny'
  if (code === 2) return 'wxPartly'
  if (code === 3) return 'wxCloudy'
  if (code === 45 || code === 48) return 'wxFog'
  if (code >= 51 && code <= 57) return 'wxDrizzle'
  if (code >= 61 && code <= 67) return 'wxRain'
  if (code >= 71 && code <= 77) return 'wxCold'
  if (code >= 80 && code <= 82) return 'wxShowers'
  if (code === 85 || code === 86) return 'wxCold'
  if (code >= 95) return 'wxStorm'
  return 'wxUnstable'
}

/** Nome da fase da Lua (0 = nova, 0,5 = cheia) */
export function moonKey(phase: number): TKey {
  if (phase < 0.03 || phase > 0.97) return 'moonNew'
  if (phase < 0.22) return 'moonWaxingCrescent'
  if (phase < 0.28) return 'moonFirstQuarter'
  if (phase < 0.47) return 'moonWaxingGibbous'
  if (phase < 0.53) return 'moonFull'
  if (phase < 0.72) return 'moonWaningGibbous'
  if (phase < 0.78) return 'moonLastQuarter'
  return 'moonWaningCrescent'
}

export const levelKey: Record<string, TKey> = {
  'muito alta': 'lvlVeryHigh',
  alta: 'lvlHigh',
  média: 'lvlMedium',
  baixa: 'lvlLow',
}

export { BEACHES }
