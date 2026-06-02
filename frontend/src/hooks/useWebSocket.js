import { useEffect, useRef } from 'react'

export function useWebSocket(url, onMessage) {
  const ws = useRef(null)
  const reconnectTimer = useRef(null)
  const onMessageRef = useRef(onMessage)

  onMessageRef.current = onMessage

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url)

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessageRef.current(data)
        } catch {
          // ignore malformed messages
        }
      }

      ws.current.onclose = () => {
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.current.onerror = () => {
        ws.current.close()
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [url])

  return ws
}
