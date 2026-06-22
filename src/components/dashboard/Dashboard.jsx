import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

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

const FeedCard = ({ repo }) => (
  <div className="glass-panel p-lg rounded-xl flex flex-col gap-sm border border-outline-variant/30 hover:border-primary/30 transition-colors">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-md">
        <Link to={`/profile/${repo.owner?._id}`} className="w-10 h-10 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
          {repo.owner?.avatar
            ? <img src={repo.owner.avatar} alt={repo.owner.username} className="w-full h-full object-cover" />
            : <i className="fa-solid fa-user text-on-surface-variant"></i>
          }
        </Link>
        <div>
          <Link to={`/profile/${repo.owner?._id}`} className="font-bold text-white hover:underline text-sm">
            {repo.owner?.username || "Unknown User"}
          </Link>
          <p className="text-[11px] text-on-surface-variant">created a new repository</p>
        </div>
      </div>
      <span className="text-[11px] text-on-surface-variant font-label-code">
        {timeAgo(repo.createdAt) || "recently"}
      </span>
    </div>

    <div className="mt-md pl-14">
      <Link to={`/repo/${repo._id}`} className="block glass-panel p-md rounded-lg border border-outline-variant/50 hover:bg-surface-container-high transition-colors group">
        <div className="flex items-center gap-2 mb-xs">
          <i className="fa-solid fa-folder-open text-primary"></i>
          <h4 className="font-headline-md text-on-surface group-hover:text-primary transition-colors m-0 text-base">{repo.name}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-label-caps uppercase border ml-auto ${repo.visibility ? "border-primary/40 text-primary bg-primary/5" : "border-secondary/40 text-secondary bg-secondary/5"}`}>
            {repo.visibility ? "Public" : "Private"}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant mb-md">
          {repo.description || "No description provided."}
        </p>
        <div className="flex gap-md items-center text-[11px] font-label-code text-on-surface-variant">
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-code-commit"></i>
            {repo.commits?.length ?? 0} commits
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-circle-exclamation"></i>
            {repo.issues?.length ?? 0} issues
          </div>
        </div>
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  const [feed, setFeed] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/repo/all`);
        const repos = await response.json();
        
        const currentUserId = localStorage.getItem("userId");
        const publicFeed = repos.filter(r => r.visibility || r.owner?._id === currentUserId);
        
        publicFeed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        setFeed(publicFeed);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const searchResults = searchQuery === ""
    ? feed
    : feed.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        repo.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <Layout 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      showSearch={true}
      onRepoCreated={(newRepo) => {
        setFeed((prev) => [newRepo, ...prev]);
      }}
    >
      <div className="max-w-4xl mx-auto py-xl">
        {/* Welcome Banner */}
        <section className="glass-panel p-xl rounded-xl mb-xl flex flex-col md:flex-row gap-xl items-center relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">DevRift Activity Feed</h2>
            <p className="text-body-md text-on-surface-variant max-w-lg">Discover new projects and updates from developers across the platform.</p>
          </div>
        </section>

        {/* Global Feed */}
        <section>
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-md text-headline-md text-white">Recent Activity</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-2xl gap-4">
              <i className="fa-solid fa-circle-notch fa-spin text-primary text-4xl"></i>
              <p className="text-on-surface-variant">Loading activity feed...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-2xl glass-panel rounded-xl border border-outline-variant/30">
              <i className="fa-solid fa-satellite-dish text-4xl text-on-surface-variant mb-4"></i>
              <h3 className="font-headline-md text-white mb-2">It's quiet out here...</h3>
              <p className="text-on-surface-variant">No activity matches your search. Explore and follow developers to see updates.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {searchResults.slice(0, visibleCount).map((repo, index) => (
                <div
                  key={repo._id}
                  className="feed-card-animated"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <FeedCard repo={repo} />
                </div>
              ))}
              
              {searchResults.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="w-full py-md mt-md rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all font-label-caps text-label-caps bg-surface-container-low/50 hover:bg-surface-container-high"
                >
                  Load More Activity
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
