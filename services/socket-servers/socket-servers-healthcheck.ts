import { socket } from '../../src/sockets/socket-client'

export default (): boolean => {
  return socket.connected
}
