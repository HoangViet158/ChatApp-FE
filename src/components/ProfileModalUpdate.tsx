import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, X } from "lucide-react";

import { getAvatarUrl } from "../utils/avatar";

export type ProfileForm = {
  fullName: string;
  username: string;
  email: string;
  bio: string;
  password: string;
};

export type ProfileSaveData = {
  form: ProfileForm;
  avatarFile: File | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  user: ProfileForm;
  /** URL avatar hiện tại từ server — chỉ để preview, không có trong form */
  currentAvatarUrl?: string;
  onSave: (data: ProfileSaveData) => void;
  isDark?: boolean;
}

const ProfileModalUpdate = ({
  open,
  onClose,
  user,
  currentAvatarUrl,
  onSave,
  isDark = false,
}: Props) => {
  const [form, setForm] = useState<ProfileForm>(user);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setForm(user);
    setAvatarFile(null);
    setPreview(currentAvatarUrl ?? "");
  }, [user, currentAvatarUrl, open]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const previewSrc =
    preview || getAvatarUrl(form.fullName || form.username, currentAvatarUrl);

  const inputClass = `
    w-full h-12 px-4 rounded-xl border outline-none text-sm transition
    focus:border-blue-500
    ${
      isDark
        ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        : "bg-gray-50 border-gray-200 text-gray-900"
    }
  `;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`
          relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden z-10
          ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200"}
        `}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Cập nhật hồ sơ</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={previewSrc}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/30"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Chọn ảnh mới để đổi avatar (upload lên server)
            </p>
          </div>

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Họ tên"
            className={inputClass}
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            disabled
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
          <input
            name="email"
            value={form.email}
            disabled
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Giới thiệu..."
            rows={3}
            className={`${inputClass} h-auto py-3 resize-none`}
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mật khẩu hiện tại (bắt buộc khi lưu)"
            className={inputClass}
          />
        </div>

        <div
          className={`px-6 py-4 border-t flex justify-end gap-3 ${
            isDark ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSave({ form, avatarFile })}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProfileModalUpdate;
