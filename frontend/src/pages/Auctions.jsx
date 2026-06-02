import { useState, useEffect } from 'react'
import '../styles/auctions.css'
import BidModal from '../components/BidModal'
import { useWebSocket } from '../hooks/useWebSocket'

function Auctions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8080/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load auctions')
        setLoading(false)
      })
  }, [])

  function handleWsMessage(data) {
    if (data.type === 'bid_placed') {
      setItems(prev => prev.map(item =>
        item.id === data.item.id ? data.item : item
      ))
      setSelectedItem(prev => {
        if (prev && prev.item.id === data.item.id) {
          return { ...prev, item: data.item }
        }
        return prev
      })
    }
    if (data.type === 'reset') {
      setSelectedItem(null)
      fetch('http://localhost:8080/api/items')
        .then(res => res.json())
        .then(fresh => setItems(fresh))
    }
  }

  useWebSocket('ws://localhost:8080/ws', handleWsMessage)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="loading-text">Preparing catalogue...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="auction-page">
      <div className="catalogue-header">
        <h1 className="catalogue-title">Current Lots</h1>
        <p className="catalogue-subtitle">Live auction — {items.length} lots available</p>
      </div>

      <div className="lots-grid">
        {items.map((item, index) => (
          <div key={item.id} className="lot-card" onClick={() => setSelectedItem({ item, index })}>
            <div className="lot-image-wrapper">
              <img
                src={`http://localhost:8080${item.image}`}
                alt={item.title}
                className="lot-image"
              />
              <div className="lot-number-badge">Lot {String(index + 1).padStart(3, '0')}</div>
              <div className="lot-overlay">
                <p className="lot-description">{item.description}</p>
              </div>
            </div>

            <div className="lot-details">
              <h2 className="lot-title">{item.title}</h2>
              <p className="lot-location">{item.location}</p>
              <div className="lot-pricing">
                <div className="price-block">
                  <p className="price-label">Reserve</p>
                  <p className="price-value">£{(item.reserve / 100).toLocaleString()}</p>
                </div>
                <div className="price-block" style={{textAlign: 'right'}}>
                  <p className="price-label">Current Bid</p>
                  {item.currentBid > 0
                    ? <p className="price-value current">£{(item.currentBid / 100).toLocaleString()}</p>
                    : <p className="no-bids">No bids yet</p>
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <BidModal
          item={selectedItem.item}
          lotNumber={selectedItem.index + 1}
          onClose={() => setSelectedItem(null)}
          onBidPlaced={(updatedItem) => {
            setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
            setSelectedItem(null)
          }}
        />
      )}
    </div>
  )
}

export default Auctions
