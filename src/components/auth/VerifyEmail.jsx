import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { setCurrentUser } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      toast.error("No email provided for verification.");
      navigate("/auth");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/verify-email`, {
        email: email,
        code: code,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);
      toast.success("Email verified successfully!");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification Failed!");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resend-verification`, {
        email: email,
      });
      toast.success(res.data.message || "Verification code resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-xl">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Verify Your Email</h2>
        <p className="text-on-surface-variant text-sm">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-primary">{email}</span>
        </p>
      </div>

      <form className="space-y-lg transition-all duration-300 transform animate-[slide-up_0.3s_ease-out]" onSubmit={handleVerify}>
        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">VERIFICATION CODE</label>
          <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
            <i className="fa-solid fa-key absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
            <input 
              className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none tracking-widest text-center text-xl font-bold" 
              placeholder="000000" 
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />
          </div>
        </div>
        
        <button 
          className="w-full py-md bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary/20 mt-xl disabled:opacity-50" 
          type="submit"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
          {!loading && <i className="fa-solid fa-arrow-right"></i>}
        </button>
      </form>

      <div className="mt-xl text-center">
        <p className="text-sm text-on-surface-variant mb-2">Didn't receive the code?</p>
        <button 
          onClick={handleResend}
          disabled={resending}
          className="text-primary hover:underline text-sm font-semibold disabled:opacity-50 disabled:no-underline"
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
