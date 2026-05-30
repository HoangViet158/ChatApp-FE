import { useCallback, useState } from "react";

import { getAllConversations } from "../services/ConversationService";
import { getMembersByConversationId } from "../services/ConversationMemberService";
import { getAllMessages } from "../services/MessageService";
import type { EnrichedConversation } from "../types/chat";
import type { MessageResponse } from "../types/MessageType";
import { getAvatarUrl } from "../utils/avatar";

function buildLastMessageMap(messages: MessageResponse[]) {
  const map = new Map<number, MessageResponse>();

  for (const message of messages) {
    const current = map.get(message.conversationId);
    if (
      !current ||
      new Date(message.createdAt).getTime() >
        new Date(current.createdAt).getTime()
    ) {
      map.set(message.conversationId, message);
    }
  }

  return map;
}

export function useConversations(currentUserId: number) {
  const [conversations, setConversations] = useState<EnrichedConversation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const [convRes, msgRes] = await Promise.all([
        getAllConversations(),
        getAllMessages(),
      ]);

      const list = convRes.result ?? [];
      const lastByConversation = buildLastMessageMap(msgRes.result ?? []);

      const enriched = await Promise.all(
        list.map(async (conv) => {
          const membersRes = await getMembersByConversationId(conv.id);
          const members = membersRes.result ?? [];

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

      enriched.sort((a, b) => {
        const timeA = new Date(
          a.lastMessage?.createdAt ?? a.createdAt,
        ).getTime();
        const timeB = new Date(
          b.lastMessage?.createdAt ?? b.createdAt,
        ).getTime();
        return timeB - timeA;
      });

      setConversations(enriched);
      return enriched;
    } catch (error) {
      console.error("Failed to load conversations", error);
      setConversations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  return { conversations, loading, refresh, setConversations };
}
