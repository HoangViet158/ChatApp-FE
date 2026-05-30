import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Chat from "../components/Chat";
import CreateConversationModal from "../components/CreateConversationModal";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useChatList } from "../hooks/useChatList";
import type { ChatListItem } from "../hooks/useChatList";
import type { EnrichedConversation } from "../types/chat";

const ChatWindow = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isReady } = useAuth();
  const currentUserId = user?.id ?? 0;

  const {
    chatItems,
    loading,
    error,
    refresh,
    getConversationById,
  } = useChatList(currentUserId, isAuthenticated);

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [activeConversation, setActiveConversation] =
    useState<EnrichedConversation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const refreshSidebarTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const softRefreshSidebar = useCallback(() => {
    if (refreshSidebarTimeout.current) {
      clearTimeout(refreshSidebarTimeout.current);
    }
    refreshSidebarTimeout.current = setTimeout(() => {
      refresh();
    }, 400);
  }, [refresh]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isReady, isAuthenticated, navigate]);

  useEffect(() => {
    if (chatItems.length === 0) return;

    setSelectedConversationId((prev) => {
      if (prev && chatItems.some((i) => i.conversationId === prev)) {
        return prev;
      }
      const first = chatItems[0];
      return first?.conversationId ?? null;
    });
  }, [chatItems]);

  useEffect(() => {
    const fromList = getConversationById(selectedConversationId);
    if (fromList) {
      setActiveConversation(fromList);
    }
  }, [selectedConversationId, getConversationById]);

  const openOrCreateChat = useCallback(
    (item: ChatListItem) => {
      setSelectedConversationId(item.conversationId);
      const conv = getConversationById(item.conversationId);
      if (conv) setActiveConversation(conv);
    },
    [getConversationById],
  );

  const handleCreated = async () => {
    const list = await refresh();
    const first = list[0];
    if (first?.conversationId) {
      setSelectedConversationId(first.conversationId);
    }
  };

  if (!isReady || !user) {
    return null;
  }

  const conversationForChat =
    getConversationById(selectedConversationId) ?? activeConversation;

  return (
    <>
      <div className="flex flex-col md:flex-row h-full gap-0 md:gap-3 p-0 md:p-3 min-h-0">
        <div className="md:w-[340px] shrink-0 h-full min-h-0">
          <Sidebar
            chatItems={chatItems}
            loading={loading}
            error={error}
            selectedConversationId={selectedConversationId}
            onSelectChat={openOrCreateChat}
            onCreateClick={() => setShowCreateModal(true)}
            currentUserId={user.id}
            onRetry={refresh}
          />
        </div>

        <div className="flex-1 min-h-0 min-w-0">
          <Chat
            conversation={conversationForChat}
            conversationId={selectedConversationId}
            currentUserId={user.id}
            onMessageSent={softRefreshSidebar}
          />
        </div>
      </div>

      <CreateConversationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUserId={user.id}
        currentUsername={user.username}
        onCreated={handleCreated}
      />
    </>
  );
};

export default ChatWindow;
