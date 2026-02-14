import React from 'react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
      active
        ? "bg-indigo-500/10 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
        : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
    )}
  >
    <Icon size={16} className={clsx("transition-colors", active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400")} />
    <span className="flex-1 text-left truncate font-medium">{label}</span>
    {count !== undefined && (
      <span className="text-xs bg-slate-800/50 px-1.5 py-0.5 rounded text-slate-600 group-hover:text-slate-500">{count}</span>
    )}
  </button>
);

export default SidebarItem;
