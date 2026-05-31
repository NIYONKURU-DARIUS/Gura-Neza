import { Client } from '@stomp/stompjs';
import api from './api';

// SockJS is a CommonJS module; use dynamic import to avoid Vite ESM crash
const getSockJS = () => import('sockjs-client').then(m => m.default || m);

export interface ChatMessage {
  id?: number;
  userId?: number;
  userName?: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  sentAt: string;
  readByAdmin?: boolean;
}

export interface ChatInboxItem {
  userId: number;
  userName: string;
  userEmail?: string;
  lastMessage: string;
  unreadCount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// Extract base URL for WebSocket (removing /api)
const WS_URL = API_BASE_URL.replace('/api', '/ws');

class ChatService {
  private client: Client | null = null;
  private onMessageReceived: ((msg: ChatMessage) => void) | null = null;

  async connect(token: string, onMessage: (msg: ChatMessage) => void) {
    this.onMessageReceived = onMessage;
    
    try {
      const SockJSCtor = await getSockJS() as any;
      this.client = new Client({
        webSocketFactory: () => new SockJSCtor(WS_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          console.log('Connected to WebSocket');
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame.headers['message']);
        },
      });

      this.client.activate();
    } catch (err) {
      console.warn('WebSocket connection failed — chat will work in REST-only mode', err);
    }
  }

  subscribeToUser(userId: string) {
    if (this.client?.connected) {
      this.client.subscribe(`/topic/user/${userId}`, (message) => {
        if (this.onMessageReceived) {
          this.onMessageReceived(JSON.parse(message.body));
        }
      });
    }
  }

  subscribeToWallet(userId: string, onUpdate: (balance: number) => void) {
    if (this.client?.connected) {
      this.client.subscribe(`/topic/user/${userId}/wallet`, (message) => {
        onUpdate(JSON.parse(message.body));
      });
    }
  }

  subscribeToThread(userId: string) {
      if (this.client?.connected) {
        this.client.subscribe(`/topic/admin/thread/${userId}`, (message) => {
          if (this.onMessageReceived) {
            this.onMessageReceived(JSON.parse(message.body));
          }
        });
      }
  }

  subscribeToInbox(onInboxUpdate: () => void) {
      if (this.client?.connected) {
        this.client.subscribe(`/topic/admin/inbox`, () => {
           onInboxUpdate();
        });
      }
  }

  sendMessage(content: string) {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ content }),
      });
    }
  }

  adminReply(userId: number, content: string) {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat.reply',
        body: JSON.stringify({ userId, content }),
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  // REST Fallbacks
  async getHistory(): Promise<ChatMessage[]> {
    const response = await api.get('/chat/history');
    return response.data;
  }

  async getAdminInbox(): Promise<ChatInboxItem[]> {
    const response = await api.get('/chat/admin/inbox');
    return response.data;
  }

  async getThread(userId: number): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/admin/thread/${userId}`);
    return response.data;
  }
}

export const chatService = new ChatService();
