import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('⚡ Admin connected to Socket.IO Server:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Admin Socket.IO connection error:', err.message)
    })
  }
  return socket
}

export const joinTicketRoom = (ticketId) => {
  const s = getSocket()
  if (s && ticketId) {
    s.emit('join_ticket', ticketId)
  }
}

export const leaveTicketRoom = (ticketId) => {
  const s = getSocket()
  if (s && ticketId) {
    s.emit('leave_ticket', ticketId)
  }
}
