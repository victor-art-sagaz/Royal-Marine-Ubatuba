import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import AboutUbatuba from './pages/AboutUbatuba'
import Coming from './pages/Coming'
import Contact from './pages/Contact'
import Home from './pages/Home'
import News from './pages/News'
import NewsPost from './pages/NewsPost'
import Privacy from './pages/Privacy'
import Weather from './pages/Weather'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/newpage" element={<Weather />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newpage1" element={<AboutUbatuba />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="*" element={<Coming title="PÁGINA NÃO ENCONTRADA" />} />
      </Route>
    </Routes>
  )
}
