import React from 'react';
import {
  ChevronDown, ChevronUp, ArrowRight, Unlink, Archive, CheckSquare, Square
} from 'lucide-react';
import { format } from 'date-fns';
import DiffViewer from '../../components/DiffViewer';

export default function OrphanCard({
  item,
  isExpanded,
  detail,
  isLoading,
  isChecked,
  onExpand,
  onToggleSelect
}) {
  return (
    <div className="group relative bg-[#0C0C16] border border-slate-700/40 hover:border-slate-600/60 rounded-lg transition-all">
      {/* Clickable Card Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => onExpand(item.id)}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => onToggleSelect(item.id, e)}
          className="mt-0.5 flex-shrink-0 p-0.5 rounded transition-colors hover:bg-slate-700/30"
        >
          {isChecked ? (
            <CheckSquare size={18} className="text-indigo-400" />
          ) : (
            <Square size={18} className="text-slate-600 group-hover:text-slate-500" />
          )}
        </button>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Top row: badges + time */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
              #{item.id}
            </span>
            {item.category === 'deprecated' ? (
              <span className="text-[10px] font-mono text-amber-300 bg-amber-900/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Archive size={9} /> deprecated
              </span>
            ) : (
              <span className="text-[10px] font-mono text-rose-300 bg-rose-900/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Unlink size={9} /> orphaned
              </span>
            )}
            {item.migrated_to && (
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/30 px-1.5 py-0.5 rounded">
                → #{item.migrated_to}
              </span>
            )}
            <span className="text-[11px] text-slate-500">
              {item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : 'Unknown'}
            </span>
          </div>

          {/* Migration target paths */}
          {item.migration_target && item.migration_target.paths.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <ArrowRight size={12} className="text-indigo-400/70 flex-shrink-0" />
              {item.migration_target.paths.map((p, i) => (
                <span key={i} className="text-[11px] font-mono text-indigo-300/90 bg-indigo-900/25 px-1.5 py-0.5 rounded border border-indigo-800/30">
                  {p}
                </span>
              ))}
            </div>
          )}
          {item.migration_target && item.migration_target.paths.length === 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowRight size={12} className="text-slate-500 flex-shrink-0" />
              <span className="text-[11px] text-slate-500 italic">
                target #{item.migration_target.id} also has no paths
              </span>
            </div>
          )}

          {/* Content snippet */}
          <div className="bg-slate-900/60 rounded p-2.5 text-[12px] text-slate-400 font-mono leading-relaxed line-clamp-3">
            {item.content_snippet}
          </div>
        </div>

        {/* Expand indicator */}
        <div className="mt-1 flex-shrink-0 text-slate-500">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="border-t border-slate-700/30 p-5 bg-[#09090F]">
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-500 py-4">
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="text-xs">Loading full content...</span>
            </div>
          ) : detail?.error ? (
            <div className="text-rose-400 text-xs py-2">Error: {detail.error}</div>
          ) : detail ? (
            <div className="space-y-4">
              {/* Full content */}
              <div>
                <h4 className="text-[11px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">
                  {detail.migration_target ? 'Old Version (This Memory)' : 'Full Content'}
                </h4>
                <div className="bg-[#060610] rounded p-4 border border-slate-800/60 text-[12px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                  {detail.content}
                </div>
              </div>

              {/* Diff with migration target */}
              {detail.migration_target && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest text-slate-500 mb-2 font-semibold flex items-center gap-2">
                    <span>Diff: #{item.id} → #{detail.migration_target.id}</span>
                    {detail.migration_target.paths.length > 0 && (
                      <span className="text-indigo-400/70 normal-case tracking-normal font-normal">
                        ({detail.migration_target.paths[0]})
                      </span>
                    )}
                  </h4>
                  <div className="bg-[#060610] rounded border border-slate-800/60 p-4 max-h-96 overflow-y-auto custom-scrollbar">
                    <DiffViewer
                      oldText={detail.content}
                      newText={detail.migration_target.content}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
