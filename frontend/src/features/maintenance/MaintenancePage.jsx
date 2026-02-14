import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Trash2, Sparkles, AlertTriangle, RefreshCw,
  Unlink, Archive, CheckSquare, Square, Minus
} from 'lucide-react';
import OrphanCard from './OrphanCard';

const api = axios.create({ baseURL: '/api' });

export default function MaintenancePage() {
  const [orphans, setOrphans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Expand / detail
  const [expandedId, setExpandedId] = useState(null);
  const [detailData, setDetailData] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    loadOrphans();
  }, []);

  const loadOrphans = async () => {
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    try {
      const res = await api.get('/maintenance/orphans');
      setOrphans(res.data);
    } catch (err) {
      setError("Failed to load orphans: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Toggle single checkbox
  const toggleSelect = useCallback((id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Select/deselect all in a category
  const toggleSelectAll = useCallback((items) => {
    const ids = items.map(i => i.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      if (allSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  // Batch delete
  const handleBatchDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`Permanently delete ${count} memories? This cannot be undone.`)) return;

    setBatchDeleting(true);
    const toDelete = [...selectedIds];
    let failed = [];

    for (const id of toDelete) {
      try {
        await api.delete(`/maintenance/orphans/${id}`);
      } catch {
        failed.push(id);
      }
    }

    // Remove successfully deleted from list
    const failedSet = new Set(failed);
    setOrphans(prev => prev.filter(item => !toDelete.includes(item.id) || failedSet.has(item.id)));
    setSelectedIds(new Set(failed));

    if (expandedId && toDelete.includes(expandedId) && !failedSet.has(expandedId)) {
      setExpandedId(null);
    }

    if (failed.length > 0) {
      alert(`${failed.length} of ${count} deletions failed. Failed IDs: ${failed.join(', ')}`);
    }

    setBatchDeleting(false);
  };

  // Expand card
  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!detailData[id]) {
      setDetailLoading(id);
      try {
        const res = await api.get(`/maintenance/orphans/${id}`);
        setDetailData(prev => ({ ...prev, [id]: res.data }));
      } catch (err) {
        setDetailData(prev => ({ ...prev, [id]: { error: err.response?.data?.detail || err.message } }));
      } finally {
        setDetailLoading(null);
      }
    }
  };

  const deprecated = orphans.filter(o => o.category === 'deprecated');
  const orphaned = orphans.filter(o => o.category === 'orphaned');


  // Section header with select-all checkbox
  const renderSectionHeader = (icon, label, color, items) => {
    const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
    const someSelected = items.some(i => selectedIds.has(i.id));

    return (
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => toggleSelectAll(items)}
          className="p-0.5 rounded transition-colors hover:bg-slate-700/30"
          title={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <CheckSquare size={16} className={color} />
          ) : someSelected ? (
            <Minus size={16} className={color} />
          ) : (
            <Square size={16} className="text-slate-600" />
          )}
        </button>
        {icon}
        <h3 className={`text-xs font-bold uppercase tracking-widest ${color}`}>
          {label}
        </h3>
        <span className="text-[11px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-[#07070D] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#0A0A12] border-r border-slate-700/30 flex flex-col p-6">
        <div className="mb-8">
          <div className="w-12 h-12 bg-amber-950/30 rounded-xl flex items-center justify-center border border-amber-800/30 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Sparkles className="text-amber-400" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Brain Cleanup</h1>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            Find and clean up orphan memories — deprecated versions from updates
            and unreachable memories from path deletions.
          </p>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/40">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Deprecated</div>
            <div className="text-3xl font-mono text-amber-400">{deprecated.length}</div>
            <div className="text-slate-500 text-[11px] mt-1">old versions from updates</div>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/40">
            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Orphaned</div>
            <div className="text-3xl font-mono text-rose-400">{orphaned.length}</div>
            <div className="text-slate-500 text-[11px] mt-1">unreachable (no paths)</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07070D] relative overflow-hidden">
        {/* Header with batch actions */}
        <div className="h-14 flex items-center justify-between px-8 border-b border-slate-700/30 bg-[#07070D]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Trash2 size={14} /> Orphan Memories
          </h2>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-rose-900/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 transition-colors disabled:opacity-50"
              >
                {batchDeleting ? (
                  <div className="w-3 h-3 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={13} />
                )}
                Delete {selectedIds.size} selected
              </button>
            )}
            <button
              onClick={loadOrphans}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/40 rounded-full transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-xs tracking-widest uppercase">Scanning for orphans...</span>
            </div>
          ) : error ? (
            <div className="text-rose-400 bg-rose-950/20 border border-rose-800/40 p-6 rounded-lg flex items-center gap-4">
              <AlertTriangle size={24} />
              <div>
                <h3 className="font-bold text-rose-300">Error</h3>
                <p className="text-sm text-rose-400/80">{error}</p>
              </div>
            </div>
          ) : orphans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-6 select-none">
              <Sparkles size={64} className="opacity-30" />
              <p className="text-lg font-light text-slate-500">System Clean</p>
              <p className="text-xs uppercase tracking-widest text-slate-600">No orphan memories detected</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Deprecated Section */}
              {deprecated.length > 0 && (
                <section>
                  {renderSectionHeader(
                    <Archive size={16} className="text-amber-400/80" />,
                    "Deprecated Versions",
                    "text-amber-400/80",
                    deprecated
                  )}
                  <div className="space-y-2">
                    {deprecated.map(item => (
                      <OrphanCard
                        key={item.id}
                        item={item}
                        isExpanded={expandedId === item.id}
                        detail={detailData[item.id]}
                        isLoading={detailLoading === item.id}
                        isChecked={selectedIds.has(item.id)}
                        onExpand={handleExpand}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Orphaned Section */}
              {orphaned.length > 0 && (
                <section>
                  {renderSectionHeader(
                    <Unlink size={16} className="text-rose-400/80" />,
                    "Orphaned Memories",
                    "text-rose-400/80",
                    orphaned
                  )}
                  <div className="space-y-2">
                    {orphaned.map(item => (
                      <OrphanCard
                        key={item.id}
                        item={item}
                        isExpanded={expandedId === item.id}
                        detail={detailData[item.id]}
                        isLoading={detailLoading === item.id}
                        isChecked={selectedIds.has(item.id)}
                        onExpand={handleExpand}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
