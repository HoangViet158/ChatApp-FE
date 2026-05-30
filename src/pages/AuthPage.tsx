import { useEffect, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, MessageCircleMore } from "lucide-react";
import { registerApi } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();
  const { login, isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      nav("/", { replace: true });
    }
  }, [isReady, isAuthenticated, nav]);
  // form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      await login({
        email: form.email,
        password: form.password,
      });

      nav("/", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed");
    }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await registerApi({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
      });

      alert("Register success 🎉");

      setIsLogin(true);
    } catch (err) {
      console.error("Register failed", err);
      alert("Register failed");
    }
  };
  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-blue-600
        via-indigo-600
        to-purple-700
        p-4
      "
    >
      {/* CARD */}
      <div
        className="
          w-full
          max-w-5xl
          bg-white/10
          backdrop-blur-2xl
          border border-white/20
          rounded-3xl
          overflow-hidden
          shadow-2xl
          grid
          md:grid-cols-2
        "
      >
        {/* LEFT SIDE */}
        <div
          className="
            hidden md:flex
            flex-col
            justify-center
            items-center
            p-12
            text-white
            relative
            overflow-hidden
          "
        >
          {/* BG CIRCLE */}
          <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-10 -left-10 blur-2xl"></div>

          <div className="absolute w-72 h-72 bg-blue-300/20 rounded-full bottom-0 right-0 blur-2xl"></div>

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="
                w-20 h-20
                rounded-3xl
                bg-white/20
                flex items-center justify-center
                mb-6
              "
            >
              <MessageCircleMore size={42} />
            </div>

            <h1 className="text-5xl font-bold mb-4">Yuki Chat</h1>

            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Connect with your friends, create groups, share messages and enjoy
              real-time chatting.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="
            bg-white
            p-8 md:p-12
            flex flex-col
            justify-center
          "
        >
          {/* TITLE */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
            </h2>

            <p className="text-gray-500 mt-2">
              {isLogin
                ? "Login to continue chatting"
                : "Register and start your journey"}
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-5">
            {/* REGISTER NAME */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <div
                  className="
                    mt-2
                    h-12
                    rounded-xl
                    border
                    border-gray-300
                    flex items-center
                    px-4
                    focus-within:border-blue-500
                    transition
                  "
                >
                  <User size={18} className="text-gray-400" />

                  <input
                    name="fullName"
                    onChange={handleChange}
                    value={form.fullName}
                    type="text"
                    placeholder="Enter your full name"
                    className="flex-1 px-3 outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>

                <div
                  className="
                  mt-2
                  h-12
                  rounded-xl
                  border
                  border-gray-300
                  flex items-center
                  px-4
                  focus-within:border-blue-500
                  transition
                "
                >
                  <input
                    name="username"
                    onChange={handleChange}
                    value={form.username}
                    type="username"
                    placeholder="Enter your username"
                    className="flex-1 px-3 outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>

              <div
                className="
                  mt-2
                  h-12
                  rounded-xl
                  border
                  border-gray-300
                  flex items-center
                  px-4
                  focus-within:border-blue-500
                  transition
                "
              >
                <Mail size={18} className="text-gray-400" />

                <input
                  name="email"
                  onChange={handleChange}
                  value={form.email}
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div
                className="
                  mt-2
                  h-12
                  rounded-xl
                  border
                  border-gray-300
                  flex items-center
                  px-4
                  focus-within:border-blue-500
                  transition
                "
              >
                <Lock size={18} className="text-gray-400" />

                <input
                  name="password"
                  onChange={handleChange}
                  value={form.password}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="flex-1 px-3 outline-none bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <div
                  className="
                    mt-2
                    h-12
                    rounded-xl
                    border
                    border-gray-300
                    flex items-center
                    px-4
                    focus-within:border-blue-500
                    transition
                  "
                >
                  <Lock size={18} className="text-gray-400" />

                  <input
                    name="confirmPassword"
                    onChange={handleChange}
                    value={form.confirmPassword}
                    type="password"
                    placeholder="Confirm password"
                    className="flex-1 px-3 outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* REMEMBER */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="button"
              onClick={isLogin ? handleLogin : handleRegister}
              className="
    w-full
    h-12
    rounded-xl
    bg-blue-600
    hover:bg-blue-700
    text-white
    font-semibold
    transition
    shadow-lg
    shadow-blue-500/30
  "
            >
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          {/* DIVIDER */}
          {/* <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>

            <span className="text-sm text-gray-400">OR</span>

            <div className="flex-1 h-px bg-gray-200"></div>
          </div> */}

          {/* SOCIAL */}
          {/* <div className="grid grid-cols-2 gap-4">
            <button
              className="
                h-12
                rounded-xl
                border
                border-gray-300
                hover:bg-gray-50
                transition
                font-medium
              "
            >
              Google
            </button>

            <button
              className="
                h-12
                rounded-xl
                border
                border-gray-300
                hover:bg-gray-50
                transition
                font-medium
              "
            >
              Github
            </button>
          </div> */}

          {/* SWITCH */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="
                  ml-2
                  text-blue-600
                  hover:text-blue-700
                  font-semibold
                "
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
