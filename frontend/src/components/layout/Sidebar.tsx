'use client';

import { useState, useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import {
  LayoutDashboard, Database, GitBranch, FlaskConical,
  BookOpen, ChevronLeft, ChevronRight, Users, BarChart3,
  Brain, ArrowRightLeft, Waves, Boxes, FileText, Beaker,
} from 'lucide-react';

interface NavItem {
  label: string;
  hash: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', hash: '#/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Data',
    items: [
      { label: 'Datasets', hash: '#/datasets', icon: Database },
      { label: 'Users', hash: '#/users', icon: Users },
      { label: 'Models', hash: '#/models', icon: Boxes },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: 'Causal Analysis', hash: '#/causal-analysis', icon: GitBranch },
      { label: 'Behavioral Drift', hash: '#/behavioral-drift', icon: Waves },
      { label: 'Counterfactual', hash: '#/counterfactual', icon: ArrowRightLeft },
    ],
  },
  {
    title: 'Lab',
    items: [
      { label: 'Experiments', hash: '#/experiments', icon: FlaskConical },
      { label: 'Policy Lab', hash: '#/policy-lab', icon: Beaker },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Research', hash: '#/research', icon: BookOpen },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const [currentHash, setCurrentHash] = useState('#/dashboard');

  useEffect(() => {
    setCurrentHash(window.location.hash || '#/dashboard');
    const onHashChange = () => setCurrentHash(window.location.hash || '#/dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (hash: string) => {
    window.location.assign(hash);
  };

  return (
    <aside
      className={
        'fixed left-0 top-0 z-40 h-screen bg-[#0D1117] border-r border-grid-line flex flex-col transition-all duration-300 ' +
        (sidebarCollapsed ? 'w-16' : 'w-60')
      }
    >
      <div className="flex items-center h-14 px-4 border-b border-grid-line gap-3">
        <Brain className="w-6 h-6 text-signal-teal shrink-0" />
        {!sidebarCollapsed && (
          <span className="font-heading font-semibold text-text-primary text-sm tracking-wide whitespace-nowrap">
            Causal Lab
          </span>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 bg-surface border border-grid-line rounded-full flex items-center justify-center text-text-muted hover:text-signal-teal transition-colors"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {NAV.map((group) => (
          <div key={group.title} className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {group.title}
                </span>
              </div>
            )}
            {sidebarCollapsed && <div className="mx-3 mb-2 border-t border-grid-line" />}
            {group.items.map((item) => {
              const active = currentHash === item.hash ||
                (item.hash !== '#/dashboard' && currentHash.startsWith(item.hash));
              return (
                <button
                  key={item.hash}
                  onClick={() => navigate(item.hash)}
                  className={
                    'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ' +
                    (active
                      ? 'border-l-2 border-signal-teal text-signal-teal bg-signal-teal/5'
                      : 'border-l-2 border-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover')
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="p-4 border-t border-grid-line">
          <div className="text-[10px] text-text-muted">Demo Mode</div>
          <div className="text-[10px] text-text-muted/60">Placeholder data active</div>
        </div>
      )}
    </aside>
  );
}
