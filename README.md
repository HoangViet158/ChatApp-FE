# Chat App Frontend

Frontend của hệ thống Chat App được xây dựng bằng React, TypeScript và Vite.

## Công nghệ sử dụng

- React 19
- TypeScript
- Vite
- Axios
- React Router DOM
- Tailwind CSS
- SockJS
- STOMPJS

## Tính năng

- Đăng ký tài khoản
- Đăng nhập bằng JWT
- Quản lý hồ sơ người dùng
- Danh sách cuộc trò chuyện
- Chat cá nhân
- Chat nhóm
- Gửi và nhận tin nhắn thời gian thực bằng WebSocket
- Hiển thị trạng thái online/offline
- Upload avatar
- Responsive UI

## Yêu cầu hệ thống

- Node.js 20+
- npm hoặc yarn

## Cài đặt

Clone source code:

```bash
git clone https://github.com/your-username/chat-app-frontend.git
cd chat-app-frontend
```

Cài đặt dependencies:

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env`

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

## Chạy dự án

```bash
npm run dev
```

Ứng dụng sẽ chạy tại:

```txt
http://localhost:5173
```

## Build Production

```bash
npm run build
```

## Preview Production

```bash
npm run preview
```

## Cấu trúc thư mục

```txt
src/
├── assets/
├── components/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── types/
├── utils/
└── App.tsx
```

## WebSocket

Frontend sử dụng:

- SockJS
- STOMP

Để nhận tin nhắn realtime từ backend.

## Tác giả

Việt Hoàng
