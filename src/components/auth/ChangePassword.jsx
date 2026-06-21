import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/change-password", {
        email,
        oldPassword,
        newPassword
      });
      toast.success("Password changed successfully! You can now log in.");
      navigate("/auth");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
        <p className="text-on-surface-variant text-sm">
          Enter your current email and password to securely change your password.
        </p>
      </div>

      <form className="space-y-lg transition-all duration-300 transform animate-[slide-up_0.3s_ease-out]" onSubmit={handleSubmit}>
        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">EMAIL ADDRESS</label>
          <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
            <i className="fa-solid fa-at absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
            <input 
              className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
              placeholder="name@company.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">OLD PASSWORD</label>
          <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
            <i className="fa-solid fa-lock absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
            <input 
              className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
              placeholder="••••••••" 
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">NEW PASSWORD</label>
          <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
            <i className="fa-solid fa-key absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
            <input 
              className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
              placeholder="••••••••" 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant">CONFIRM NEW PASSWORD</label>
          <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
            <i className="fa-solid fa-key absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
            <input 
              className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
              placeholder="••••••••" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        
        <button 
          className="w-full py-md bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary/20 mt-xl disabled:opacity-50" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
          {!loading && <i className="fa-solid fa-check"></i>}
        </button>

        <div className="text-center mt-6">
          <a href="/auth" className="text-on-surface-variant hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-arrow-left"></i>
            Back to login
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
