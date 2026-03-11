import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function createSocket() {
  return io(SOCKET_URL, { autoConnect: true });
}
