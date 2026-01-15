"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, Plus, Settings, LogOut, User, FolderPlus, Search, HelpCircle, Zap, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import UserProfileSettings from "./UserProfileSettings";
import SettingsPage from "./SettingsPage";
import HelpPage from "./HelpPage";
import UpgradePlan from "./UpgradePlan";
import Personalization from "./Personalization";

export type ChatThread = {
  id: string;
  title: string;
  date: string;
};

type SidebarProps = {
  chatHistory?: ChatThread[];
  onNewChat?: () => void;
  onSelectChat?: (threadId: string) => void;
};

export default function Sidebar({ chatHistory = [], onNewChat, onSelectChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const navLinks = [
    { 
      label: "New Chat", 
      icon: Plus, 
      onClick: () => {
        onNewChat?.();
      }
    },
    { label: "New Project", icon: FolderPlus, href: "#" },
    { label: "Search chats", icon: Search, href: "#" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onClick={() => !isOpen && setIsOpen(true)}
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 transition-all duration-300 ease-in-out cursor-pointer ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Section - Logo & Collapse Button */}
        <div className="p-4 border-b border-slate-700">
          {/* Logo and Collapse Button */}
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-3 flex-1 ${!isOpen && "justify-center"}`}>
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo/LegaLink360.jpg"
                  alt="LegaLink360"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              {isOpen && <span className="font-bold text-sm whitespace-nowrap">LegaLink360</span>}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex items-center justify-center cursor-pointer font-bold w-8 h-8 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
              title={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? <ChevronLeft size={18} className="font-bold"/> : <ChevronRight size={18} className="font-bold"/>}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden flex items-center cursor-pointer justify-center w-8 h-8 font-bold rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              {isOpen ? <ChevronLeft size={18} className="font-bold"/> : <ChevronRight size={18} className="font-bold"/>}
            </button>
          </div>

          {/* Navigation Links */}
          {isOpen && (
            <nav className="space-y-2 mt-4">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                const isClickable = link.onClick !== undefined;
                return isClickable ? (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      link.onClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </button>
                ) : (
                  <a
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </nav>
          )}
          
          {/* Collapsed Navigation - Icons Only */}
          {!isOpen && (
            <nav className="space-y-2 mt-4">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a
                    key={idx}
                    href={link.href}
                    className="flex items-center justify-center px-2 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
                    title={link.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        {/* Middle Section - Chat History */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Recent Chats
            </div>
            <div className="space-y-2">
              {chatHistory.length > 0 ? (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChat?.(chat.id);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 truncate"
                    title={chat.title}
                  >
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs text-slate-500">{chat.date}</div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic px-3 py-4">No chat history</div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Section - User Profile (Fixed) */}
        <div className="p-4 border-t border-slate-700 mt-auto">
          {isOpen ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold">John Doe</div>
                  <div className="text-xs text-slate-400">Premium User</div>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => {
                      setShowProfileSettings(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 border-b border-slate-700"
                  >
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 border-b border-slate-700"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPersonalization(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 border-b border-slate-700"
                  >
                    <Palette size={16} />
                    <span>Personalization</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUpgrade(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 border-b border-slate-700"
                  >
                    <Zap size={16} />
                    <span>Upgrade Plan</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowHelp(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-slate-100 border-b border-slate-700"
                  >
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </button>
                  <button
                    onClick={() => {
                      // Handle sign out
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-sm text-red-400 hover:text-red-300"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="w-full flex items-center justify-center h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all"
              title="User Profile"
            >
              <User size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button - Hidden on Desktop */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <Menu size={24} />
        </button>
      )}

      {/* User Profile Settings Modal */}
      <UserProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {/* Settings Modal */}
      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme="dark"
      />

      {/* Help & Support Modal */}
      <HelpPage
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlan
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

      {/* Personalization Modal */}
      <Personalization
        isOpen={showPersonalization}
        onClose={() => setShowPersonalization(false)}
        theme="dark"
      />
    </>  );
}