/**
 * postMessage 通信管理器
 * 用于主窗口和离屏窗口之间的跨窗口通信
 */

// 消息类型
export type MessageType = "init" | "update" | "setValue" | "close" | "ping" | "pong";

// 消息格式
export interface Message {
  type: MessageType;
  data?: any;
  timestamp?: number;
}

// 回调函数类型
type MessageCallback = (message: Message) => void;

export class ChannelManager {
  private targetWindow: Window | null = null;
  private origin: string = "*";
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private callbacks: Map<string, MessageCallback[]> = new Map();

  /**
   * 设置目标窗口（主窗口调用）
   */
  setTargetWindow(window: Window | null): void {
    this.targetWindow = window;
  }

  /**
   * 设置来源Origin（用于安全验证）
   */
  setOrigin(origin: string): void {
    this.origin = origin;
  }

  /**
   * 发送消息
   */
  postMessage(type: MessageType, data?: any): void {
    if (!this.targetWindow || this.targetWindow.closed) {
      console.warn("[ChannelManager] 目标窗口已关闭或不存在");
      return;
    }

    const message: Message = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.targetWindow.postMessage(message, this.origin);
  }

  /**
   * 监听消息
   */
  onMessage(type: MessageType, callback: MessageCallback): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);

    // 如果还没有设置全局监听，则设置
    if (!this.messageHandler) {
      this.messageHandler = (event: MessageEvent) => {
        const message = event.data as Message;
        if (!message || !message.type) return;

        // 验证来源（如果设置了具体的 origin）
        if (this.origin !== "*" && event.origin !== this.origin) {
          console.warn(`[ChannelManager] 忽略来自 ${event.origin} 的消息`);
          return;
        }

        const callbacks = this.callbacks.get(message.type);
        if (callbacks) {
          callbacks.forEach((cb) => cb(message));
        }
      };
      window.addEventListener("message", this.messageHandler);
    }

    // 返回取消监听函数
    return () => {
      const callbacks = this.callbacks.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    if (this.messageHandler) {
      window.removeEventListener("message", this.messageHandler);
      this.messageHandler = null;
    }
    this.callbacks.clear();
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.postMessage("close");
    this.removeAllListeners();
    this.targetWindow = null;
  }
}

// 导出单例（用于同屏模式，无需通信）
export const nullChannel = {
  postMessage: () => {},
  onMessage: () => () => {},
  close: () => {},
  setTargetWindow: () => {},
};
