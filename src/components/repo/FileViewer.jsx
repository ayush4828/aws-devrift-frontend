import { useEffect, useState, useCallback } from "react";

const SERVER = "http://localhost:3000";

function fileIcon(filename = "") {
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    js: "fa-brands fa-js text-[#f7df1e]", jsx: "fa-brands fa-react text-[#61dafb]",
    ts: "fa-solid fa-code text-[#3178c6]", tsx: "fa-brands fa-react text-[#61dafb]",
    json: "fa-solid fa-brackets-curly text-on-surface-variant", md: "fa-brands fa-markdown text-on-surface-variant",
    css: "fa-brands fa-css3-alt text-[#2965f1]", html: "fa-brands fa-html5 text-[#e34f26]",
    py: "fa-brands fa-python text-[#3776ab]", sh: "fa-solid fa-terminal text-on-surface-variant",
    txt: "fa-solid fa-file-lines text-on-surface-variant", env: "fa-solid fa-lock text-on-surface-variant",
  };
  return map[ext] || "fa-solid fa-file text-on-surface-variant";
}

const FileViewer = ({ s3Key, filename, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${SERVER}/repo/file?key=${encodeURIComponent(s3Key)}`, { headers });
      if (!res.ok) throw new Error(`Failed to load file (${res.status})`);
      const text = await res.text();
      setContent(text);
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  }, [s3Key]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content ? content.split("\n") : [];

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-xl" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-5xl h-[85vh] rounded-xl flex flex-col border border-outline-variant/30 overflow-hidden animate-[scale-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-lg py-md border-b border-outline-variant/30 bg-surface-container-low/80 flex justify-between items-center">
          <div className="flex items-center gap-md">
            <i className={`${fileIcon(filename)} text-lg`} />
            <span className="font-label-code text-label-code text-primary">{filename}</span>
            {content !== null && (
              <span className="text-on-surface-variant text-[12px] opacity-60 ml-sm">
                {lines.length} line{lines.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-sm">
            {content !== null && (
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${copied ? 'bg-tertiary/20 text-tertiary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                title="Copy file content"
              >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-[14px]`} />
                <span className="text-[12px] font-bold uppercase">{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
            <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
            <button className="p-2 hover:bg-error/20 hover:text-error text-on-surface-variant rounded transition-colors" onClick={onClose} title="Close (Esc)">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow flex flex-col overflow-hidden bg-[#0d0d12]">
          {loading && (
            <div className="flex-grow flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary"></i>
              <span className="font-label-caps tracking-widest uppercase">Fetching from cloud...</span>
            </div>
          )}

          {error && (
            <div className="flex-grow flex flex-col items-center justify-center gap-4 text-error">
              <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
              <div className="text-center">
                <p className="font-bold mb-1">Could not load file</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          )}

          {content !== null && !loading && !error && (
            <div className="flex-grow flex overflow-auto custom-scrollbar font-label-code text-label-code">
              {/* Line numbers */}
              <div className="py-lg px-md bg-surface-container-lowest/50 text-right text-outline-variant/50 select-none border-r border-outline-variant/20 sticky left-0 min-w-[3rem]">
                {lines.map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <pre className="py-lg px-lg leading-relaxed text-on-surface overflow-x-auto min-w-max">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
