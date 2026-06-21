import React, { useState, useEffect } from "react";
import { useAuth } from "../../authContext";
import NotificationBell from "./NotificationBell";

const TopHeader = ({ searchQuery, setSearchQuery, showSearch = true, onMenuClick }) => {
  const userId = localStorage.getItem("userId");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3000/userprofile/${userId}`)
        .then(res => res.json())
        .then(data => setUserProfile(data))
    }
  }, [userId]);

  const username = userProfile?.username || (userId ? "Developer" : "Guest");

  return (
    <header className="flex justify-between items-center mb-xl">
      <div className="flex items-center gap-md w-full sm:w-auto">
        <button 
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
          onClick={onMenuClick}
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        {showSearch && (
          <div className="relative group flex-1 sm:flex-none">
            <input 
              className="bg-surface-container-highest border border-outline-variant/30 text-on-surface text-body-sm px-xl py-2 rounded-full w-full sm:w-64 focus:outline-none focus:border-primary transition-all" 
              placeholder="Search resources..." 
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-lg">
        <NotificationBell />
        
        <div className="flex items-center gap-md">
          <div className="text-right hidden sm:block">
            <p className="text-body-sm font-bold text-on-surface leading-none">{username}</p>
            <p className="text-[10px] text-on-surface-variant font-label-caps">Maintainer</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 flex items-center justify-center bg-surface-container overflow-hidden">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <i className="fa-solid fa-user text-primary" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
