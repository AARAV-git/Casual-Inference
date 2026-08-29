'use client';

import { useState, useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { ChevronRight } from 'lucide-react';

const HASH_TO_TITLE: Record<string, string> = {
  '#/dashboard': 'Dashboard',
  '#/datasets': 'Datasets',
  '#/causal-analysis': 'Causal Analysis',
  '#/causal-analysis/cate': 'CATE Analysis',
  '#/counterfactual': 'Counterfactual Simulation',
  '#/behavioral-drift': 'Behavioral Drift',
  '#/experiments': 'Experiments',
  '#/policy-lab': 'Policy Lab',
  '#/users': 'Users',
  '#/models': 'Models',
  '#/research': 'Research',
};

function getBreadcrumbs(hash: string) {
  const parts = hash.replace('#', '').split('/').filter(Boolean);
  const crumbs: Array<{ label: string; hash: string }> = [];
  let current = '';
  for (const part of parts) {
    current += '/' + part;
    const h = '#' + current;
    const label = HASH_TO_TITLE[h] || part.charAt(0).toUpperCase() + part.slice(1);
    crumbs.push({ label, hash: h });
  }
  return crumbs;
}

export default function TopBar() {
  const { sidebarCollapsed } = useUiStore();
  const [hash, setHash] = useState('#/dashboard');

  useEffect(() => {
    setHash(window.location.hash || '#/dashboard');
    const onHashChange = () => setHash(window.location.hash || '#/dashboard');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const crumbs = getBreadcrumbs(hash);
  const currentTitle = crumbs[crumbs.length - 1]?.label || 'Dashboard';

  return (
    <header
      className={
        'sticky top-0 z-30 h-14 bg-bg/80 backdrop-blur-md border-b border-grid-line flex items-center px-6 transition-all duration-300 ' +
        (sidebarCollapsed ? 'ml-16' : 'ml-60')
      }
    >
      <nav className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.hash} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-text-muted" />}
            {i < crumbs.length - 1 ? (
              <a
                href={crumb.hash}
                className="text-text-muted hover:text-signal-teal transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="font-heading font-semibold text-text-primary">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
