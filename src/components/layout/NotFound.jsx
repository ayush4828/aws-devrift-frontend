import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import "./NotFound.css";

const NotFound = () => {
  const portalRef = useRef(null);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!portalRef.current) return;
      const x = (window.innerWidth / 2 - e.pageX) / 40;
      const y = (window.innerHeight / 2 - e.pageY) / 40;
      portalRef.current.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 50);
      }
    }, 200);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 grid-pattern pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative flex flex-col items-center justify-center min-h-screen not-found-bg-grid w-full overflow-hidden z-10">
        
        {/* Floating Code Fragments */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="not-found-floating-code font-label-sm text-primary-fixed-dim absolute left-[10%]" style={{ animationDelay: "-2s" }}>ERR_RIFT_SYNC_FAILED: 0x404</div>
          <div className="not-found-floating-code font-label-sm text-secondary-fixed-dim absolute left-[25%]" style={{ animationDelay: "-7s" }}>FRAGMENT_ID: {'{UUID_GEN}'}</div>
          <div className="not-found-floating-code font-label-sm text-primary-fixed-dim absolute left-[75%]" style={{ animationDelay: "-12s" }}>while(true) {'{ search(path); }'}</div>
          <div className="not-found-floating-code font-label-sm text-secondary-fixed-dim absolute left-[90%]" style={{ animationDelay: "-4s" }}>system_status: UNSTABLE</div>
          <div className="not-found-floating-code font-label-sm text-primary-fixed-dim absolute left-[45%]" style={{ animationDelay: "-18s" }}>PROTOCOL_OVERRIDE_INITIATED</div>
        </div>

        {/* Center Visual Section */}
        <div className="relative z-10 text-center max-w-3xl pt-10 flex flex-col items-center">
          
          {/* Glitchy Visual */}
          <div className="mb-12 relative flex justify-center">
            <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full"></div>
            <div className="not-found-rift-portal-glow">
              <div 
                ref={portalRef}
                className="w-64 h-64 md:w-80 md:h-80 bg-cover bg-center rounded-2xl border border-primary/20 transform rotate-3 hover:rotate-0 transition-transform duration-500" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPJmMMJhuPH05J08nCts6VUWzngD-91ydENSHxqsje3hlO5cahNfkX4Hf5Cz4rTMRNWm9W3031jqz4ywbvt2o7QlUHrzcEI_3My-SJPuTj327QkcLgkhpFS44zzU0Nw7vut-Laq_CT2kdCQuHiRk-sqIVewWrVs5vhTqncum40Ww42Y0tNlFefl5yTUccHbcz6tT36I4wTVdXGx7CfKoQko0ipcA44TwI7QfBFb5OAc3TKdzIiSK73Du2JjCRPoJeEm4TWjgkJJwQ')" }}
              ></div>
            </div>
          </div>

          {/* Typography Cluster */}
          <h1 
            className={`font-headline-xl text-headline-xl md:text-[120px] leading-none mb-4 font-black text-primary tracking-tighter transition-opacity duration-75 ${flicker ? 'opacity-70' : 'opacity-100'} not-found-glitch-text`}
          >
            404
          </h1>
          
          <div className="mb-6 flex flex-col items-center gap-4 w-full">
            <div className="not-found-rift-divider w-full max-w-md"></div>
            <p className="font-label-md text-label-md tracking-widest text-secondary uppercase">CODE_ERR: REALITY_FRAGMENTED</p>
            <div className="not-found-rift-divider w-full max-w-md"></div>
          </div>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-xl mx-auto px-4">
            The path you're looking for has drifted into another rift. <br className="hidden md:block"/>
            Our systems are attempting to re-sync with the primary kernel.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12">
            <Link 
              className="group relative px-10 py-4 bg-primary text-on-primary font-bold flex items-center gap-3 overflow-hidden active:scale-95 transition-all rounded-lg shadow-lg shadow-primary/20" 
              to="/"
            >
              <span className="relative z-10">Return to Core</span>
              <i className="fa-solid fa-rocket relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"></i>
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 bg-white/20"></div>
            </Link>
            
            <button 
              className="px-10 py-4 border border-outline-variant/50 text-on-surface font-bold flex items-center gap-3 hover:bg-surface-container-high transition-all active:scale-95 group rounded-lg z-20 bg-surface-container/50 backdrop-blur"
              onClick={() => {
                import('react-hot-toast').then(({ default: toast }) => {
                  toast.success("Anomaly reported to DevRift High Command.");
                });
              }}
            >
              <i className="fa-solid fa-bug text-secondary group-hover:rotate-12 transition-transform"></i>
              <span>Report Anomaly</span>
            </button>
          </div>

          {/* Terminal Snippet (Moved below buttons instead of absolute) */}
          <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur border border-outline-variant/20 rounded-lg overflow-hidden hidden md:block shadow-2xl mb-10 text-left">
            <div className="bg-surface-container-high h-8 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-error/80"></div>
              <div className="w-3 h-3 rounded-full bg-primary/80"></div>
              <div className="w-3 h-3 rounded-full bg-secondary/80"></div>
              <span className="ml-4 font-label-sm text-on-surface-variant opacity-70 tracking-widest text-[10px]">kernel_log_dump_v4.0.4</span>
            </div>
            <div className="p-4 font-label-code text-label-code text-primary/80 space-y-2">
              <p>&gt; [SYSTEM] INITIALIZING SEARCH PROTOCOL...</p>
              <p>&gt; [SYSTEM] NODE_NOT_FOUND: 'requested_asset_uri'</p>
              <p>&gt; [SYSTEM] ATTEMPTING RIFT STABILIZATION [■■■■■□□□□□] 50%</p>
              <p className="text-secondary/80">&gt; [WARNING] TEMPORAL DRIFT DETECTED IN SECTOR 7G</p>
              <p className="animate-pulse">&gt; [SYSTEM] STANDBY FOR RE-ROUTING...</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default NotFound;
