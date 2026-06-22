import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import MarkdownRenderer from "./MarkdownRenderer";

const SERVER = import.meta.env.VITE_API_URL;

const ResumePage = () => {
  const [resume,   setResume]   = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);
  const [generated, setGenerated] = useState(false);

  const userId = localStorage.getItem("userId");

  const handleGenerate = async () => {
    if (!userId) {
      setError("You must be logged in to generate a resume.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${SERVER}/ai/resume/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate resume");
      setResume(data.resume);
      setStats(data.stats);
      setGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resume) return;
    await navigator.clipboard.writeText(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!resume) return;
    const blob = new Blob([resume], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "devrift-resume.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout showSearch={false}>
      <div className="p-lg md:p-xl max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-xl">
        
        {/* Left Panel: Form & Controls (40%) */}
        <section className="w-full lg:w-[40%] flex flex-col gap-lg animate-[fade-in-up_0.3s_ease-out]">
          <div className="glass-panel p-lg rounded-xl flex flex-col gap-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary mb-xs flex items-center gap-sm">
                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Resume
              </h1>
              <p className="text-on-surface-variant text-body-sm">Gemini AI analyzes your DevRift activity to craft a professional developer resume in seconds.</p>
            </div>
            
            <div className="space-y-md mt-sm">
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Full Name</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-md py-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-on-surface" 
                  type="text" 
                  placeholder="Your Name"
                  defaultValue="DevRift Explorer"
                />
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-sm mt-md">
                  <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/30 text-center">
                    <div className="font-headline-md text-primary">{stats.totalRepos}</div>
                    <div className="font-label-caps text-[10px] text-on-surface-variant uppercase">Repositories</div>
                  </div>
                  <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/30 text-center">
                    <div className="font-headline-md text-primary">{stats.totalCommits}</div>
                    <div className="font-label-caps text-[10px] text-on-surface-variant uppercase">Commits</div>
                  </div>
                </div>
              )}
              
              <button 
                className="w-full mt-lg py-md bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50" 
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating...</>
                ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles"></i> {generated ? "Regenerate Draft" : "Generate Resume"}</>
                )}
              </button>
            </div>
          </div>

          {(generated || loading) && (
            <div className="p-lg bg-surface-container-high/40 rounded-xl border border-outline-variant/20 animate-[scale-in_0.3s_ease-out]">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm flex items-center gap-sm">
                <i className="fa-solid fa-lightbulb text-tertiary"></i>
                AI Insights
              </h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                {loading ? "Gemini is analyzing your repositories, commits, file types, and issues. This takes about 10–20 seconds..." : "We've highlighted your core technical skills and open-source contributions based on your GitHub-style activity in DevRift."}
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-lg bg-error/10 border border-error/30 rounded-xl text-error">
              <p className="font-bold mb-1 flex items-center gap-sm"><i className="fa-solid fa-triangle-exclamation"></i> Error</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          )}
        </section>

        {/* Right Panel: Resume Preview (60%) */}
        <section className="w-full lg:w-[60%] flex flex-col gap-md animate-[fade-in-up_0.4s_ease-out]">
          <div className="flex justify-end gap-sm mb-sm">
            <button 
              className={`px-md py-sm bg-surface-container-highest font-medium rounded-lg flex items-center gap-sm transition-all disabled:opacity-50 ${copied ? 'text-tertiary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={handleCopy}
              disabled={!resume}
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? "Copied" : "Copy Markdown"}
            </button>
            <button 
              className="px-md py-sm bg-primary text-on-primary font-bold rounded-lg flex items-center gap-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              onClick={handleDownload}
              disabled={!resume}
            >
              <i className="fa-solid fa-download"></i>
              Download .md
            </button>
          </div>

          {/* Resume Card Container */}
          <div className="bg-[#1a1a2e] text-on-surface p-xl md:p-2xl rounded-xl shadow-2xl font-['Inter'] relative overflow-hidden min-h-[842px] border border-outline-variant/30">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
            <div className="relative z-10 flex flex-col h-full">
              
              {!resume && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                  <i className="fa-regular fa-file-lines text-6xl mb-md"></i>
                  <h3 className="text-2xl font-bold mb-sm">Your AI Resume</h3>
                  <p className="max-w-sm text-sm">Click "Generate Resume" to see your auto-generated developer portfolio.</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-lg">
                    <i className="fa-solid fa-robot text-6xl text-primary opacity-20"></i>
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2 animate-pulse">Drafting Resume...</h3>
                </div>
              )}

              {resume && !loading && (
                <div className="prose prose-invert prose-primary max-w-none w-full marker:text-primary">
                  <MarkdownRenderer content={resume} />
                </div>
              )}

            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default ResumePage;
