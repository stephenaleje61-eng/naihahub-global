import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { RoomMessage, DirectMessage, NotificationItem } from '../types';

type MessageHandler = (data: any) => void;

interface WebSocketContextType {
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  subscribe: (event: string, handler: MessageHandler) => () => void;
  latestNotification: NotificationItem | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

  const subscribe = useCallback((event: string, handler: MessageHandler) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(handler);

    return () => {
      listenersRef.current.get(event)?.delete(handler);
    };
  }, []);

  const dispatchEvent = useCallback((event: string, data: any) => {
    const handlers = listenersRef.current.get(event);
    if (handlers) {
      for (const h of handlers) {
        h(data);
      }
    }
  }, []);

  const activeRoomsRef = useRef<Set<string>>(new Set());
  const activeConversationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let reconnectTimeout: any = null;
    let isComponentMounted = true;

    function connect() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isComponentMounted) return;
          setIsConnected(true);
          // Authenticate socket
          if (token || user?.id) {
            ws.send(JSON.stringify({ type: 'auth', token, userId: user?.id }));
          }
          // Automatically subscribe to any active rooms
          for (const roomId of activeRoomsRef.current) {
            ws.send(JSON.stringify({ type: 'join_room', roomId }));
          }
          // Automatically subscribe to active conversations
          for (const convId of activeConversationsRef.current) {
            ws.send(JSON.stringify({ type: 'join_conversation', conversationId: convId }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              setLatestNotification(data.notification);
              dispatchEvent('notification', data.notification);
            } else if (data.type === 'new_room_message') {
              dispatchEvent(`room_${data.roomId}`, data.message as RoomMessage);
              dispatchEvent('room_message', data);
            } else if (data.type === 'new_direct_message') {
              dispatchEvent(`conv_${data.message.conversationId}`, data.message as DirectMessage);
              dispatchEvent('direct_message', data.message);
            } else if (data.type === 'typing') {
              dispatchEvent(`typing_${data.conversationId}`, data);
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          if (!isComponentMounted) return;
          setIsConnected(false);
          // Auto reconnect after 2 seconds
          reconnectTimeout = setTimeout(connect, 2000);
        };

        ws.onerror = (err) => {
          console.warn('WebSocket connection error, retrying...');
          ws.close();
        };
      } catch (e) {
        console.error('Failed to instantiate WebSocket:', e);
        reconnectTimeout = setTimeout(connect, 2000);
      }
    }

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token, user?.id, dispatchEvent]);

  const joinRoom = useCallback((roomId: string) => {
    activeRoomsRef.current.add(roomId);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'join_room', roomId }));
    }
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    activeRoomsRef.current.delete(roomId);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave_room', roomId }));
    }
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    activeConversationsRef.current.add(conversationId);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'join_conversation', conversationId }));
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    activeConversationsRef.current.delete(conversationId);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'leave_conversation', conversationId }));
    }
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'typing', conversationId, isTyping }));
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        joinRoom,
        leaveRoom,
        joinConversation,
        leaveConversation,
        sendTyping,
        subscribe,
        latestNotification,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
}
