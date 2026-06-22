import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import HeatMapProfile from "./HeatMapProfile";
import { useAuth } from "../../authContext";
import Layout from "../layout/Layout";
import toast from 'react-hot-toast';
import ConfirmModal from "../layout/ConfirmModal";

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

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "Loading..." });
  const [repositories, setRepositories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const { setCurrentUser } = useAuth();
  
  const currentUserId = localStorage.getItem("userId");
  const targetUserId = id || currentUserId;
  const isOwnProfile = currentUserId === targetUserId;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (targetUserId) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/userprofile/${targetUserId}`);
          setUserDetails(response.data);
          setEditName(response.data.username);
        } catch (err) {
        }
      }
    };
    
    const fetchUserRepositories = async () => {
      if (targetUserId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/repo/user/${targetUserId}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          const data = await response.json();
          setRepositories(data.repositories || []);
        } catch (err) {
        }
      }
    };

    fetchUserDetails();
    fetchUserRepositories();
  }, [targetUserId]);

  const recentActivities = useMemo(() => {
    let activities = [];
    
    repositories.forEach(repo => {
      if (repo.createdAt) {
        activities.push({
          id: `repo-${repo._id}`,
          type: "repo_created",
          message: `Created repository`,
          target: repo.name,
          date: new Date(repo.createdAt),
          link: `/repo/${repo._id}`
        });
      }

      if (repo.commits && Array.isArray(repo.commits)) {
        repo.commits.forEach(commit => {
          if (commit.timestamp) {
            activities.push({
              id: `commit-${commit.commitId}`,
              type: "commit",
              message: `Pushed a commit to`,
              target: repo.name,
              detail: commit.message,
              date: new Date(commit.timestamp),
              link: `/repo/${repo._id}`
            });
          }
        });
      }

      if (repo.issues && Array.isArray(repo.issues)) {
        repo.issues.forEach(issue => {
          if (issue.createdAt) {
            activities.push({
              id: `issue-${issue._id}`,
              type: "issue",
              message: `Opened an issue in`,
              target: repo.name,
              detail: issue.title,
              date: new Date(issue.createdAt),
              link: `/repo/${repo._id}`
            });
          }
        });
      }
    });

    activities.sort((a, b) => b.date - a.date);
    
    return activities;
  }, [repositories]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || editName === userDetails.username) {
      setIsEditing(false);
      return;
    }
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/updateprofile/${currentUserId}`, {
        username: editName.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUserDetails(response.data.value || response.data || { ...userDetails, username: editName.trim() });
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/deleteprofile/${currentUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      handleLogout();
    } catch (err) {
      toast.error("Failed to delete account.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const isFollowing = useMemo(() => {
    return userDetails.followers?.includes(currentUserId);
  }, [userDetails.followers, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast.error("Please login to follow users.");
      return;
    }
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await axios.post(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        followerId: currentUserId,
        targetUserId: targetUserId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setUserDetails(prev => {
        const newFollowers = isFollowing 
          ? prev.followers.filter(id => id !== currentUserId)
          : [...(prev.followers || []), currentUserId];
        return { ...prev, followers: newFollowers };
      });
      toast.success(isFollowing ? "Unfollowed" : "Following");
    } catch (err) {
      toast.error("Failed to update follow status.");
    }
  };

  return (
    <Layout showSearch={false}>
      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Account"
        message="Are you entirely sure you want to delete your account? All your repositories and data will be permanently removed. This cannot be undone."
        confirmLabel="Delete My Account"
        danger={true}
      />

      {/* Top Header Profile Section */}
      <header className="relative w-full pt-12 pb-8 px-lg md:px-2xl border-b border-outline-variant/30">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-xl max-w-7xl mx-auto">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl bg-surface-container-high flex items-center justify-center avatar-glow">
              {userDetails.avatar ? (
                <img src={userDetails.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-user text-6xl text-on-surface-variant"></i>
              )}
            </div>
            {isOwnProfile && (
              <button className="absolute -bottom-2 -right-2 bg-surface-container-high border border-outline-variant p-2 rounded-lg hover:text-primary transition-colors">
                <i className="fa-solid fa-camera text-lg"></i>
              </button>
            )}
          </div>
          {/* Name & Primary Actions */}
          <div className="flex-1 text-center md:text-left">
            {isEditing && isOwnProfile ? (
              <div className="mb-sm flex items-center gap-sm justify-center md:justify-start">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-surface-container-highest border border-primary px-3 py-1 rounded text-white font-headline-lg focus:outline-none"
                  autoFocus
                />
                <button onClick={handleUpdateProfile} className="bg-primary text-on-primary px-3 py-1 rounded font-bold text-sm">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-on-surface-variant px-3 py-1 text-sm hover:text-white">Cancel</button>
              </div>
            ) : (
              <h2 className="font-headline-lg text-headline-lg text-white mb-xs">{userDetails.username}</h2>
            )}
            <p className="text-on-surface-variant font-body-md mb-md">DevRift Explorer</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-lg mb-md">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-primary">{repositories.length}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant/60">Repositories</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-primary">{userDetails.followers?.length || 0}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant/60">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-primary">{userDetails.followedUser?.length || 0}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant/60">Following</span>
              </div>
            </div>
          </div>
          <div className="flex gap-md">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-lg py-sm border border-primary text-primary rounded-lg font-bold font-label-caps text-label-caps hover:bg-primary/10 transition-all flex items-center gap-xs"
                >
                  <i className="fa-solid fa-pen text-sm"></i>
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-md py-sm bg-surface-container-high border border-outline-variant rounded-lg hover:text-error transition-colors text-on-surface-variant"
                  title="Logout"
                >
                  <i className="fa-solid fa-right-from-bracket text-lg"></i>
                </button>
              </>
            ) : (
              <button 
                onClick={handleFollowToggle}
                className={`px-lg py-sm border rounded-lg font-bold font-label-caps text-label-caps transition-all flex items-center gap-xs ${
                  isFollowing 
                    ? "border-outline-variant text-on-surface-variant hover:bg-error/10 hover:border-error hover:text-error" 
                    : "border-primary bg-primary text-on-primary hover:bg-primary/90"
                }`}
              >
                <i className={`fa-solid ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'} text-sm`}></i>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-lg md:px-2xl py-xl grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Left Content: Heatmap & Repos */}
        <div className="lg:col-span-8 space-y-xl">
          {/* Contribution Heatmap Section */}
          <section className="glass-panel p-lg rounded-xl">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-white">Contributions in {new Date().getFullYear()}</h3>
              <div className="flex items-center gap-xs text-xs text-on-surface-variant">
                <span>Less</span>
                <div className="flex gap-[2px]">
                  <div className="w-3 h-3 bg-surface-container-high rounded-[1px]"></div>
                  <div className="w-3 h-3 bg-primary/20 rounded-[1px]"></div>
                  <div className="w-3 h-3 bg-primary/50 rounded-[1px]"></div>
                  <div className="w-3 h-3 bg-primary rounded-[1px]"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            <HeatMapProfile repositories={repositories} />
          </section>

          {/* Repositories Section */}
          <section>
            <h3 className="font-headline-md text-headline-md text-white mb-lg">{isOwnProfile ? "Your" : userDetails.username + "'s"} Repositories</h3>
            {repositories.length === 0 ? (
              <div className="text-center py-xl text-on-surface-variant glass-panel rounded-xl">
                <p>No repositories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {repositories.map(repo => (
                  <Link key={repo._id} to={`/repo/${repo._id}`} className="glass-panel p-lg rounded-xl flex flex-col h-full group hover:border-primary/50 transition-colors">
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
                      <div className="flex items-center gap-1 text-[11px] font-label-code text-on-surface-variant">
                        <i className="fa-solid fa-code-commit text-[14px]"></i>
                        {repo.commits?.length || 0} commits
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Danger Zone */}
          {isOwnProfile && (
            <section className="border border-error/30 bg-error/5 p-lg rounded-xl mt-xl">
              <div className="flex items-center gap-md mb-md">
                <i className="fa-solid fa-triangle-exclamation text-error text-xl"></i>
                <h3 className="font-headline-md text-headline-md text-error">Danger Zone</h3>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-lg">
                <div>
                  <p className="font-bold text-white mb-xs">Delete this account</p>
                  <p className="text-body-sm text-on-surface-variant">Once you delete an account, there is no going back. Please be certain.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-lg py-sm border border-error text-error rounded-lg font-bold font-label-caps text-label-caps hover:bg-error hover:text-white transition-all whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-xl">
          {/* Activity Feed */}
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-headline-md text-headline-md text-white mb-lg">Recent Activity</h3>
            <div className="space-y-lg relative before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-[1px] before:bg-outline-variant/30">
              {recentActivities.length === 0 ? (
                <div className="relative pl-7 text-body-sm text-on-surface-variant">
                  No recent activity found.
                </div>
              ) : (
                recentActivities.slice(0, showAllActivity ? recentActivities.length : 10).map((activity) => (
                  <div key={activity.id} className="relative pl-7">
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                    <p className="text-body-sm text-on-surface leading-tight">
                      {activity.message} <Link to={activity.link} className="font-label-code text-primary hover:underline">{activity.target}</Link>
                    </p>
                    {activity.detail && (
                      <p className="text-body-sm text-on-surface-variant mt-1 border-l-2 border-outline-variant/30 pl-2 ml-1">
                        {activity.detail}
                      </p>
                    )}
                    <p className="text-[10px] text-on-surface-variant font-label-caps mt-1">
                      {timeAgo(activity.date)}
                    </p>
                  </div>
                ))
              )}
              
              <div className="relative pl-7">
                <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-surface-container-high border-4 border-surface-container-lowest"></div>
                <p className="text-body-sm text-on-surface leading-tight">Joined <span className="font-label-code">DevRift</span></p>
                <p className="text-[10px] text-on-surface-variant font-label-caps mt-1">A while ago</p>
              </div>
            </div>
            
            {recentActivities.length > 10 && (
              <button 
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="mt-md w-full py-2 bg-surface-container-high hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-lg text-sm font-medium transition-colors"
              >
                {showAllActivity ? "Show Less" : "View All Activity"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default Profile;
