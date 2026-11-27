import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './app/AppShell'
import AppTide from './app/AppTide'
import AppWeather from './app/AppWeather'
import Layout from './components/Layout'
import { isStandalone } from './lib/standalone'
import About from './pages/About'
import AboutUbatuba from './pages/AboutUbatuba'
import Coming from './pages/Coming'
import Contact from './pages/Contact'
import Home from './pages/Home'
import News from './pages/News'
import NewsPost from './pages/NewsPost'
import Privacy from './pages/Privacy'
import Store from './pages/Store'
import Terms from './pages/Terms'
import Tide from './pages/Tide'
import BoatCare from './pages/BoatCare'
import Weather from './pages/Weather'

/** No app instalado, só existem Maré e Tempo: qualquer página do site leva para a Maré */
function SiteLayout() {
  return isStandalone() ? <Navigate to="/app/mare" replace /> : <Layout />
}

export default function App() {
  return (
    <Routes>
      {/* App instalável: interface própria, só Tábua de Maré e Previsão do Tempo */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/mare" replace />} />
        <Route path="mare" element={<AppTide />} />
        <Route path="tempo" element={<AppWeather />} />
        <Route path="*" element={<Navigate to="/app/mare" replace />} />
      </Route>

      {/* Site */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/newpage" element={<Weather />} />
        <Route path="/tabua-de-mare" element={<Tide />} />
        <Route path="/cuidados-a-bordo" element={<BoatCare />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newpage1" element={<AboutUbatuba />} />
        <Route path="/loja" element={<Store />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/termos-de-uso" element={<Terms />} />
        <Route path="*" element={<Coming title="PÁGINA NÃO ENCONTRADA" />} />
      </Route>
    </Routes>
  )
}
