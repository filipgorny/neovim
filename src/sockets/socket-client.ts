import io from 'socket.io-client'
import env from '../../utils/env'
import jwt from 'jsonwebtoken'
import logger from '../../services/logger/logger'

export let socket

export const registerSocketClient = (): void => {
  socket = io(`${env('SOCKET_IO_SERVER_URL')}:${env('SOCKET_IO_PORT')}`, {
    auth: {
      token: jwt.sign({ server_id: process.env.NODE_APP_INSTANCE || 'cron' }, env('SOCKET_IO_API_CLIENT_AUTH_KEY')),
    },
  })

  socket.on('connect_error', (error) => {
    logger.error('socket.io: connect error', error)
  })

  socket.on('error', (error) => {
    logger.error('socket.io: error', error)
  })

  socket.on('connect', () => {
    logger.info('socket.io: connected')
  })

  socket.on('disconnect', () => {
    logger.info('socket.io: disconnected')
  })
}
