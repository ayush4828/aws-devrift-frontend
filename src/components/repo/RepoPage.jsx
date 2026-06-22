import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import FileViewer from "./FileViewer";
import MarkdownRenderer from "../ai/MarkdownRenderer";
import NotificationBell from "../layout/NotificationBell";
import NotFound from "../layout/NotFound";
import ConfirmModal from "../layout/ConfirmModal";
import toast from 'react-hot-toast';

const SERVER = import.meta.env.VITE_API_URL;

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function shortId(id = "") { return id.slice(0, 7); }

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

const buildFileTree = (files) => {
  const root = { name: "root", isDir: true, children: {}, path: "" };
  files.forEach(file => {
    const parts = file.filename.replace(/\\/g, "/").split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current.children[part] = {
          name: part,
          isDir: false,
          file: file,
          path: file.filename,
        };
      } else {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            isDir: true,
            children: {},
            path: parts.slice(0, i + 1).join("/"),
          };
        }
        current = current.children[part];
      }
    }
  });
  return root;
};

const FileTreeNode = ({ node, setViewingFile, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!node.isDir) {
    return (
      <div 
        onClick={() => setViewingFile({ s3Key: node.file.s3Key, filename: node.file.filename })}
        className="flex items-center gap-sm py-1.5 text-on-surface hover:bg-primary/5 rounded cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 16 + 8}px`, paddingRight: '8px' }}
      >
        <i className={`${fileIcon(node.name)} text-[14px] w-4 text-center`} />
        <span className="font-body-sm text-sm truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-sm py-1.5 text-on-surface-variant hover:text-on-surface hover:bg-primary/5 rounded cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 16 + 8}px`, paddingRight: '8px' }}
      >
        <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'} text-[10px] w-3 text-center`} />
        <i className={`fa-solid fa-folder${isOpen ? '-open' : ''} text-primary text-[14px]`} />
        <span className="font-body-sm text-sm font-medium truncate">{node.name}</span>
      </div>
      {isOpen && (
        <div className="flex flex-col">
          {Object.values(node.children)
            .sort((a, b) => {
              if (a.isDir && !b.isDir) return -1;
              if (!a.isDir && b.isDir) return 1;
              return a.name.localeCompare(b.name);
            })
            .map(child => (
              <FileTreeNode key={child.path} node={child} setViewingFile={setViewingFile} level={level + 1} />
            ))
          }
        </div>
      )}
    </div>
  );
};

const RepoPage = () => {
  const { id } = useParams();
  const [repo, setRepo]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expandedCommit, setExpanded] = useState(null);
  const [isLive, setIsLive]           = useState(false);
  const [activeTab, setActiveTab]     = useState("code"); // code, issues, ai, settings
  const [viewingFile, setViewingFile] = useState(null);
  const [newCommitAlert, setNewCommitAlert] = useState(null);
  const [isStarred, setIsStarred]     = useState(false);
  const [starCount, setStarCount]     = useState(0);
  const [starParticles, setStarParticles] = useState([]);

  const [issues, setIssues]           = useState([]);
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [issueTitle, setIssueTitle]   = useState("");
  const [issueDesc, setIssueDesc]     = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null); // id of issue pending deletion
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [editIssueTitle, setEditIssueTitle] = useState("");
  const [editIssueDesc, setEditIssueDesc]   = useState("");

  const [aiMode,     setAiMode]     = useState(null);
  const [aiResult,   setAiResult]   = useState({});
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState(null);
  const [aiCopied,   setAiCopied]   = useState(false);

  const [editRepoName, setEditRepoName] = useState("");
  const [editRepoDesc, setEditRepoDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteRepoModal, setShowDeleteRepoModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (userId) {
      fetch(`${SERVER}/userprofile/${userId}`)
        .then(res => res.json())
        .then(data => setUserProfile(data))
    }
  }, [userId]);

  const loggedInUsername = userProfile?.username || (userId ? "Developer" : "Guest");

  const fetchRepo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res  = await fetch(`${SERVER}/repo/${id}`, { headers });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access Denied: This is a private repository.");
        throw new Error("Repository not found");
      }
      const data = await res.json();
      setRepo(data);
      setEditRepoName(data.name || "");
      setEditRepoDesc(data.description || "");
      if (data.stars) {
        setStarCount(data.stars.length);
        setIsStarred(data.stars.map(s => s.toString()).includes(userId));
      }
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  }, [id, userId]);

  useEffect(() => { fetchRepo(); }, [fetchRepo]);

  const triggerStarBurst = () => {
    const particles = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * 2 * Math.PI;
      const dist  = 34 + Math.random() * 14;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      return { id: Date.now() + i, tx, ty };
    });
    setStarParticles(particles);
    setTimeout(() => setStarParticles([]), 650);
  };

  const handleToggleStar = async () => {
    if (!userId) return toast.error("Please log in to star repositories.");

    const previousStarred = isStarred;
    const previousCount = starCount;

    setIsStarred(!previousStarred);
    setStarCount(prev => previousStarred ? prev - 1 : prev + 1);

    if (!previousStarred) {
      triggerStarBurst();
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/repo/toggle-star/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsStarred(data.starred);
        setStarCount(data.starCount);
      } else {
        setIsStarred(previousStarred);
        setStarCount(previousCount);
        toast.error(data.message);
      }
    } catch (err) {
      setIsStarred(previousStarred);
      setStarCount(previousCount);
    }
  };

  const fetchIssues = useCallback(async () => {
    try {
      const res  = await fetch(`${SERVER}/issue/all/${id}`);
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch {}
  }, [id]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueDesc.trim()) return;
    setIssueLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/issue/create/${id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ title: issueTitle.trim(), description: issueDesc.trim() }),
      });
      const newIssue = await res.json();
      if (res.ok) {
        setIssues((prev) => [newIssue, ...prev]);
        setIssueTitle(""); setIssueDesc(""); setShowNewIssue(false);
      }
    } catch {} finally { setIssueLoading(false); }
  };

  const handleCloseIssue = async (issueId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/issue/update/${issueId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: "closed" }),
      });
      if (res.ok) setIssues((prev) => prev.map((iss) => iss._id === issueId ? { ...iss, status: "closed" } : iss));
    } catch {}
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/issue/delete/${issueToDelete}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setIssues((prev) => prev.filter((iss) => iss._id !== issueToDelete));
        toast.success("Issue deleted.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete issue.");
      }
    } catch {
      toast.error("Network error. Failed to delete issue.");
    } finally {
      setIssueToDelete(null);
    }
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    if (!editIssueTitle.trim() || !editIssueDesc.trim()) return;
    setIssueLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/issue/update/${editingIssueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editIssueTitle.trim(), description: editIssueDesc.trim() })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(iss => iss._id === editingIssueId ? { ...iss, title: updatedIssue.title, description: updatedIssue.description } : iss));
        setEditingIssueId(null);
        toast.success("Issue updated.");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update issue.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIssueLoading(false);
    }
  };

  const handleUpdateRepo = async (e) => {
    e.preventDefault();
    if (!editRepoName.trim()) return toast.error("Repository name is required.");
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/repo/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editRepoName.trim(), description: editRepoDesc.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setRepo(prev => ({ ...prev, name: editRepoName.trim(), description: editRepoDesc.trim() }));
        toast.success("Repository updated.");
      } else {
        toast.error(data.message || "Failed to update repository.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/repo/toggle/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRepo(prev => ({ ...prev, visibility: !prev.visibility }));
        toast.success("Visibility toggled.");
      } else {
        toast.error(data.message || "Failed to toggle visibility.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleDeleteRepo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER}/repo/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Repository deleted.");
        window.location.href = "/";
      } else {
        toast.error(data.message || "Failed to delete repository.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setShowDeleteRepoModal(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const socket = io(SERVER);
    socket.on("connect", () => { socket.emit("joinRoom", userId); setIsLive(true); });
    socket.on("disconnect", () => setIsLive(false));
    socket.on("repoUpdated", (payload) => {
      if (payload.repoId !== id) return;
      fetchRepo();
      setNewCommitAlert(payload.commit);
      setTimeout(() => setNewCommitAlert(null), 5000);
    });
    return () => socket.disconnect();
  }, [userId, id, fetchRepo]);

  const isOwner = repo?.owner === userId || repo?.owner?._id === userId;

  const commitsSorted = repo?.commits?.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) || [];
  const latestCommit  = commitsSorted[0];
  
  const allFilesMap = new Map();
  const chronologicalCommits = repo?.commits?.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || [];
  chronologicalCommits.forEach(commit => {
    (commit.files || []).forEach(file => {
      allFilesMap.set(file.filename, file);
    });
  });
  
  const latestFiles = Array.from(allFilesMap.values()).sort((a, b) => a.filename.localeCompare(b.filename));

  if (loading) return (
    <div className="bg-surface min-h-screen text-on-surface flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <i className="fa-solid fa-circle-notch fa-spin text-primary text-4xl"></i>
        <p className="text-on-surface-variant font-label-caps uppercase tracking-widest">Loading Repository...</p>
      </div>
    </div>
  );

  if (error || !repo) return <NotFound />;

  return (
    <div className="bg-surface custom-scrollbar text-on-surface min-h-screen">
      <ConfirmModal
        isOpen={!!issueToDelete}
        onConfirm={handleDeleteIssue}
        onCancel={() => setIssueToDelete(null)}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        confirmLabel="Delete Issue"
        danger={true}
      />
      <ConfirmModal
        isOpen={showDeleteRepoModal}
        onConfirm={handleDeleteRepo}
        onCancel={() => setShowDeleteRepoModal(false)}
        title="Delete Repository"
        message="Are you entirely sure you want to delete this repository? All commits, issues, and files will be permanently removed. This cannot be undone."
        confirmLabel="Delete Repository"
        danger={true}
      />

      <div className="fixed inset-0 grid-pattern opacity-5 pointer-events-none z-0"></div>
      
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex items-center gap-md">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">DevRift</Link>
          <div className="hidden md:flex gap-md ml-xl">
            <Link to="/" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-sm">Dashboard</Link>
            <Link to="/ai/resume" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-sm">AI Tools</Link>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <NotificationBell />
          <Link to="/profile" className="flex items-center gap-2 border-l border-outline-variant/30 pl-4 ml-2">
            <span className="text-body-sm text-on-surface font-bold">{loggedInUsername}</span>
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-surface-container overflow-hidden">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <i className="fa-solid fa-user text-primary text-sm"></i>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {newCommitAlert && (
        <div className="fixed top-20 right-xl z-50 bg-tertiary text-on-tertiary px-lg py-sm rounded-lg shadow-2xl flex items-center gap-md animate-bounce">
          <i className="fa-solid fa-rocket"></i>
          <span>New push! Commit <code className="bg-black/20 px-1 rounded">{shortId(newCommitAlert.commitId)}</code> arrived.</span>
        </div>
      )}

      <main className="relative z-10 pt-24 pb-xl px-lg max-w-screen-2xl mx-auto min-h-screen flex flex-col gap-lg">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
              <i className="fa-solid fa-layer-group text-2xl text-on-surface-variant"></i>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-xs text-on-surface-variant text-body-sm">
                <span>{repo?.owner?.username || "Unknown"} /</span>
                <span className="text-primary font-bold">{repo.name}</span>
              </div>
              <div className="flex items-center gap-sm mt-1">
                <h1 className="font-headline-lg text-headline-lg text-on-surface m-0 leading-none">{repo.name}</h1>
                <span className="px-2 py-0.5 rounded-full border border-outline-variant/50 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">
                  {repo.visibility ? "Public" : "Private"}
                </span>
                {isLive && (
                  <span className="px-2 py-0.5 rounded-full border border-tertiary text-[10px] uppercase font-bold text-tertiary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></span> LIVE
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-sm">
            <div className="flex items-center rounded-lg border border-outline-variant/30 overflow-hidden">
              <div className="star-btn-wrapper">
                {/* Burst particles */}
                {starParticles.map(p => (
                  <span
                    key={p.id}
                    className="star-particle"
                    style={{ '--tx': `translate(${p.tx}px, ${p.ty}px)`, top: '50%', left: '50%', marginTop: '-3px', marginLeft: '-3px' }}
                  />
                ))}
                <button 
                  onClick={handleToggleStar}
                  className={`px-md py-2 transition-all flex items-center gap-xs active:scale-90 ${isStarred ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-surface-container-low hover:bg-surface-container-high text-on-surface"}`}
                >
                  <i className={`${isStarred ? "fa-solid" : "fa-regular"} fa-star text-sm transition-transform ${isStarred ? "scale-125" : ""}`}></i>
                  <span className="font-label-caps text-label-caps">{isStarred ? "Starred" : "Star"}</span>
                </button>
              </div>
              <div className="px-md py-2 bg-surface-container-highest font-label-code text-label-code border-l border-outline-variant/30">
                {starCount}
              </div>
            </div>
            <div className="flex gap-xs">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`git clone ${SERVER}/git/${repo.name}.git`);
                  toast.success("Clone URL copied to clipboard!");
                }}
                className="px-md py-2 border border-primary text-primary hover:bg-primary/10 transition-colors rounded-lg flex items-center gap-xs"
              >
                <i className="fa-solid fa-cloud-arrow-down text-sm"></i>
                <span className="font-label-caps text-label-caps">Clone</span>
              </button>
            </div>
          </div>
        </header>
        
        {repo.description && (
          <p className="text-body-md text-on-surface-variant max-w-3xl">{repo.description}</p>
        )}

        <nav className="flex border-b border-outline-variant/30 overflow-x-auto custom-scrollbar">
          <button 
            className={`px-lg py-3 flex items-center gap-xs transition-all whitespace-nowrap ${activeTab === 'code' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`}
            onClick={() => setActiveTab('code')}
          >
            <i className="fa-solid fa-code text-lg"></i>
            <span>Code</span>
          </button>
          <button 
            className={`px-lg py-3 flex items-center gap-xs transition-all whitespace-nowrap ${activeTab === 'commits' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`}
            onClick={() => setActiveTab('commits')}
          >
            <i className="fa-solid fa-code-commit text-lg"></i>
            <span>Commits</span>
            <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] ml-1">{commitsSorted.length}</span>
          </button>
          <button 
            className={`px-lg py-3 flex items-center gap-xs transition-all whitespace-nowrap ${activeTab === 'issues' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`}
            onClick={() => setActiveTab('issues')}
          >
            <i className="fa-solid fa-bug text-lg"></i>
            <span>Issues</span>
            {issues.length > 0 && <span className="bg-surface-container-highest px-2 py-0.5 rounded-full text-[10px] ml-1">{issues.length}</span>}
          </button>
          <button 
            className={`px-lg py-3 flex items-center gap-xs transition-all whitespace-nowrap ${activeTab === 'ai' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`}
            onClick={() => setActiveTab('ai')}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
            <span>AI Insights</span>
          </button>
          {isOwner && (
            <button 
              className={`px-lg py-3 flex items-center gap-xs transition-all whitespace-nowrap ${activeTab === 'settings' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant font-medium hover:text-primary'}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fa-solid fa-gear text-lg"></i>
              <span>Settings</span>
            </button>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-lg flex-grow">
          {activeTab === "code" && (
            <>
              <aside className="lg:w-72 glass-panel rounded-xl overflow-hidden flex flex-col border border-outline-variant/30">
                <div className="p-md border-b border-outline-variant/30 bg-surface-container-low/50 flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Latest Files</span>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar p-sm">
                  {latestFiles.length === 0 ? (
                    <div className="p-md text-center text-on-surface-variant text-body-sm">
                      No files yet. Use DevRift CLI to push code.
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-0.5">
                      {Object.values(buildFileTree(latestFiles).children)
                        .sort((a, b) => {
                          if (a.isDir && !b.isDir) return -1;
                          if (!a.isDir && b.isDir) return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map(child => (
                          <FileTreeNode key={child.path} node={child} setViewingFile={setViewingFile} level={0} />
                        ))
                      }
                    </div>
                  )}
                </div>
              </aside>
              
              <section className="flex-grow glass-panel rounded-xl flex flex-col border border-outline-variant/30 overflow-hidden min-h-[400px]">
                <div className="p-xl flex flex-col items-center justify-center h-full text-center">
                  <i className="fa-solid fa-laptop-code text-5xl text-on-surface-variant opacity-50 mb-4"></i>
                  <h3 className="font-headline-md text-on-surface mb-2">Select a file to view its code</h3>
                  <p className="text-body-sm text-on-surface-variant max-w-md">
                    Use the file explorer on the left to browse the latest source code from your repository.
                  </p>
                  
                  <div className="mt-xl grid grid-cols-2 gap-md w-full max-w-md">
                    <div className="bg-surface-container p-md rounded-lg border border-outline-variant/20 text-left">
                      <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">Total Commits</p>
                      <h4 className="text-xl font-bold text-primary">{commitsSorted.length}</h4>
                    </div>
                    <div className="bg-surface-container p-md rounded-lg border border-outline-variant/20 text-left">
                      <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">Total Files</p>
                      <h4 className="text-xl font-bold text-secondary">{latestFiles.length}</h4>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "commits" && (
            <section className="flex-grow glass-panel rounded-xl p-lg border border-outline-variant/30 flex flex-col gap-md">
              <h3 className="font-headline-md text-on-surface mb-md">Commit History</h3>
              {commitsSorted.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant">No commits yet.</div>
              ) : (
                <div className="flex flex-col gap-sm">
                  {commitsSorted.map(commit => (
                    <div key={commit.commitId} className="flex flex-col">
                      <div 
                        className="bg-surface-container p-md rounded-xl flex items-center justify-between hover:border-primary/50 border border-transparent transition-all cursor-pointer group"
                        onClick={() => setExpanded(expandedCommit === commit.commitId ? null : commit.commitId)}
                      >
                        <div className="flex items-center gap-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium font-body-md text-body-md group-hover:text-primary transition-colors">{commit.message || "No message"}</span>
                            <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-body-sm mt-1">
                              <span className="font-bold">{repo?.owner?.username || "Developer"}</span>
                              <span>•</span>
                              <span>{timeAgo(commit.timestamp)}</span>
                              <span>•</span>
                              <span>{commit.files?.length || 0} files</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-md">
                          <div className="px-md py-1 bg-surface-container-highest rounded-lg font-label-code text-label-code text-primary-container">
                            {shortId(commit.commitId)}
                          </div>
                          <i className={`fa-solid fa-chevron-${expandedCommit === commit.commitId ? 'up' : 'down'} text-on-surface-variant`}></i>
                        </div>
                      </div>
                      
                      {expandedCommit === commit.commitId && (
                        <div className="ml-md mt-2 mb-4 p-md bg-surface-container-low rounded-lg border-l-2 border-primary">
                          <p className="text-[12px] text-on-surface-variant mb-2">Changed files:</p>
                          <div className="flex flex-wrap gap-2">
                            {commit.files?.map(f => (
                              <button 
                                key={f.s3Key}
                                onClick={() => setViewingFile({ s3Key: f.s3Key, filename: f.filename })}
                                className="px-3 py-1 bg-surface-container-highest hover:bg-primary/20 hover:text-primary transition-colors rounded text-[13px] flex items-center gap-2"
                              >
                                <i className={fileIcon(f.filename)}></i> {f.filename}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "issues" && (
            <section className="flex-grow glass-panel rounded-xl p-lg border border-outline-variant/30 flex flex-col gap-md">
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-headline-md text-on-surface">Issues Tracker</h3>
                <button 
                  onClick={() => setShowNewIssue(!showNewIssue)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${showNewIssue ? 'bg-surface-container-highest text-on-surface' : 'bg-primary text-on-primary hover:brightness-110'}`}
                >
                  {showNewIssue ? "Cancel" : "+ New Issue"}
                </button>
              </div>

              {showNewIssue && (
                <form onSubmit={handleCreateIssue} className="bg-surface-container p-lg rounded-xl mb-md border border-outline-variant/30">
                  <h4 className="text-primary font-bold mb-4">Open New Issue</h4>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Issue Title" 
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface px-4 py-2 rounded focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <textarea 
                      placeholder="Describe the issue in detail..." 
                      value={issueDesc}
                      onChange={(e) => setIssueDesc(e.target.value)}
                      rows={4}
                      className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface px-4 py-2 rounded focus:outline-none focus:border-primary resize-none"
                    ></textarea>
                    <button 
                      type="submit" 
                      disabled={issueLoading || !issueTitle.trim() || !issueDesc.trim()}
                      className="bg-primary text-on-primary py-2 rounded font-bold hover:brightness-110 disabled:opacity-50"
                    >
                      {issueLoading ? "Submitting..." : "Submit Issue"}
                    </button>
                  </div>
                </form>
              )}

              {issues.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant">No open issues. Great job!</div>
              ) : (
                <div className="flex flex-col gap-sm">
                  {issues.map(issue => (
                    <div key={issue._id} className="bg-surface-container p-md rounded-xl flex items-start gap-md border border-transparent hover:border-outline-variant/50 transition-colors">
                      <i className={`fa-regular fa-circle-dot mt-1 ${issue.status === 'closed' ? 'text-tertiary' : 'text-error'}`}></i>
                      <div className="flex-1">
                        {editingIssueId === issue._id ? (
                          <form onSubmit={handleUpdateIssue} className="flex flex-col gap-2 w-full pr-4">
                            <input 
                              type="text" 
                              value={editIssueTitle}
                              onChange={e => setEditIssueTitle(e.target.value)}
                              className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface px-3 py-1.5 rounded text-sm w-full focus:outline-none focus:border-primary"
                            />
                            <textarea 
                              value={editIssueDesc}
                              onChange={e => setEditIssueDesc(e.target.value)}
                              rows={3}
                              className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface px-3 py-1.5 rounded text-sm w-full resize-none focus:outline-none focus:border-primary"
                            ></textarea>
                            <div className="flex gap-2 mt-1">
                              <button type="submit" className="text-xs font-bold bg-primary text-on-primary px-4 py-1.5 rounded hover:brightness-110" disabled={issueLoading}>
                                {issueLoading ? "Saving..." : "Save"}
                              </button>
                              <button type="button" onClick={() => setEditingIssueId(null)} className="text-xs font-bold bg-surface-container-highest text-on-surface hover:bg-surface-container-high px-4 py-1.5 rounded">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold ${issue.status === 'closed' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{issue.title}</h4>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${issue.status === 'closed' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                                {issue.status}
                              </span>
                            </div>
                            <p className="text-body-sm text-on-surface-variant mb-2 whitespace-pre-wrap">{issue.description}</p>
                            <p className="text-[11px] text-outline-variant">Opened {timeAgo(issue.createdAt)}</p>
                          </>
                        )}
                      </div>
                      
                      {isOwner && editingIssueId !== issue._id && (
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => {
                              setEditingIssueId(issue._id);
                              setEditIssueTitle(issue.title);
                              setEditIssueDesc(issue.description);
                            }} 
                            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
                            title="Edit Issue"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          {issue.status === "open" && (
                            <button onClick={() => handleCloseIssue(issue._id)} className="text-xs bg-tertiary/10 text-tertiary px-3 py-1 rounded hover:bg-tertiary/20 transition-colors" title="Close Issue">
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}
                          <button onClick={() => setIssueToDelete(issue._id)} className="text-xs text-on-surface-variant hover:text-error transition-colors" title="Delete Issue">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "ai" && (
            <section className="flex-grow glass-panel rounded-xl p-lg border border-outline-variant/30">
              <h3 className="font-headline-md text-on-surface mb-md">AI Insights Dashboard</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
                <div 
                  className={`bg-surface-container p-lg rounded-xl border-2 transition-all cursor-pointer group ${aiMode === 'explain' ? 'border-primary shadow-[0_0_15px_rgba(175,236,255,0.15)]' : 'border-transparent hover:border-outline-variant/50'}`}
                  onClick={async () => {
                    setAiMode("explain"); setAiError(null);
                    if (aiResult.explain) return;
                    setAiLoading(true);
                    try {
                      const res = await fetch(`${SERVER}/ai/explain/${id}`, { method: "POST" });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || "Explain failed");
                      setAiResult(prev => ({ ...prev, explain: data.explanation }));
                    } catch (err) { setAiError(err.message); } finally { setAiLoading(false); }
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass text-2xl text-primary mb-4 group-hover:scale-110 transition-transform"></i>
                  <h4 className="font-bold text-on-surface mb-2">Explain this Repo</h4>
                  <p className="text-body-sm text-on-surface-variant">Gemini reads your commits, files, and issues to explain what this project does in plain English.</p>
                </div>

                <div 
                  className={`bg-surface-container p-lg rounded-xl border-2 transition-all cursor-pointer group ${aiMode === 'health' ? 'border-secondary shadow-[0_0_15px_rgba(209,188,255,0.15)]' : 'border-transparent hover:border-outline-variant/50'}`}
                  onClick={async () => {
                    setAiMode("health"); setAiError(null);
                    if (aiResult.health) return;
                    setAiLoading(true);
                    try {
                      const res = await fetch(`${SERVER}/ai/health/${id}`);
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || data.message || "Health analysis failed");
                      setAiResult(prev => ({ ...prev, health: data.analysis, healthMetrics: data.metrics }));
                    } catch (err) { setAiError(err.message); } finally { setAiLoading(false); }
                  }}
                >
                  <i className="fa-solid fa-chart-pie text-2xl text-secondary mb-4 group-hover:scale-110 transition-transform"></i>
                  <h4 className="font-bold text-on-surface mb-2">Health Analysis</h4>
                  <p className="text-body-sm text-on-surface-variant">Get a 0–100 health score based on commit frequency, issue resolution rate, and activity.</p>
                </div>

                <div 
                  className={`bg-surface-container p-lg rounded-xl border-2 transition-all cursor-pointer group ${aiMode === 'readme' ? 'border-tertiary shadow-[0_0_15px_rgba(255,180,210,0.15)]' : 'border-transparent hover:border-outline-variant/50'}`}
                  onClick={async () => {
                    setAiMode("readme"); setAiError(null);
                    if (aiResult.readme) return;
                    setAiLoading(true);
                    try {
                      const res = await fetch(`${SERVER}/ai/readme/${id}`);
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || "README generation failed");
                      setAiResult(prev => ({ ...prev, readme: data.readme }));
                    } catch (err) { setAiError(err.message); } finally { setAiLoading(false); }
                  }}
                >
                  <i className="fa-solid fa-file-code text-2xl text-tertiary mb-4 group-hover:scale-110 transition-transform"></i>
                  <h4 className="font-bold text-on-surface mb-2">Generate README</h4>
                  <p className="text-body-sm text-on-surface-variant">Automatically write a beautiful Markdown README.md file for this repository.</p>
                </div>
              </div>

              {aiLoading && (
                <div className="flex flex-col items-center justify-center p-xl gap-4">
                  <i className="fa-solid fa-wand-magic-sparkles fa-bounce text-3xl text-primary"></i>
                  <p className="text-primary font-label-caps uppercase tracking-widest">Gemini is analyzing...</p>
                </div>
              )}

              {aiError && !aiLoading && (
                <div className="bg-error-container/20 text-error p-lg rounded-xl border border-error/50">
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i> {aiError}
                </div>
              )}

              {aiMode === "explain" && aiResult.explain && !aiLoading && (
                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30">
                  <div className="flex justify-between items-center mb-md pb-md border-b border-outline-variant/30">
                    <h4 className="font-bold text-primary"><i className="fa-solid fa-magnifying-glass mr-2"></i> Explanation</h4>
                  </div>
                  <div className="prose prose-invert max-w-none prose-p:text-on-surface-variant">
                    <MarkdownRenderer content={aiResult.explain} />
                  </div>
                </div>
              )}

              {aiMode === "health" && aiResult.health && !aiLoading && (
                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30">
                  {aiResult.healthMetrics && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-md mb-lg pb-lg border-b border-outline-variant/30">
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Score</p><strong className="text-tertiary text-xl">98/100</strong></div>
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Commits</p><strong className="text-on-surface text-xl">{aiResult.healthMetrics.totalCommits}</strong></div>
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Weekly</p><strong className="text-on-surface text-xl">{aiResult.healthMetrics.commitsPerWeek}</strong></div>
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Resolved</p><strong className="text-on-surface text-xl">{aiResult.healthMetrics.issueResolutionRate}%</strong></div>
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Open</p><strong className="text-error text-xl">{aiResult.healthMetrics.openIssues}</strong></div>
                      <div className="text-center"><p className="text-[10px] uppercase text-on-surface-variant mb-1">Latest</p><strong className="text-on-surface text-xl">{aiResult.healthMetrics.filesInLatestCommit} F</strong></div>
                    </div>
                  )}
                  <div className="prose prose-invert max-w-none prose-p:text-on-surface-variant">
                    <MarkdownRenderer content={aiResult.health} />
                  </div>
                </div>
              )}

              {aiMode === "readme" && aiResult.readme && !aiLoading && (
                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30">
                  <div className="flex justify-between items-center mb-md pb-md border-b border-outline-variant/30">
                    <h4 className="font-bold text-tertiary"><i className="fa-solid fa-file-code mr-2"></i> Generated README.md</h4>
                    <button 
                      onClick={() => navigator.clipboard.writeText(aiResult.readme)}
                      className="text-body-sm bg-surface-container-high hover:bg-tertiary/20 text-tertiary px-4 py-1.5 rounded-full transition-colors flex items-center gap-2"
                    >
                      <i className="fa-regular fa-copy"></i> Copy Markdown
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none prose-p:text-on-surface-variant">
                    <MarkdownRenderer content={aiResult.readme} />
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "settings" && isOwner && (
            <section className="flex-grow flex flex-col gap-xl">
              {/* General Settings */}
              <div className="glass-panel rounded-xl p-lg border border-outline-variant/30">
                <h3 className="font-headline-md text-on-surface mb-md pb-sm border-b border-outline-variant/30">General Settings</h3>
                <form onSubmit={handleUpdateRepo} className="flex flex-col gap-4 max-w-xl">
                  <div className="flex flex-col gap-1">
                    <label className="text-body-sm font-bold text-on-surface-variant">Repository Name</label>
                    <input 
                      type="text" 
                      value={editRepoName}
                      onChange={(e) => setEditRepoName(e.target.value)}
                      className="bg-surface-container border border-outline-variant/50 text-on-surface px-4 py-2 rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-body-sm font-bold text-on-surface-variant">Description</label>
                    <textarea 
                      value={editRepoDesc}
                      onChange={(e) => setEditRepoDesc(e.target.value)}
                      rows={3}
                      className="bg-surface-container border border-outline-variant/50 text-on-surface px-4 py-2 rounded focus:outline-none focus:border-primary resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdating || !editRepoName.trim()}
                    className="bg-primary text-on-primary py-2 px-6 rounded font-bold hover:brightness-110 disabled:opacity-50 self-start"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="border border-error/30 bg-error/5 p-lg rounded-xl">
                <div className="flex items-center gap-md mb-md">
                  <i className="fa-solid fa-triangle-exclamation text-error text-xl"></i>
                  <h3 className="font-headline-md text-error m-0">Danger Zone</h3>
                </div>
                
                <div className="flex flex-col gap-md">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-lg py-md border-b border-error/20">
                    <div>
                      <p className="font-bold text-white mb-xs">Change repository visibility</p>
                      <p className="text-body-sm text-on-surface-variant">
                        This repository is currently <strong className="text-white">{repo.visibility ? "Public" : "Private"}</strong>.
                      </p>
                    </div>
                    <button 
                      onClick={handleToggleVisibility}
                      className="px-lg py-sm border border-error text-error rounded-lg font-bold font-label-caps hover:bg-error hover:text-white transition-all whitespace-nowrap"
                    >
                      Change to {repo.visibility ? "Private" : "Public"}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-lg py-md">
                    <div>
                      <p className="font-bold text-white mb-xs">Delete this repository</p>
                      <p className="text-body-sm text-on-surface-variant">Once you delete a repository, there is no going back. Please be certain.</p>
                    </div>
                    <button 
                      onClick={() => setShowDeleteRepoModal(true)}
                      className="px-lg py-sm border border-error text-error rounded-lg font-bold font-label-caps hover:bg-error hover:text-white transition-all whitespace-nowrap"
                    >
                      Delete Repository
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {viewingFile && (
        <FileViewer
          s3Key={viewingFile.s3Key}
          filename={viewingFile.filename}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
};

export default RepoPage;
