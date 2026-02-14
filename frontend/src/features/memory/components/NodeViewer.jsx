import React from 'react';
import { Edit3, AlertTriangle, Link2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const NodeViewer = ({ node, onEdit }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0 flex-1">
          {/* Title + Importance */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {node.name || node.path.split('/').pop()}
            </h1>
            <PriorityBadge priority={node.priority} size="lg" />
          </div>

          {/* Disclosure */}
          {node.disclosure && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950/20 border border-amber-900/30 rounded-lg text-amber-500/80 text-xs max-w-full">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span className="font-medium mr-1">Disclosure:</span>
              <span className="italic truncate">{node.disclosure}</span>
            </div>
          )}

          {/* Aliases */}
          {node.aliases && node.aliases.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Link2 size={13} className="flex-shrink-0 mt-0.5 text-slate-600" />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-slate-600 font-medium">Also reachable via:</span>
                {node.aliases.map(alias => (
                  <code key={alias} className="px-1.5 py-0.5 bg-slate-800/60 rounded text-indigo-400/70 font-mono text-[11px]">
                    {alias}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium transition-colors border border-slate-700 hover:border-slate-600">
            <Edit3 size={16} /> Edit
          </button>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="relative rounded-xl border overflow-hidden transition-all duration-300 bg-[#0A0A12]/50 border-slate-800/50">
        <div className="p-6 md:p-8 prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-serif text-slate-300 leading-7">{node.content}</pre>
        </div>
      </div>
    </div>
  );
};

export default NodeViewer;
