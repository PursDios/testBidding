import { useState, useEffect } from 'react'
import '../styles/modal.css'

function BidModal({ item, lotNumber, onClose, onBidPlaced }) {
  const [bidAmount, setBidAmount] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [liveItem, setLiveItem] = useState(item)

  useEffect(() => { setLiveItem(item) }, [item])

  const minimumBid = liveItem.currentBid > 0
    ? (liveItem.currentBid / 100) + 1
    : (liveItem.reserve / 100)

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const amount = parseFloat(bidAmount)
    if (!bidAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount')
      return
    }
    if (amount < minimumBid) {
      setError(`Minimum bid is £${minimumBid.toLocaleString()}`)
      return
    }

    setSubmitting(true)
    fetch(`${import.meta.env.VITE_API_URL}/api/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, amount: Math.round(amount * 100) }),
    })
      .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t) })
        return res.json()
      })
      .then(updatedItem => {
        setLiveItem(updatedItem)
        setBidAmount('')
        onBidPlaced(updatedItem)
      })
      .catch(err => setError(err.message))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-panel">
        <div className="modal-image-side">
          <img
            src={`${import.meta.env.VITE_API_URL}${liveItem.image}`}
            alt={liveItem.title}
            className="modal-image"
          />
          <div className="modal-image-gradient" />
          <span className="modal-lot-badge">Lot {String(lotNumber).padStart(3, '0')}</span>
        </div>

        <div className="modal-bid-side">
          <button className="modal-close" onClick={onClose}>✕</button>

          <div>
            <h2 className="modal-car-title">{liveItem.title}</h2>
            <p className="modal-location">{liveItem.location}</p>
            <p className="modal-description">{liveItem.description}</p>

            <div className="modal-pricing-row">
              <div className="modal-price-block">
                <p className="modal-price-label">Current Bid</p>
                {liveItem.currentBid > 0
                  ? <p className="modal-price-value live">£{(liveItem.currentBid / 100).toLocaleString()}</p>
                  : <p className="modal-no-bids">No bids placed</p>
                }
              </div>
              <div className="modal-price-block">
                <p className="modal-price-label">Reserve</p>
                <p className="modal-price-value">£{(liveItem.reserve / 100).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <form className="modal-bid-form" onSubmit={handleSubmit}>
            <p className="modal-bid-label">Your Bid — minimum £{minimumBid.toLocaleString()}</p>
            <div className="modal-bid-input-row">
              <span className="modal-bid-prefix">£</span>
              <input
                type="text"
                inputMode="numeric"
                className="modal-bid-input"
                placeholder={minimumBid.toLocaleString()}
                value={bidAmount ? Number(bidAmount.replace(/,/g, '')).toLocaleString() : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, '')
                  if (raw === '' || /^\d+$/.test(raw)) setBidAmount(raw)
                }}
              />
            </div>
            {error && <p className="modal-error">{error}</p>}
            <button
              type="submit"
              className="modal-bid-button"
              disabled={submitting}
            >
              {submitting ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BidModal
