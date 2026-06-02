import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navigation.css'

function Navigation() {
    const location = useLocation()
    const [resetting, setResetting] = useState(false)
    const [confirm, setConfirm] = useState(false)

    function handleResetClick() {
        if (!confirm) {
            setConfirm(true)
            setTimeout(() => setConfirm(false), 3000)
            return
        }
        setConfirm(false)
        setResetting(true)
        fetch(`${import.meta.env.VITE_API_URL}/api/reset`, { method: 'POST' })
            .finally(() => setResetting(false))
    }

    return (
        <>
            <nav style={{ backgroundColor: '#0a0a0a' }} className="flex items-center px-10 py-5">
                <div className="flex-1">
                    <span className="logo tracking-widest">MERIDIAN</span>
                </div>
                <div className="flex gap-10">
                    <Link to='/auctions' className={`nav-link ${location.pathname === '/auctions' ? 'active' : ''}`}>Auctions</Link>
                    <Link to='/about' className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                    <Link to='/contact' className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        className={`reset-button ${confirm ? 'confirm' : ''}`}
                        onClick={handleResetClick}
                        disabled={resetting}
                    >
                        {resetting ? 'Resetting...' : confirm ? 'Are you sure?' : 'Reset Auction'}
                    </button>
                </div>
            </nav>
            <div className="gold-line" />
        </>
    )
}

export default Navigation
