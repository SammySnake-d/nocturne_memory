import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Folder, 
  Search, 
  Database, 
  Cpu, 
  Hash
} from 'lucide-react';
import axios from 'axios';
import SidebarItem from './components/SidebarItem';
import Breadcrumb from './components/Breadcrumb';
import NodeGridCard from './components/NodeGridCard';
import NodeViewer from './components/NodeViewer';
import NodeEditor from './components/NodeEditor';

// API Instance
const api = axios.create({ baseURL: '/api' });

// --- Main Page ---

export default function MemoryBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const domain = searchParams.get('domain') || 'core';
  const path = searchParams.get('path') || '';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ node: null, children: [], breadcrumbs: [] });
  
  // Edit State
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setEditing(false);
      try {
        const res = await api.get('/browse/node', { params: { domain, path } });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [domain, path]);

  const navigateTo = (newPath, newDomain) => {
    const params = new URLSearchParams();
    params.set('domain', newDomain || domain);
    if (newPath) params.set('path', newPath);
    setSearchParams(params);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (Object.keys(payload).length === 0) {
        // Nothing changed
        setEditing(false);
        return;
      }
      
      await api.put('/browse/node', payload, { params: { domain, path } });
      const res = await api.get('/browse/node', { params: { domain, path } });
      setData(res.data);
      setEditing(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isRoot = !path;
  const node = data.node;

  return (
    <div className="flex h-full bg-[#05050A] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      
      {/* 1. Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 bg-[#08080E] border-r border-slate-800/30 flex flex-col">
        <div className="p-5 border-b border-slate-800/30">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Cpu size={18} />
            <h1 className="font-bold tracking-tight text-sm text-slate-100">Memory Core</h1>
          </div>
          <p className="text-[10px] text-slate-600 pl-6 uppercase tracking-wider">Neural Explorer v2.0</p>
        </div>
        
        <div className="p-3">
             <div className="mb-4">
                 <h3 className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Domains</h3>
                 <SidebarItem 
                    icon={Database} 
                    label="Core Memory" 
                    active={domain === 'core'} 
                    onClick={() => navigateTo('', 'core')} 
                 />
             </div>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800/30">
             <div className="bg-slate-900/50 rounded p-3 border border-slate-800/50">
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Hash size={12} />
                    <span>Current Path</span>
                 </div>
                 <code className="block text-[10px] font-mono text-indigo-300/80 break-all leading-tight">
                    {domain}://{path || 'root'}
                 </code>
             </div>
        </div>
      </div>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#05050A] relative">
         {/* Top Bar */}
         <div className="h-14 flex-shrink-0 border-b border-slate-800/30 flex items-center justify-between px-6 bg-[#05050A]/80 backdrop-blur-md sticky top-0 z-20">
             <Breadcrumb items={data.breadcrumbs} onNavigate={navigateTo} />
             
             <div className="flex items-center gap-2">
                 <div className="relative group">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-slate-400 transition-colors" />
                     <input 
                        type="text" 
                        placeholder="Search nodes..." 
                        disabled
                        className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all w-48 cursor-not-allowed opacity-50"
                     />
                 </div>
             </div>
         </div>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600">
                    <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-xs tracking-widest uppercase">Retrieving Neural Data...</span>
                </div>
            ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-rose-500 gap-4">
                    <p className="text-lg">Access Denied / Error</p>
                    <p className="text-sm opacity-60">{error}</p>
                    <button onClick={() => navigateTo('')} className="text-xs bg-slate-800 px-4 py-2 rounded hover:text-white transition-colors">Return to Root</button>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Node Header & Content (If not root) */}
                    {!isRoot && node && (
                        editing ? (
                          <NodeEditor
                            node={node}
                            onSave={handleSave}
                            onCancel={() => setEditing(false)}
                            saving={saving}
                          />
                        ) : (
                          <NodeViewer
                            node={node}
                            onEdit={() => setEditing(true)}
                          />
                        )
                    )}

                    {/* Children Grid */}
                    {data.children && data.children.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-slate-500">
                                <h2 className="text-xs font-bold uppercase tracking-widest">
                                    {isRoot ? "Memory Clusters" : "Sub-Nodes"}
                                </h2>
                                <div className="h-px flex-1 bg-slate-800/50"></div>
                                <span className="text-xs bg-slate-800/50 px-2 py-0.5 rounded-full">{data.children.length}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {data.children.map(child => (
                                    <NodeGridCard 
                                        key={`${child.domain || domain}:${child.path}`} 
                                        node={child}
                                        currentDomain={domain}
                                        onClick={() => navigateTo(child.path, child.domain)} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Empty State for Children */}
                    {!loading && !data.children?.length && !node && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
                            <Folder size={48} className="opacity-20" />
                            <p className="text-sm">Empty Sector</p>
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
