"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bell, Check, Package, MessageSquare, Info } from "lucide-react";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../../notifications/req-res";
import type { Notification } from "../../notifications/interfaces";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api-config";
import { useRouter } from "next/navigation";
import Link from "next/link";

let socketInstance: Socket | null = null;

function getSocket(userId: string): Socket {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(API_BASE_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}

interface NotificationBellProps {
  userId: string;
  mode?: "buyer" | "seller";
}

export default function NotificationBell({ userId, mode = "buyer" }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let mounted = true;

    // Load initial notifications
    (async () => {
      try {
        const data = await getMyNotifications();
        if (mounted) setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    })();

    // Setup socket
    const socket = getSocket(userId);
    socket.emit("joinRoom", userId);

    socket.on("notification", (newNotif: Notification) => {
      if (mounted) {
        setNotifications(prev => {
          // Deduplicate
          if (prev.some(n => n._id === newNotif._id)) return prev;
          return [newNotif, ...prev];
        });
      }
    });

    return () => {
      mounted = false;
      socket.off("notification");
    };
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id);
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
      case 'order_delivered':
      case 'order_completed':
      case 'order_status':
        return <Package className="w-4 h-4" />;
      case 'announcement':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    
    // If today, show time, else show date
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isDark = mode === "seller";

  return (
    <div className="relative inline-flex items-center translate-y-px" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 ${isDark ? 'border-[#0b1220]' : 'border-white'}`} />
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-3 w-[340px] rounded-2xl shadow-xl border overflow-hidden z-50 ${isDark ? 'bg-[#15192b] border-white/10' : 'bg-white border-neutral-200'}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-neutral-100'}`}>
            <h3 className={`font-bold text-[14px] ${isDark ? 'text-white' : 'text-neutral-900'}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className={`w-8 h-8 mb-3 opacity-20 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
                <p className={`text-[13px] font-medium ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <div 
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex gap-3 p-4 cursor-pointer transition-colors border-b last:border-b-0 ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-neutral-50 hover:bg-neutral-50'} ${!notif.read ? (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50/50') : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-900'} ${!notif.read ? (isDark ? 'text-indigo-300 bg-indigo-500/20' : 'text-indigo-600 bg-indigo-100') : ''}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold mb-0.5 truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-[12px] leading-relaxed line-clamp-2 ${isDark ? 'text-white/60' : 'text-neutral-500'}`}>
                        {notif.body}
                      </p>
                      <p className={`text-[10px] font-medium mt-1.5 ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="flex-shrink-0 flex items-center justify-center w-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
