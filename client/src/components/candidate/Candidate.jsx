import Login from "./Login.jsx";
import Register from "./Register.jsx";
import { useNavigate } from "react-router";

const RegisterCandidate = ({ isLogin, setCandidate }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = (loggedInCandidate) => {
    setCandidate(loggedInCandidate);
    navigate("/candidate-info");
  };

  return (
    <div>
      {isLogin ? <Login onLogin={handleLoginSuccess} /> : <Register />}
    </div>
  );
};

export default RegisterCandidate;
