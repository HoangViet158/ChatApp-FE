import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

import { API_BASE_URL } from "../config/api";
import type { MessageRequest } from "../types/MessageType";

let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;
let messageHandler: ((message: MessageRequest) => void) | null = null;
let activeConversationId: number | null = null;
let connectPromise: Promise<void> | null = null;

const doSubscribe = (conversationId: number) => {
  if (!stompClient?.connected) return;

  subscription?.unsubscribe();
  activeConversationId = conversationId;

  subscription = stompClient.subscribe(
    `/topic/conversation/${conversationId}`,
    (message) => {
      const body = JSON.parse(message.body) as MessageRequest;
      messageHandler?.(body);
    },
  );
};

const ensureConnected = (): Promise<void> => {
  if (stompClient?.connected) {
    return Promise.resolve();
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = new Promise((resolve, reject) => {
    const socket = new SockJS(`${API_BASE_URL}/ws`);

    stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        if (activeConversationId !== null && messageHandler) {
          doSubscribe(activeConversationId);
        }
        resolve();
      },
      onStompError: (frame) => {
        connectPromise = null;
        reject(frame);
      },
      onWebSocketClose: () => {
        connectPromise = null;
      },
    });

    stompClient.activate();
  });

  return connectPromise;
};

export const subscribeToConversation = async (
  conversationId: number,
  onMessageReceived: (message: MessageRequest) => void,
) => {
  messageHandler = onMessageReceived;
  activeConversationId = conversationId;

  await ensureConnected();

  if (stompClient?.connected) {
    doSubscribe(conversationId);
  }
};

export const unsubscribeFromConversation = () => {
  subscription?.unsubscribe();
  subscription = null;
  activeConversationId = null;
  messageHandler = null;
};

export const disconnectWebSocket = () => {
  unsubscribeFromConversation();
  stompClient?.deactivate();
  stompClient = null;
  connectPromise = null;
};

export const sendMessageWebSocket = (payload: MessageRequest) => {
  stompClient?.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};
