import EmployerLogin from "./EmployerLogin.jsx";
import EmployerRegister from "./EmployerRegister.jsx";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const Employer = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [employer, setEmployer] = useState(() => {
    try {
      const savedEmployer = localStorage.getItem("employer");
      return savedEmployer ? JSON.parse(savedEmployer) : null;
    } catch (error) {
      console.error("Error reading saved employer:", error);
      return null;
    }
  });

  useEffect(() => {
    if (employer) {
      localStorage.setItem("employer", JSON.stringify(employer));
      return;
    }

    localStorage.removeItem("employer");
  }, [employer]);

  const handleLoginSuccess = (loggedInEmployer) => {
    setEmployer(loggedInEmployer);
    localStorage.setItem("employer", JSON.stringify(loggedInEmployer));
    navigate("/api/interviewer/employment");
  };

  return (
    <div className="max-h-[100vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-4 sm:p-5 flex flex-col justify-center">
          <div className="w-full">
            {isLogin ? (
              <EmployerLogin onLogin={handleLoginSuccess} />
            ) : (
              <EmployerRegister setEmployer={setEmployer} />
            )}
          </div>
        </div>

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
                ? "Welcome back. Log in to continue managing your hiring workflow."
                : "Create your employer account and start hiring the right candidates."}
            </p>
          </div>

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

export default Employer;
