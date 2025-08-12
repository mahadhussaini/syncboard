import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost:3001', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function useSocket(): Socket | null {
  const { accessToken } = useAuthStore();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (accessToken) {
      const newSocket = connectSocket(accessToken);
      setSocketInstance(newSocket);

      return () => {
        disconnectSocket();
        setSocketInstance(null);
      };
    } else {
      disconnectSocket();
      setSocketInstance(null);
    }
  }, [accessToken]);

  return socketInstance;
}