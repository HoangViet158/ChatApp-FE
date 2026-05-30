import api from "../config/api";

// ===== TYPE (khuyến nghị thêm để rõ ràng) =====
export interface MessageRequest {
  messageId?: number;
  senderId: number;
  receiverId?: number;
  content?: string;
}

// ===== RESPONSE TYPE =====
export interface AttachmentResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
  createdAt: string;
}

// ===== UPLOAD API =====
export const uploadAttachment = async (
  file: File,
  request: MessageRequest,
): Promise<AttachmentResponse> => {
  const formData = new FormData();

  // JSON part (PHẢI dùng Blob)
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json",
    }),
  );

  // file part
  formData.append("file", file);

  const res = await api.post("/api/v1/attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.result; // vì backend bạn wrap ApiResponse
};

export const getAttachmentById = async (
  id: number,
): Promise<AttachmentResponse> => {
  const res = await api.get(`/api/v1/attachments/${id}`);
  return res.data.result;
};

export const getAllAttachments = async (): Promise<AttachmentResponse[]> => {
  const res = await api.get("/api/v1/attachments");
  return res.data.result;
};

export const deleteAttachment = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/attachments/${id}`);
};
