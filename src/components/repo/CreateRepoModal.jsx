import { useState, useEffect } from "react";

const SERVER = "http://localhost:3000";

const CreateRepoModal = ({ onClose, onCreated }) => {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [visibility,  setVisibility]  = useState(true);   // true = public
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const userId = localStorage.getItem("userId");
  const token  = localStorage.getItem("token");

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Repository name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:        name.trim(),
          description: description.trim(),
          visibility,
          owner:       userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to create repository");

      const repoRes  = await fetch(`${SERVER}/repo/${data.repositoryID}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const fullRepo = await repoRes.json();
      onCreated(fullRepo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[100] flex items-center justify-center p-lg animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col animate-[slideUp_0.2s_ease-out]">
        
        <div className="p-lg border-b border-outline-variant/30 bg-surface-container-low/50 flex justify-between items-center">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-folder-plus text-primary text-xl"></i>
            </div>
            <h3 className="font-headline-md text-headline-md text-white m-0">Create a new repository</h3>
          </div>
          <button 
            className="text-on-surface-variant hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-xl flex flex-col gap-xl">
            {error && (
              <div className="bg-error/10 border border-error/30 text-error p-md rounded-lg flex items-center gap-md text-body-sm">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="repo-name" className="text-body-sm font-bold text-on-surface">
                Repository name <span className="text-error">*</span>
              </label>
              <input
                id="repo-name"
                type="text"
                placeholder="my-awesome-project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="repo-desc" className="text-body-sm font-bold text-on-surface flex justify-between items-center">
                <span>Description <span className="text-on-surface-variant font-normal">(optional)</span></span>
              </label>
              <textarea
                id="repo-desc"
                placeholder="Short description of what this repository does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-on-surface-variant/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-bold text-on-surface">Visibility</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setVisibility(true)}
                  className={`flex-1 p-md rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${visibility ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 bg-surface-container-highest text-on-surface-variant hover:border-outline-variant/50 hover:text-white'}`}
                >
                  <i className="fa-solid fa-globe text-2xl"></i>
                  <span className="font-bold">Public</span>
                  <span className="text-[11px] opacity-70">Anyone on the internet can see this repository.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility(false)}
                  className={`flex-1 p-md rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${!visibility ? 'border-secondary bg-secondary/5 text-secondary' : 'border-outline-variant/30 bg-surface-container-highest text-on-surface-variant hover:border-outline-variant/50 hover:text-white'}`}
                >
                  <i className="fa-solid fa-lock text-2xl"></i>
                  <span className="font-bold">Private</span>
                  <span className="text-[11px] opacity-70">You choose who can see and commit to this repository.</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-lg border-t border-outline-variant/30 bg-surface-container-low/50 flex justify-end gap-md">
            <button 
              type="button" 
              className="px-lg py-sm text-on-surface-variant font-bold hover:text-white transition-colors rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-lg py-sm bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 neon-glow"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Creating...</>
              ) : (
                <>Create repository <i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRepoModal;
