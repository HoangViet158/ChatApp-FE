import { useThemeStore } from "../store/ThemeStore";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="
        px-3 py-2
        rounded-lg

        bg-white/10
        hover:bg-white/20

        transition
      "
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
