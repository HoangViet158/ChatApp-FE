import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatWindow from "../pages/ChatWindow";
import ClientLayout from "../layout/ClientLayout";
import AuthPage from "../pages/AuthPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route index element={<ChatWindow />} />
        </Route>
        <Route path="/auth" element={<AuthPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
