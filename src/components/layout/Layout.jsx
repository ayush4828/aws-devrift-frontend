import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import CreateRepoModal from "../repo/CreateRepoModal";
import "../repo/modals.css";

const Layout = ({ children, searchQuery, setSearchQuery, showSearch, onRepoCreated }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface">
      {/* Global Background Elements */}
      <div className="fixed inset-0 grid-pattern pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar 
        onNewRepoClick={() => setShowCreate(true)} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main style={{height: '100vh'}} className="md:ml-64 overflow-y-auto p-lg relative z-10 flex flex-col custom-scrollbar">
        <TopHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          showSearch={showSearch} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-2xl py-xl px-lg flex flex-col sm:flex-row gap-md sm:gap-0 justify-between items-center border-t border-outline-variant/30 text-center sm:text-left">
          <div className="text-primary font-bold text-headline-md">DevRift</div>
          <div className="flex gap-lg">
            <Link className="text-on-surface-variant text-body-sm hover:text-primary underline transition-opacity" to="/status">Status</Link>
            <Link className="text-on-surface-variant text-body-sm hover:text-primary underline transition-opacity" to="/privacy">Privacy</Link>
            <Link className="text-on-surface-variant text-body-sm hover:text-primary underline transition-opacity" to="/terms">Terms</Link>
          </div>
          <div className="text-on-surface-variant text-body-sm">
            © 2026 DevRift AI.
          </div>
        </footer>
      </main>

      {showCreate && (
        <CreateRepoModal
          onClose={() => setShowCreate(false)}
          onCreated={(newRepo) => {
            setShowCreate(false);
            if (onRepoCreated) onRepoCreated(newRepo);
          }}
        />
      )}
    </div>
  );
};

export default Layout;
