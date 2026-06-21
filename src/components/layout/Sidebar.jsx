import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onNewRepoClick, isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: "fa-solid fa-table-columns" },
    { name: "My Repositories", path: "/my-repos", icon: "fa-solid fa-folder-open" },
    { name: "Explore", path: "/explore", icon: "fa-solid fa-users" },
    { name: "AI Resume", path: "/ai/resume", icon: "fa-solid fa-wand-magic-sparkles" },
    { name: "Profile", path: "/profile", icon: "fa-solid fa-user" },
  ];

  return (
    <aside 
      style={{height: '100vh'}} 
      className={`fixed left-0 top-0 w-64 bg-surface-container-low border-r border-outline-variant/30 z-40 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="px-lg pt-lg mb-xl flex-shrink-0 flex justify-between items-start">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">DevRift</h1>
          <p className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-[0.2em] mt-1">Advanced Intelligence</p>
        </div>
        <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors" onClick={onClose}>
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <nav className="flex-1 space-y-1 pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-lg py-3 transition-all group ${
                  isActive 
                    ? "text-primary font-bold bg-primary/10 border-r-2 border-primary translate-x-1" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20"
                }`}
              >
                <i className={`${item.icon} mr-md text-lg w-5 text-center`} />
                <span className="font-label-caps text-label-caps">{item.name}</span>
              </Link>
            );
          })}


        </nav>
      </aside>
  );
};

export default Sidebar;
