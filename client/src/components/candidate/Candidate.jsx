import Login from "./Login.jsx";
import Register from "./Register.jsx";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const RegisterCandidate = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [candidate, setCandidate] = useState(() => {
    try {
      const savedCandidate = localStorage.getItem("candidate");
      return savedCandidate ? JSON.parse(savedCandidate) : null;
    } catch (error) {
      console.error("Error reading saved candidate:", error);
      return null;
    }
  });

  useEffect(() => {
    if (candidate) {
      localStorage.setItem("candidate", JSON.stringify(candidate));
      return;
    }

    localStorage.removeItem("candidate");
  }, [candidate]);

  const handleLoginSuccess = (loggedInCandidate) => {
    setCandidate(loggedInCandidate);
    localStorage.setItem("candidate", JSON.stringify(loggedInCandidate));
    navigate("/candidate-info");
  };

  return (
    <div className="max-h-[100vh] bg-slate-50 flex items-center justify-center p-4">
      {/* Main Card with minimal height and padding */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE: Form Inputs & Submit */}
        <div className="p-4 sm:p-5 flex flex-col justify-center">
          <div className="w-full">
            {isLogin ? (
              <Login onLogin={handleLoginSuccess} />
            ) : (
              <Register setCandidate={setCandidate} />
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Welcome Message & Toggle Button */}
        <div className="bg-indigo-600 p-4 sm:p-5 flex flex-col justify-between text-white">
          <div>
            <span className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">
              Secure Portal
            </span>
            <h2 className="text-xl font-bold mt-0.5">
              {isLogin ? "Welcome Back!" : "Glad You're Here!"}
            </h2>
            <p className="text-indigo-100 text-xs mt-1 leading-normal">
              {isLogin
                ? "Thank you for being part of our journey. Log in to pick up right where you left off."
                : "We appreciate you joining us. Create your account to get started."}
            </p>
          </div>

          {/* Toggle Button Footer */}
          <div className="pt-3 mt-3 border-t border-indigo-500/50 flex items-center justify-between gap-2 text-xs">
            <span className="text-indigo-100">
              {isLogin ? "New here?" : "Have an account?"}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-3 py-1 bg-white text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition-colors shadow-sm focus:outline-none"
            >
              {isLogin ? "Create Account" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCandidate;
