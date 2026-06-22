import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, {
        email: email,
        password: password,
        username: username,
      });

      if (res.data.requiresVerification) {
        toast.success("Account created! Please verify your email.");
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);

        setCurrentUser(res.data.userId);
        setLoading(false);
        toast.success("Account created successfully!");
        window.location.href = "/";
      }
    } catch (err) {
      toast.error("Signup Failed!");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="space-y-lg transition-all duration-300 transform animate-[slide-up_0.3s_ease-out]" onSubmit={handleSignup}>
        <div className="grid grid-cols-1 gap-lg">
          <div className="space-y-sm">
            <label className="font-label-caps text-label-caps text-on-surface-variant">USERNAME</label>
            <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
              <i className="fa-solid fa-user absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
              <input 
                className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
                placeholder="dev_explorer" 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
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
            <label className="font-label-caps text-label-caps text-on-surface-variant">PASSWORD</label>
            <div className="relative neon-glow rounded-lg border border-outline-variant/30 bg-[#0D1117] transition-all">
              <i className="fa-solid fa-lock absolute left-md top-1/2 -translate-y-1/2 text-outline"></i>
              <input 
                className="w-full bg-transparent border-none py-md pl-xl pr-md text-on-surface placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <button 
          className="w-full py-md bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary/20 mt-xl disabled:opacity-50" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Create Account"}
          {!loading && <i className="fa-solid fa-rocket"></i>}
        </button>
      </form>

      <div className="relative my-xl">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-container-low px-md text-outline font-label-caps">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-md">
        <button 
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`}
          className="flex items-center justify-center gap-sm py-md rounded-lg border border-outline-variant/30 hover:bg-surface-variant/20 transition-all active:scale-[0.98]"
        >
          <i className="fa-brands fa-github text-xl"></i>
          <span className="text-sm font-medium">GitHub</span>
        </button>
        <button 
          type="button"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          className="flex items-center justify-center gap-sm py-md rounded-lg border border-outline-variant/30 hover:bg-surface-variant/20 transition-all active:scale-[0.98]"
        >
          <i className="fa-brands fa-google text-xl text-[#EA4335]"></i>
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default Signup;
