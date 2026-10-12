import React, { useState, useRef, useEffect } from 'react';
import { useAuth, CurrencyCode } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Bell,
  MessageSquare,
  Search,
  User,
  Shield,
  LogOut,
  ChevronDown,
  ShoppingBag,
  Users,
  Briefcase,
  Layers,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';
import { NotificationItem } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenSearch,
}) => {
  const { user, logout, currency, setCurrency } = useAuth();
  const { latestNotification } = useWebSocket();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount((res.notifications || []).filter((n: any) => !n.isRead).length);
        })
        .catch(() => {});
    }
  }, [user, latestNotification]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const navLinks = [
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'connect', label: 'Connect' },
    { id: 'services', label: 'Jobs & Services' },
    { id: 'chat', label: 'Business Chat' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* ZONE 1: BRAND WORDMARK */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008751] to-[#006038] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
                <span>N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#008751] transition-colors whitespace-nowrap">
                  Naija<span className="text-[#008751]">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider hidden sm:inline">
                  Worldwide Platform
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: NAVIGATION LINKS (TOP BAR CONTRACT: Concise, single-line) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-1.5 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-[#008751] font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008751] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: ACTIONS & USER AFFORDANCES */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
              title="Search NaijaHub"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-hidden"
              >
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Notifications Dropdown (If authenticated) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#008751] rounded-full" />
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs font-medium text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-slate-500 hover:text-[#008751] font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                              !notif.isRead ? 'bg-[#008751]/5' : ''
                            }`}
                          >
                            <div className="font-semibold text-slate-800">{notif.title}</div>
                            <div className="text-slate-600 mt-0.5">{notif.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Messages Shortcut (If authenticated) */}
            {user && (
              <button
                onClick={() => onSelectTab('chat')}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
                title="Messages & Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors focus:outline-hidden"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-xs text-slate-900">{user.fullName}</div>
                      <div className="text-[11px] text-slate-500">@{user.username}</div>
                      <div className="text-[10px] text-[#008751] font-semibold mt-0.5 uppercase tracking-wide">
                        {user.role} {user.isVerified ? '· Verified' : ''}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onSelectTab('dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('chat');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>Business Chat & DMs</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            onSelectTab('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 font-semibold hover:bg-emerald-50"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Control Console</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#008751] hover:bg-[#007042] rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  Join NaijaHub
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onSelectTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentTab === link.id
                  ? 'bg-[#008751]/10 text-[#008751] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Currency</span>
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs font-semibold bg-slate-100 rounded-lg px-2 py-1"
            >
              <option value="NGN">₦ NGN (Naira)</option>
              <option value="USD">$ USD (Dollar)</option>
              <option value="GBP">£ GBP (Pound)</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};
