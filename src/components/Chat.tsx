import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Info,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";

import { useThemeStore } from "../store/ThemeStore";
import { createMessage, getMessagesByConversationId } from "../services/MessageService";
import type { EnrichedConversation } from "../types/chat";
import type { MessageRequest, MessageResponse } from "../types/MessageType";
import { getAvatarUrl } from "../utils/avatar";
import { formatDateTime, formatMessageTime } from "../utils/format";
import {
  disconnectWebSocket,
  sendMessageWebSocket,
  subscribeToConversation,
  unsubscribeFromConversation,
} from "../websocket/WebSocketService";

type ChatProps = {
  conversationId: number | null;
  currentUserId: number;
  conversation: EnrichedConversation | null;
  onMessageSent?: () => void;
};

const Chat = ({
  conversationId,
  currentUserId,
  conversation,
  onMessageSent,
}: ChatProps) => {
  const { isDark } = useThemeStore();

  const [message, setMessage] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [showInfo, setShowInfo] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
  );
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const displayName = conversation?.displayName ?? "Cuộc trò chuyện";
  const avatarUrl = conversation
    ? (conversation.displayAvatar ??
      getAvatarUrl(displayName, conversation.avatarUrl))
    : getAvatarUrl(displayName);

  const otherMembers = useMemo(
    () =>
      conversation?.members?.filter((m) => m.userId !== currentUserId) ?? [],
    [conversation?.members, currentUserId],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShowInfo(window.matchMedia("(min-width: 1024px)").matches);
  }, [conversationId]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setShowInfo(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    try {
      const res = await getMessagesByConversationId(conversationId);
      console.log(conversationId);
      console.log(res);
      setMessages(res.result ?? []);
    } catch (error) {
      console.error("Failed to load messages", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) {
      unsubscribeFromConversation();
      return;
    }

    const handleIncoming = (body: MessageRequest) => {
      if (body.senderId === currentUserId) return;

      setMessages((prev) => {
        const duplicate = prev.some(
          (m) =>
            m.senderId === body.senderId &&
            m.content === body.content &&
            Date.now() - new Date(m.createdAt).getTime() < 5000,
        );
        if (duplicate) return prev;

        return [
          ...prev,
          {
            id: Date.now(),
            conversationId: body.conversationId,
            senderId: body.senderId,
            content: body.content,
            messageType: body.messageType ?? "TEXT",
            createdAt: new Date().toISOString(),
          },
        ];
      });

      onMessageSent?.();
      window.dispatchEvent(new CustomEvent("chat-list-refresh"));
    };

    subscribeToConversation(conversationId, handleIncoming).catch(console.error);

    return () => unsubscribeFromConversation();
  }, [conversationId, currentUserId, onMessageSent]);

  useEffect(() => () => disconnectWebSocket(), []);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || sending) return;

    const payload: MessageRequest = {
      conversationId,
      senderId: currentUserId,
      content: message.trim(),
      messageType: "TEXT",
    };

    setSending(true);

    try {
      const res = await createMessage(payload);
      if (res.result) {
        setMessages((prev) => [...prev, res.result!]);
      }
      sendMessageWebSocket(payload);
      setMessage("");
      onMessageSent?.();
      window.dispatchEvent(new CustomEvent("chat-list-refresh"));
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!searchMessage.trim()) return messages;
    const q = searchMessage.toLowerCase();
    return messages.filter((msg) => msg.content.toLowerCase().includes(q));
  }, [messages, searchMessage]);

  const highlightText = (text: string) => {
    if (!searchMessage) return text;
    const regex = new RegExp(`(${searchMessage})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchMessage.toLowerCase() ? (
        <mark
          key={index}
          className="bg-amber-300/90 text-gray-900 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  if (!conversationId) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          h-[calc(100vh-80px)] rounded-2xl border
          ${isDark ? "border-gray-700/80 bg-gray-900/50" : "border-gray-200 bg-white"}
        `}
      >
        <div
          className={`
            w-20 h-20 rounded-3xl flex items-center justify-center mb-5
            ${isDark ? "bg-gray-800" : "bg-blue-50"}
          `}
        >
          <MessageCircle
            size={40}
            className={isDark ? "text-blue-400" : "text-blue-600"}
          />
        </div>
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Chọn cuộc trò chuyện
        </h3>
        <p
          className={`text-sm mt-1 max-w-xs text-center ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Chọn từ danh sách bên trái hoặc tạo cuộc trò chuyện mới
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        flex h-[calc(100vh-80px)] rounded-2xl border overflow-hidden shadow-sm
        ${isDark ? "border-gray-700/80 bg-gray-900/40" : "border-gray-200 bg-white"}
      `}
    >
      <div
        className={`flex flex-col min-h-0 transition-all duration-300 ${
          showInfo ? "w-full lg:w-[72%]" : "w-full"
        }`}
      >
        {/* Header */}
        <div
          className={`
            h-[68px] px-4 border-b flex items-center justify-between shrink-0
            ${isDark ? "border-gray-700/80 bg-gray-900/60" : "border-gray-100 bg-white"}
          `}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="min-w-0">
              <h2
                className={`font-semibold truncate ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {displayName}
              </h2>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang kết nối realtime
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            aria-label={showInfo ? "Ẩn thông tin" : "Xem thông tin"}
            aria-expanded={showInfo}
            className={`
              p-2.5 rounded-xl transition shrink-0
              ${
                showInfo
                  ? isDark
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }
            `}
          >
            <Info size={20} />
          </button>
        </div>

        {/* Search in chat */}
        <div
          className={`px-4 py-2 border-b shrink-0 ${
            isDark ? "border-gray-700/60" : "border-gray-100"
          }`}
        >
          <div
            className={`
              flex items-center gap-2 h-10 px-3 rounded-xl border
              ${isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"}
            `}
          >
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              value={searchMessage}
              onChange={(e) => setSearchMessage(e.target.value)}
              placeholder="Tìm trong cuộc trò chuyện..."
              className={`flex-1 bg-transparent outline-none text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            />
            {searchMessage && (
              <button onClick={() => setSearchMessage("")} className="text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 ${
            isDark ? "bg-gray-950/30" : "bg-slate-50/80"
          }`}
        >
          {loadingMessages && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          )}

          {!loadingMessages && filteredMessages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">👋</p>
              <p
                className={`font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Bắt đầu cuộc trò chuyện
              </p>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Gửi tin nhắn đầu tiên tới {displayName}
              </p>
            </div>
          )}

          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const senderLabel = msg.senderName ?? "Thành viên";
            const senderAvatar = getAvatarUrl(senderLabel);

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <img
                    src={senderAvatar}
                    alt={senderLabel}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                  />
                )}

                <div
                  className={`flex flex-col max-w-[75%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && conversation?.type === "GROUP" && (
                    <span
                      className={`text-[11px] mb-1 px-1 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {senderLabel}
                    </span>
                  )}

                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl break-words text-[15px] leading-relaxed shadow-sm
                      ${
                        isMe
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md"
                          : isDark
                            ? "bg-gray-800 text-gray-100 rounded-bl-md"
                            : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                      }
                    `}
                  >
                    {highlightText(msg.content)}
                  </div>

                  <span
                    className={`text-[10px] mt-1 px-1 ${
                      isDark ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className={`
            p-3 border-t flex items-end gap-2 shrink-0
            ${isDark ? "border-gray-700/80 bg-gray-900/80" : "border-gray-100 bg-white"}
          `}
        >
          <div
            className={`
              flex-1 flex items-center gap-2 rounded-2xl border px-4 py-2
              ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}
            `}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={sending}
              className={`flex-1 bg-transparent outline-none text-sm py-1.5 ${
                isDark ? "text-white placeholder:text-gray-500" : "text-gray-900"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition active:scale-95 shrink-0"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile: drawer thông tin */}
      {showInfo && conversation && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Đóng thông tin"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          />
          <div
            className={`
              fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col h-full shadow-2xl
              ${isDark ? "bg-gray-900 border-l border-gray-700" : "bg-white border-l border-gray-200"}
            `}
          >
            <ChatInfoPanel
              conversation={conversation}
              displayName={displayName}
              avatarUrl={avatarUrl}
              currentUserId={currentUserId}
              otherMembers={otherMembers}
              isDark={isDark}
              onClose={() => setShowInfo(false)}
              showClose
            />
          </div>
        </div>
      )}

      {/* Desktop: cột thông tin bên phải */}
      {showInfo && conversation && (
        <div
          className={`
            hidden lg:flex flex-col w-[min(320px,28%)] shrink-0 border-l min-h-0
            ${isDark ? "border-gray-700/80 bg-gray-900/60" : "border-gray-100 bg-white"}
          `}
        >
          <ChatInfoPanel
            conversation={conversation}
            displayName={displayName}
            avatarUrl={avatarUrl}
            currentUserId={currentUserId}
            otherMembers={otherMembers}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
};

type ChatInfoPanelProps = {
  conversation: EnrichedConversation;
  displayName: string;
  avatarUrl: string;
  currentUserId: number;
  otherMembers: EnrichedConversation["members"];
  isDark: boolean;
  onClose?: () => void;
  showClose?: boolean;
};

function ChatInfoPanel({
  conversation,
  displayName,
  avatarUrl,
  currentUserId,
  otherMembers,
  isDark,
  onClose,
  showClose,
}: ChatInfoPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className={`p-5 text-center border-b shrink-0 relative ${
          isDark ? "border-gray-700/50" : "border-gray-100"
        }`}
      >
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className={`
              absolute top-4 right-4 p-2 rounded-xl transition
              ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}
            `}
          >
            <X size={20} />
          </button>
        )}
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/20"
        />
        <h2
          className={`mt-4 text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {displayName}
        </h2>
        <p
          className={`text-sm mt-1 capitalize ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {conversation.type === "PRIVATE" ? "Chat riêng" : "Nhóm chat"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {conversation.createdAt && (
          <InfoRow
            label="Ngày tạo"
            value={formatDateTime(conversation.createdAt)}
            isDark={isDark}
          />
        )}

        {conversation.createdByUsername && (
          <InfoRow
            label="Tạo bởi"
            value={conversation.createdByUsername}
            isDark={isDark}
          />
        )}

        <div
          className={`rounded-2xl p-4 ${
            isDark ? "bg-gray-800/60" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-2 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Users size={14} />
            Thành viên ({conversation.members.length})
          </p>
          <div className="space-y-2">
            {conversation.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2.5">
                <img
                  src={getAvatarUrl(member.username ?? "User")}
                  alt={member.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="min-w-0 text-left">
                  <p
                    className={`text-sm font-medium truncate ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {member.username}
                    {member.userId === currentUserId && (
                      <span className="text-blue-500 ml-1">(bạn)</span>
                    )}
                  </p>
                  {member.role && (
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {member.role}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {otherMembers.length > 0 && conversation.type === "PRIVATE" && (
          <InfoRow
            label="Đối tác chat"
            value={otherMembers.map((m) => m.username).join(", ")}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        isDark ? "bg-gray-800/60" : "bg-gray-50"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-medium mt-1 text-sm ${
          isDark ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Chat;
