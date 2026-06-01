import { Link, useLocation } from 'react-router-dom'

function Navigation() {
    const location = useLocation()
    return (
        <>
            <nav style={{ backgroundColor: '#0a0a0a' }} className="flex items-center px-10 py-5">
                <div className="flex-1">
                    <span className="logo tracking-widest">AUCTION HOUSE</span>
                </div>
                <div className="flex gap-10">
                    <Link to='/auctions' className={`nav-link ${location.pathname === '/auctions' ? 'active' : ''}`}>Auctions</Link>
                    <Link to='/about' className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                    <Link to='/contact' className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
                </div>
                <div className="flex-1" />
            </nav>
            <div className="gold-line" />
        </>
    )
}

export default Navigation
