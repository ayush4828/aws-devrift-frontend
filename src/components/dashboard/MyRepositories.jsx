import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import CreateRepoModal from "../repo/CreateRepoModal";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const RepoCard = ({ repo }) => (
  <Link to={`/repo/${repo._id}`} className="glass-panel p-lg rounded-xl flex flex-col h-full group" style={{ textDecoration: "none" }}>
    <div className="flex justify-between items-start mb-md">
      <h4 className="font-headline-md text-on-surface group-hover:text-primary transition-colors">{repo.name}</h4>
      <span className={`px-2 py-0.5 rounded text-[10px] font-label-caps uppercase border ${repo.visibility ? "border-primary/40 text-primary bg-primary/5" : "border-secondary/40 text-secondary bg-secondary/5"}`}>
        {repo.visibility ? "Public" : "Private"}
      </span>
    </div>
    <p className="text-body-sm text-on-surface-variant flex-1 mb-lg">
      {repo.description || "No description provided."}
    </p>
    <div className="flex items-center justify-between mt-auto pt-md border-t border-outline-variant/30">
      <div className="flex gap-md items-center">
        <div className="flex items-center gap-1 text-[11px] font-label-code text-on-surface-variant">
          <i className="fa-solid fa-code-commit text-[14px]"></i>
          {repo.commits?.length ?? 0}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-label-code text-on-surface-variant">
          <i className="fa-solid fa-clock-rotate-left text-[14px]"></i>
          {repo.lastPushedAt ? timeAgo(repo.lastPushedAt) : "Never"}
        </div>
      </div>
    </div>
  </Link>
);

const MyRepositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, commits: 0 });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${import.meta.env.VITE_API_URL}/repo/user/${userId}`, { headers });
        const data = await response.json();
        const repos = data.repositories || [];
        setRepositories(repos);
        
        let totalCommits = 0;
        repos.forEach(r => { totalCommits += (r.commits?.length || 0); });
        setStats({ total: repos.length, commits: totalCommits });
      } catch (err) {
      }
    };
    fetchRepositories();
  }, []);

  const searchResults = searchQuery === ""
    ? repositories
    : repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <Layout 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      showSearch={true}
    >
      {/* Welcome Banner */}
      <section className="glass-panel p-xl rounded-xl mb-xl flex flex-col md:flex-row gap-xl items-center relative overflow-hidden">
        <div className="relative z-10 flex-1">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">My Repositories</h2>
          <p className="text-body-md text-on-surface-variant max-w-lg">Manage your personal repositories. You currently have {repositories.length} repositories tracked.</p>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <div className="glass-panel p-lg rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">Total Repos</p>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <i className="fa-solid fa-folder-open text-primary text-xl"></i>
          </div>
        </div>
        <div className="glass-panel p-lg rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">Total Commits</p>
            <h3 className="text-headline-lg font-headline-lg text-secondary">{stats.commits}</h3>
          </div>
          <div className="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center">
            <i className="fa-solid fa-code-commit text-secondary text-xl"></i>
          </div>
        </div>

        {/* New Repo Button */}
        <button 
          onClick={() => setShowCreate(true)}
          className="glass-panel p-lg rounded-lg flex flex-col items-center justify-center gap-2 border border-primary/30 hover:bg-primary/10 transition-colors text-primary font-bold neon-glow group"
        >
          <i className="fa-solid fa-plus text-2xl group-hover:scale-110 transition-transform"></i>
          <span className="font-label-caps uppercase text-sm">New Repository</span>
        </button>
      </div>

      {/* Your Repositories */}
      <section>
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface">Your Repositories</h2>
        </div>
        
        {searchResults.length === 0 ? (
          <div className="text-center py-xl text-on-surface-variant glass-panel rounded-xl">
            <p>No repositories found. Create one from the sidebar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {searchResults.map((repo) => (
              <RepoCard key={repo._id} repo={repo} />
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <CreateRepoModal
          onClose={() => setShowCreate(false)}
          onCreated={(newRepo) => {
            setShowCreate(false);
            setRepositories((prev) => [newRepo, ...prev]);
            setStats(s => ({ ...s, total: s.total + 1 }));
          }}
        />
      )}
    </Layout>
  );
};

export default MyRepositories;
