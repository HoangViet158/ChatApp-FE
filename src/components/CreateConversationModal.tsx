import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MessageSquarePlus, Users, X } from "lucide-react";

import { createConversation } from "../services/ConversationService";
import { addMembers } from "../services/ConversationMemberService";
import { getAllUsers } from "../services/UserService";
import { useThemeStore } from "../store/ThemeStore";
import type { UserResponse } from "../types/UserType";
import { getAvatarUrl } from "../utils/avatar";

type Props = {
  open: boolean;
  onClose: () => void;
  currentUserId: number;
  currentUsername: string;
  onCreated: () => void;
};

const CreateConversationModal = ({
  open,
  onClose,
  currentUserId,
  currentUsername,
  onCreated,
}: Props) => {
  const { isDark } = useThemeStore();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"PRIVATE" | "GROUP">("PRIVATE");
  const [name, setName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) return;

    setLoadingUsers(true);
    getAllUsers()
      .then((res) => {
        setUsers((res.result ?? []).filter((u) => u.id !== currentUserId));
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [open, currentUserId]);

  useEffect(() => {
    if (!open) {
      setType("PRIVATE");
      setName("");
      setSelectedUserIds([]);
    }
  }, [open]);

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) => {
      if (type === "PRIVATE") {
        return prev.includes(id) ? [] : [id];
      }
      return prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
    });
  };

  const handleCreate = async () => {
    if (type === "PRIVATE" && selectedUserIds.length !== 1) {
      alert("Chọn 1 người để chat riêng");
      return;
    }

    if (type === "GROUP" && !name.trim()) {
      alert("Nhập tên nhóm");
      return;
    }

    if (type === "GROUP" && selectedUserIds.length === 0) {
      alert("Chọn ít nhất 1 thành viên");
      return;
    }

    const otherUser = users.find((u) => u.id === selectedUserIds[0]);
    const conversationName =
      type === "PRIVATE"
        ? `${currentUsername} & ${otherUser?.username ?? "User"}`
        : name.trim();

    setSubmitting(true);

    try {
      const res = await createConversation({
        name: conversationName,
        type,
        createdBy: currentUserId,
      });

      const conversationId = res.result?.id;
      if (!conversationId) throw new Error("Không tạo được hội thoại");

      await addMembers(conversationId, currentUserId, [
        currentUserId,
        ...selectedUserIds,
      ]);

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Tạo hội thoại thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`
          relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden
          ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}
        `}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquarePlus className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Cuộc trò chuyện mới</h2>
                <p className="text-sm text-blue-100">Chọn loại và thành viên</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
            {(["PRIVATE", "GROUP"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setType(item);
                  setSelectedUserIds([]);
                }}
                className={`
                  flex-1 py-2.5 rounded-xl text-sm font-medium transition
                  ${
                    type === item
                      ? "bg-blue-600 text-white shadow"
                      : isDark
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                {item === "PRIVATE" ? "Chat riêng" : "Nhóm"}
              </button>
            ))}
          </div>

          {type === "GROUP" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên nhóm..."
              className={`
                w-full h-12 px-4 rounded-2xl border outline-none
                focus:border-blue-500 transition
                ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}
              `}
            />
          )}

          <div>
            <p
              className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <Users size={16} />
              {type === "PRIVATE" ? "Chọn người chat" : "Thêm thành viên"}
            </p>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const selected = selectedUserIds.includes(user.id);
                  const label = user.fullName || user.username;

                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-2xl border transition
                        ${
                          selected
                            ? "border-blue-500 bg-blue-500/10"
                            : isDark
                              ? "border-gray-700 hover:bg-gray-800"
                              : "border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      <img
                        src={getAvatarUrl(label, user.avatarUrl)}
                        alt={label}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold truncate">{label}</p>
                        <p
                          className={`text-sm truncate ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          @{user.username}
                        </p>
                      </div>
                      {user.isOnline && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={`px-6 py-4 border-t flex justify-end gap-3 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium ${
              isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 flex items-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Tạo
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreateConversationModal;
