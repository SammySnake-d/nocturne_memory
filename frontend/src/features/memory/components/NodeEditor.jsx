import React, { useState, useEffect } from 'react';
import { Save, X, Star, AlertTriangle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import clsx from 'clsx';

const NodeEditor = ({ node, onSave, onCancel, saving }) => {
  const [content, setContent] = useState('');
  const [disclosure, setDisclosure] = useState('');
  const [priority, setPriority] = useState(0);

  useEffect(() => {
    if (node) {
      setContent(node.content || '');
      setDisclosure(node.disclosure || '');
      setPriority(node.priority ?? 0);
    }
  }, [node]);

  const handleSave = () => {
    const payload = {};
    if (content !== (node.content || '')) {
      payload.content = content;
    }
    if (priority !== (node.priority ?? 0)) {
      payload.priority = priority;
    }
    if (disclosure !== (node.disclosure || '')) {
      payload.disclosure = disclosure;
    }
    onSave(payload);
  };

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
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded text-slate-400 transition-colors">
            <X size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Metadata Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl">
        {/* Priority */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Star size={12} />
            Priority
            <span className="text-slate-600 font-normal">(lower = higher priority)</span>
          </label>
          <input
            type="number"
            min="0"
            value={priority}
            onChange={e => setPriority(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        {/* Disclosure */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <AlertTriangle size={12} />
            Disclosure
            <span className="text-slate-600 font-normal">(when to recall)</span>
          </label>
          <input
            type="text"
            value={disclosure}
            onChange={e => setDisclosure(e.target.value)}
            placeholder="e.g. When I need to remember..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Content Editor */}
      <div className={clsx(
        "relative rounded-xl border overflow-hidden transition-all duration-300",
        "bg-slate-900 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
      )}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-96 p-6 bg-transparent text-slate-200 font-mono text-sm leading-relaxed focus:outline-none resize-y"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default NodeEditor;
