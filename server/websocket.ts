import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { db, RoomMessage, DirectMessage, NotificationItem } from './db';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  subscribedRooms: Set<string>;
  subscribedConversations: Set<string>;
  isAlive: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<AuthenticatedSocket> = new Set();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const client = ws as AuthenticatedSocket;
      client.subscribedRooms = new Set();
      client.subscribedConversations = new Set();
      client.isAlive = true;
      this.clients.add(client);

      client.on('pong', () => {
        client.isAlive = true;
      });

      client.on('message', (rawData: string) => {
        try {
          const data = JSON.parse(rawData.toString());
          this.handleClientMessage(client, data);
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      });

      client.on('close', () => {
        this.clients.delete(client);
      });

      client.on('error', (err) => {
        console.error('WebSocket client error:', err);
      });

      // Send initial welcome message
      client.send(
        JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString(),
        })
      );
    });

    // Heartbeat ping interval to keep connections alive through proxies
    setInterval(() => {
      for (const client of this.clients) {
        if (!client.isAlive) {
          client.terminate();
          this.clients.delete(client);
          continue;
        }
        client.isAlive = false;
        client.ping();
      }
    }, 30000);
  }

  private handleClientMessage(client: AuthenticatedSocket, data: any) {
    switch (data.type) {
      case 'auth': {
        if (data.token) {
          const rawDb = db.getRawData();
          const session = rawDb.sessions.find(
            (s) => s.token === data.token && new Date(s.expiresAt) > new Date()
          );
          if (session) {
            client.userId = session.userId;
            client.send(
              JSON.stringify({
                type: 'auth_success',
                userId: session.userId,
              })
            );
          } else {
            // Also accept direct userId in development if passed
            if (data.userId) {
              client.userId = data.userId;
              client.send(
                JSON.stringify({
                  type: 'auth_success',
                  userId: data.userId,
                })
              );
            }
          }
        }
        break;
      }

      case 'join_room': {
        if (data.roomId) {
          client.subscribedRooms.add(data.roomId);
          client.send(JSON.stringify({ type: 'joined_room', roomId: data.roomId }));
        }
        break;
      }

      case 'leave_room': {
        if (data.roomId) {
          client.subscribedRooms.delete(data.roomId);
        }
        break;
      }

      case 'join_conversation': {
        if (data.conversationId) {
          client.subscribedConversations.add(data.conversationId);
          client.send(
            JSON.stringify({ type: 'joined_conversation', conversationId: data.conversationId })
          );
        }
        break;
      }

      case 'leave_conversation': {
        if (data.conversationId) {
          client.subscribedConversations.delete(data.conversationId);
        }
        break;
      }

      case 'typing': {
        if (data.conversationId && client.userId) {
          this.broadcastToConversation(
            data.conversationId,
            {
              type: 'typing',
              conversationId: data.conversationId,
              userId: client.userId,
              isTyping: data.isTyping,
            },
            client
          );
        }
        break;
      }

      default:
        break;
    }
  }

  public broadcastToRoom(roomId: string, message: RoomMessage) {
    const payload = JSON.stringify({
      type: 'new_room_message',
      roomId,
      message,
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN && client.subscribedRooms.has(roomId)) {
        client.send(payload);
      }
    }
  }

  public broadcastToConversation(
    conversationId: string,
    payloadData: any,
    excludeClient?: AuthenticatedSocket
  ) {
    const payload = JSON.stringify(payloadData);
    for (const client of this.clients) {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        if (client.subscribedConversations.has(conversationId)) {
          client.send(payload);
        }
      }
    }
  }

  public sendToUser(userId: string, payloadData: any) {
    const payload = JSON.stringify(payloadData);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(payload);
      }
    }
  }

  public broadcastNotification(notification: NotificationItem) {
    this.sendToUser(notification.userId, {
      type: 'notification',
      notification,
    });
  }

  public getStats() {
    return {
      connectedClients: this.clients.size,
      authenticatedUsers: Array.from(this.clients).filter((c) => !!c.userId).length,
    };
  }
}

export const wsManager = new WebSocketManager();
