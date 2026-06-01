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
  sentAt: string; // always normalized to ISO string by parseSentAt()
  readByAdmin?: boolean;
  edited?: boolean;
}

/**
 * Jackson 3 (Spring Boot 4) serializes LocalDateTime as an array [y,m,d,h,min,s,nano]
 * This normalizes both array and string formats to an ISO string.
 */
export function parseSentAt(raw: any): string {
  if (!raw) return new Date().toISOString();
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    // [year, month(1-based), day, hour, minute, second, nano?]
    const [y, mo, d, h = 0, min = 0, s = 0] = raw as number[];
    return new Date(y, mo - 1, d, h, min, s).toISOString();
  }
  return String(raw);
}

function normalizeMessages(data: any[]): ChatMessage[] {
  return data.map(m => ({ ...m, sentAt: parseSentAt(m.sentAt) }));
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
    this.onMessageReceived = (msg) => onMessage({ ...msg, sentAt: parseSentAt(msg.sentAt) });
    
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

  async adminReply(userId: number, content: string): Promise<ChatMessage> {
    // Always use REST — reliable regardless of WebSocket state
    const response = await api.post(`/chat/admin/reply/${userId}`, { content });
    const msg = { ...response.data, sentAt: parseSentAt(response.data.sentAt) };
    // Also publish via WebSocket if connected (for real-time push to user)
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat.reply',
        body: JSON.stringify({ userId, content }),
      });
    }
    return msg;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  sendCallSignal(payload: Record<string, any>) {
    if (this.client?.connected) {
      const type = payload.type as string;
      const destinations: Record<string, string> = {
        CALL_INCOMING: '/app/call.initiate',
        OFFER:         '/app/call.offer',
        ANSWER:        '/app/call.answer',
        ICE:           '/app/call.ice',
        CALL_ENDED:    '/app/call.end',
      };
      const dest = destinations[type];
      if (dest) {
        this.client.publish({ destination: dest, body: JSON.stringify(payload) });
      }
    }
  }

  subscribeToCallSignal(userId: string, onSignal: (signal: any) => void) {
    if (this.client?.connected) {
      this.client.subscribe(`/topic/user/${userId}/call`, (message) => {
        onSignal(JSON.parse(message.body));
      });
    }
  }

  async sendVoice(blob: Blob): Promise<ChatMessage> {
    const form = new FormData();
    form.append('file', blob, 'voice.webm');
    const response = await api.post('/chat/voice', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return { ...response.data, sentAt: parseSentAt(response.data.sentAt) };
  }

  async editMessage(messageId: number, content: string): Promise<ChatMessage> {
    const response = await api.put(`/chat/message/${messageId}`, { content });
    return { ...response.data, sentAt: parseSentAt(response.data.sentAt) };
  }

  async deleteMessage(messageId: number): Promise<void> {
    await api.delete(`/chat/message/${messageId}`);
  }

  // REST methods — all normalize sentAt dates
  async getHistory(): Promise<ChatMessage[]> {
    const response = await api.get('/chat/history');
    return normalizeMessages(response.data);
  }

  async getAdminInbox(): Promise<ChatInboxItem[]> {
    const response = await api.get('/chat/admin/inbox');
    return response.data;
  }

  async getThread(userId: number): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/admin/thread/${userId}`);
    return normalizeMessages(response.data);
  }
}

export const chatService = new ChatService();
