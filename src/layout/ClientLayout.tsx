import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { useThemeStore } from "../store/ThemeStore";
import { useEffect } from "react";

const ClientLayout: React.FC = () => {
  const { isDark, setTheme } = useThemeStore();
  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900"
          : "bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/40"
      }`}
    >
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
