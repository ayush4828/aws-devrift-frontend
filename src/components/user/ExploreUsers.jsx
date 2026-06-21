import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../layout/Layout";

const SERVER = "http://localhost:3000";

const ExploreUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const navigate = useNavigate();
  
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${SERVER}/allusers`);
        setUsers(response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (targetUserId) => {
    try {
      await axios.post(`${SERVER}/follow`, {
        followerId: currentUserId,
        targetUserId: targetUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.map(u => {
        if (u._id === targetUserId) {
          return { ...u, followers: [...(u.followers || []), currentUserId] };
        }
        if (u._id === currentUserId) {
          return { ...u, followedUser: [...(u.followedUser || []), targetUserId] };
        }
        return u;
      }));
    } catch (err) {
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await axios.post(`${SERVER}/unfollow`, {
        followerId: currentUserId,
        targetUserId: targetUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.map(u => {
        if (u._id === targetUserId) {
          return { ...u, followers: (u.followers || []).filter(id => id !== currentUserId) };
        }
        if (u._id === currentUserId) {
          return { ...u, followedUser: (u.followedUser || []).filter(id => id !== targetUserId) };
        }
        return u;
      }));
    } catch (err) {
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) && u._id !== currentUserId
  );

  return (
    <Layout showSearch={false}>
      <div className="max-w-5xl mx-auto py-xl space-y-xl">
        <header className="flex flex-col md:flex-row justify-between items-center gap-lg">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-white mb-xs">Explore Developers</h1>
            <p className="text-on-surface-variant font-body-md">Find and follow other developers on DevRift.</p>
          </div>
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search by username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 pl-11 text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"></i>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-2xl gap-4">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-4xl"></i>
            <p className="text-on-surface-variant">Loading developers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-panel rounded-xl p-2xl text-center border border-outline-variant/30">
            <i className="fa-solid fa-users-slash text-4xl text-on-surface-variant mb-4"></i>
            <h3 className="font-headline-md text-white mb-2">No developers found</h3>
            <p className="text-on-surface-variant">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-lg w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {filteredUsers.slice(0, visibleCount).map(user => {
                const isFollowing = user.followers?.includes(currentUserId);
                
                return (
                  <div 
                    key={user._id} 
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="glass-panel rounded-xl p-lg border border-outline-variant/30 flex flex-col items-center text-center group hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-primary/20 bg-surface-container-high flex items-center justify-center mb-md group-hover:border-primary transition-colors overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-user text-3xl text-on-surface-variant"></i>
                      )}
                    </div>
                    <h3 className="font-headline-md text-white font-bold mb-1">{user.username}</h3>
                    <div className="flex items-center gap-4 text-body-sm text-on-surface-variant mb-lg">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{user.repositories?.length || 0}</span>
                        <span className="text-[10px] uppercase tracking-wider">Repos</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{user.followers?.length || 0}</span>
                        <span className="text-[10px] uppercase tracking-wider">Followers</span>
                      </div>
                    </div>
                    
                    <div className="w-full flex mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          isFollowing ? handleUnfollow(user._id) : handleFollow(user._id);
                        }}
                        className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isFollowing ? 'bg-surface-container-highest text-on-surface-variant hover:text-error hover:bg-error/10 border border-outline-variant/30' : 'bg-primary text-on-primary hover:brightness-110 neon-glow'}`}
                      >
                        {isFollowing ? (
                          <><i className="fa-solid fa-user-minus"></i> Unfollow</>
                        ) : (
                          <><i className="fa-solid fa-user-plus"></i> Follow</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredUsers.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="w-full py-md mt-md rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-all font-label-caps text-label-caps bg-surface-container-low/50 hover:bg-surface-container-high"
              >
                Load More Developers
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExploreUsers;
