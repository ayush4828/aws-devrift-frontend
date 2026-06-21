import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../authContext";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (token && userId) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setCurrentUser(userId);
      navigate("/");
    } else {
      navigate("/auth");
    }
  }, [searchParams, navigate, setCurrentUser]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <i className="fa-brands fa-github text-5xl fa-bounce"></i>
        <h2 className="text-xl font-bold">Authenticating with GitHub...</h2>
      </div>
    </div>
  );
};

export default AuthSuccess;
