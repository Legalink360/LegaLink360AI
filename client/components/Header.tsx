"use client";

import { Bell} from "lucide-react";


export default function Header() {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left - Empty (Sidebar on the left takes this space) */}
      <div />

      {/* Center - Bot Name */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
          LegaLink360 AI
        </h1>
        </div>
      {/* Right - Icons */}
      <div className="flex items-center gap-4">
        <button className="cursor-pointer relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
