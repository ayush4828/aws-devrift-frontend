import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const SERVER = "http://localhost:3000";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = localStorage.getItem("userId");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${SERVER}/notifications/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
      }
    };
    fetchNotifications();

    const socket = io(SERVER);
    socket.on("connect", () => {
      socket.emit("joinRoom", userId);
    });

    socket.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await fetch(`${SERVER}/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${SERVER}/notifications/user/${userId}/read-all`, { method: "PATCH" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
      >
        <i className="fa-regular fa-bell text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-surface"></span>
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto custom-scrollbar bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/30 rounded-xl shadow-2xl z-50 flex flex-col">
          <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-highest sticky top-0 z-10">
            <h3 className="font-headline-md text-on-surface text-sm m-0">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[11px] text-primary hover:underline font-label-caps uppercase">
                Mark all read
              </button>
            )}
          </div>

          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant text-body-sm flex flex-col items-center gap-2">
                <i className="fa-regular fa-bell-slash text-2xl opacity-50"></i>
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-md border-b border-outline-variant/10 flex items-start gap-md transition-colors ${notif.isRead ? 'opacity-70 bg-transparent' : 'bg-primary/5'}`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <div className="flex-1">
                    <p className="text-body-sm text-on-surface mb-1 leading-snug">
                      <strong className="text-white">{notif.sender?.username || "Someone"}</strong> {notif.message}
                    </p>
                    {notif.link && (
                      <Link to={notif.link} className="text-[11px] text-primary hover:underline font-bold" onClick={() => setShowDropdown(false)}>
                        View Details
                      </Link>
                    )}
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
