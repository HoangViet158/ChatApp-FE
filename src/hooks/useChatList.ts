import { useCallback, useEffect, useState } from "react";

import { getConversationsByUserId } from "../services/ConversationService";
import { getMembersByConversationId } from "../services/ConversationMemberService";
import { getAllMessages } from "../services/MessageService";
import type { EnrichedConversation } from "../types/chat";
import type { MessageResponse } from "../types/MessageType";
import { getAvatarUrl } from "../utils/avatar";
import { parseApiDate } from "../utils/parseApiDate";

export type ChatListItem = {
  kind: "private" | "group";
  conversationId: number;
  otherUserId?: number;
  displayName: string;
  displayAvatar: string;
  lastMessage?: MessageResponse;
  lastActivityAt: number;
  membersCount?: number;
};

function buildLastMessageMap(
  messages: MessageResponse[],
  conversationIds: Set<number>,
) {
  const map = new Map<number, MessageResponse>();

  for (const message of messages) {
    if (!conversationIds.has(message.conversationId)) continue;

    const current = map.get(message.conversationId);
    const messageTime = parseApiDate(message.createdAt);
    const currentTime = current ? parseApiDate(current.createdAt) : 0;

    if (!current || messageTime > currentTime) {
      map.set(message.conversationId, message);
    }
  }

  return map;
}

function getActivityTime(
  lastMessage?: MessageResponse,
  fallback?: string,
): number {
  const fromMessage = lastMessage?.createdAt
    ? parseApiDate(lastMessage.createdAt)
    : 0;
  if (fromMessage > 0) return fromMessage;

  return fallback ? parseApiDate(fallback) : 0;
}

function buildChatList(
  currentUserId: number,
  conversations: EnrichedConversation[],
): ChatListItem[] {
  console.log("conversations", conversations);
  return conversations
    .map((conv) => {
      const otherMember = conv.members.find((m) => m.userId !== currentUserId);

      if (conv.type === "GROUP") {
        return {
          kind: "group" as const,
          conversationId: conv.id,
          displayName: conv.displayName,
          displayAvatar: conv.displayAvatar,
          lastMessage: conv.lastMessage,
          lastActivityAt: getActivityTime(conv.lastMessage, conv.createdAt),
          membersCount: conv.members.length,
        };
      }

      return {
        kind: "private" as const,
        conversationId: conv.id,
        otherUserId: otherMember?.userId,
        displayName: conv.displayName,
        displayAvatar: conv.displayAvatar,
        lastMessage: conv.lastMessage,
        lastActivityAt: getActivityTime(conv.lastMessage, conv.createdAt),
      };
    })
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

export function useChatList(currentUserId: number, enabled: boolean) {
  const [chatItems, setChatItems] = useState<ChatListItem[]>([]);
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !currentUserId) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const [convSettled, msgSettled] = await Promise.allSettled([
        getConversationsByUserId(currentUserId),
        getAllMessages(),
      ]);

      const errors: string[] = [];

      const list =
        convSettled.status === "fulfilled"
          ? (convSettled.value.result ?? [])
          : (errors.push("conversations"), []);

      const allMessages =
        msgSettled.status === "fulfilled"
          ? (msgSettled.value.result ?? [])
          : (errors.push("messages"), []);

      if (errors.length === 2) {
        throw new Error("Không tải được dữ liệu từ server");
      }

      if (errors.length > 0) {
        setError(
          `Một số dữ liệu tải lỗi (${errors.join(", ")}). Đang hiển thị phần còn lại.`,
        );
      }

      const conversationIds = new Set(list.map((c) => c.id));
      const lastByConversation = buildLastMessageMap(
        allMessages,
        conversationIds,
      );

      const enriched: EnrichedConversation[] = await Promise.all(
        list.map(async (conv) => {
          let members: EnrichedConversation["members"] = [];

          try {
            const membersRes = await getMembersByConversationId(conv.id);
            members = membersRes.result ?? [];
          } catch {
            // giữ conversation, chỉ thiếu members
          }

          let displayName = conv.name;
          const otherMember = members.find((m) => m.userId !== currentUserId);

          if (conv.type === "PRIVATE" && otherMember?.username) {
            displayName = otherMember.username;
          }

          return {
            ...conv,
            members,
            lastMessage: lastByConversation.get(conv.id),
            displayName,
            displayAvatar: getAvatarUrl(displayName, conv.avatarUrl),
          };
        }),
      );

      setConversations(enriched);

      const items = buildChatList(currentUserId, enriched);
      setChatItems(items);
      return items;
    } catch (err) {
      console.error("Failed to load chat list", err);
      setError("Không tải được dữ liệu. Kiểm tra đăng nhập và backend.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUserId, enabled]);

  useEffect(() => {
    if (enabled && currentUserId) {
      refresh();
    }
  }, [enabled, currentUserId, refresh]);

  useEffect(() => {
    const onRefresh = () => refresh();
    window.addEventListener("chat-list-refresh", onRefresh);
    return () => window.removeEventListener("chat-list-refresh", onRefresh);
  }, [refresh]);

  const getConversationById = useCallback(
    (id: number | null) =>
      id == null ? null : conversations.find((c) => c.id === id) ?? null,
    [conversations],
  );

  return {
    chatItems,
    conversations,
    loading,
    error,
    refresh,
    getConversationById,
  };
}
