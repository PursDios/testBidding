import { Routes, Route, Navigate } from 'react-router-dom'
import Auctions from './pages/Auctions'
import About from './pages/About'
import Contact from './pages/Contact'

function Router() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/auctions" />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}

export default Router
