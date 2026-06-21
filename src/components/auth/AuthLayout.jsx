import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === "/auth";

  useEffect(() => {
    const elements = document.querySelectorAll('.typing-effect');
    elements.forEach(el => {
      const text = el.getAttribute('data-text');
      if (!text) return;
      el.textContent = "";
      let index = 0;
      function type() {
        if (index < text.length) {
          el.textContent += text.charAt(index);
          index++;
          setTimeout(type, Math.random() * 50 + 50);
        }
      }
      setTimeout(type, 500);
    });
  }, []);

  return (
    <div className="bg-surface font-body-md text-on-background selection:bg-primary selection:text-on-primary">
      <main className="min-h-screen flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Terminal Art */}
        <div className="hidden md:flex flex-1 relative bg-surface-container-lowest items-center justify-center p-xl overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          <div className="relative z-10 max-w-lg w-full">
            <div className="mb-xl flex flex-col items-center text-center">
              <div className="flex items-center gap-md mb-md">
                <i className="fa-solid fa-terminal text-primary text-4xl"></i>
                <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold m-0 leading-none">DevRift</h1>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface-variant font-light leading-tight">
                Code. Commit. Collaborate.
              </p>
            </div>
            
            <div className="w-full rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl">
              <div className="bg-surface-container-highest h-8 flex items-center px-md gap-sm">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                <span className="ml-auto font-label-code text-xs text-outline">bash — 80x24</span>
              </div>
              <div className="bg-black p-lg font-label-code text-label-code leading-relaxed text-tertiary min-h-[320px] custom-scrollbar overflow-y-auto">
                <div className="flex gap-md">
                  <span className="text-primary">$</span>
                  <span className="typing-effect" data-text="devrift init --template core-ai"></span>
                </div>
                <div className="text-on-surface-variant mt-sm">
                  &gt; Initializing advanced intelligence framework...<br/>
                  &gt; Fetching repository manifests... [DONE]<br/>
                  &gt; Compiling collaborative protocols... [DONE]<br/>
                </div>
                <div className="flex gap-md mt-md">
                  <span className="text-primary">$</span>
                  <span className="text-on-surface">git commit -m "feat: integrate neural bridge"</span>
                </div>
                <div className="text-on-surface-variant mt-sm">
                  [main 7f2a8c1] feat: integrate neural bridge<br/>
                  14 files changed, 842 insertions(+), 12 deletions(-)<br/>
                </div>
                <div className="flex gap-md mt-md">
                  <span className="text-primary">$</span>
                  <span className="text-on-surface">devrift deploy --env production</span>
                </div>
                <div className="text-tertiary mt-sm flex items-center gap-sm">
                  <i className="fa-solid fa-check-circle text-sm"></i>
                  Deployment successful. AI nodes active.
                </div>
                <div className="mt-md animate-pulse">
                  <span className="text-primary">$</span> <span className="w-2 h-4 bg-primary inline-block"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex-1 flex flex-col items-center justify-center p-md md:p-xl bg-surface relative">
          <div className="md:hidden absolute top-lg left-lg flex items-center gap-sm">
            <i className="fa-solid fa-terminal text-primary"></i>
            <span className="font-headline-md text-headline-md text-primary font-bold">DevRift</span>
          </div>

          <div className="w-full max-w-md glass-panel rounded-2xl p-lg md:p-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>
            
            <div className="flex mb-xl border-b border-outline-variant/30">
              <Link 
                to="/auth"
                className={`flex-1 py-md text-center font-label-caps text-label-caps tracking-widest transition-all ${isLogin ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                LOGIN
              </Link>
              <Link 
                to="/signup"
                className={`flex-1 py-md text-center font-label-caps text-label-caps tracking-widest transition-all ${!isLogin ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                SIGN UP
              </Link>
            </div>

            {children}

            <p className="mt-xl text-body-sm text-outline flex items-center gap-sm justify-center">
              <i className="fa-solid fa-shield text-sm"></i>
              Your data is encrypted end-to-end.
            </p>
          </div>
        </div>
      </main>

      <footer className="md:fixed md:bottom-0 md:left-0 md:w-full z-20 pointer-events-none">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-lg py-md w-full bg-transparent">
          <p className="font-body-sm text-body-sm text-outline pointer-events-auto">© 2026 DevRift AI. All rights reserved.</p>
          <div className="flex gap-lg pointer-events-auto">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" to="/privacy">Privacy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
