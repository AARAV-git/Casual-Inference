'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useUiStore } from '@/store/uiStore';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DashboardPage from '@/components/pages/DashboardPage';
import DatasetsPage from '@/components/pages/DatasetsPage';
import DatasetDetailPage from '@/components/pages/DatasetDetailPage';
import CausalAnalysisPage from '@/components/pages/CausalAnalysisPage';
import CatePage from '@/components/pages/CatePage';
import ItePage from '@/components/pages/ItePage';
import CounterfactualPage from '@/components/pages/CounterfactualPage';
import BehavioralDriftPage from '@/components/pages/BehavioralDriftPage';
import UserDriftPage from '@/components/pages/UserDriftPage';
import ExperimentsPage from '@/components/pages/ExperimentsPage';
import ExperimentDetailPage from '@/components/pages/ExperimentDetailPage';
import PolicyLabPage from '@/components/pages/PolicyLabPage';
import UsersPage from '@/components/pages/UsersPage';
import UserDetailPage from '@/components/pages/UserDetailPage';
import ModelsPage from '@/components/pages/ModelsPage';
import ModelDetailPage from '@/components/pages/ModelDetailPage';
import ResearchPage from '@/components/pages/ResearchPage';

function parseRoute(hash: string) {
  const path = hash.replace('#', '') || '/dashboard';
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'datasets' && segments[1]) return { page: 'dataset-detail', id: segments[1] };
  if (segments[0] === 'causal-analysis' && segments[1] === 'cate') return { page: 'cate' };
  if (segments[0] === 'causal-analysis' && segments[1] === 'ite' && segments[2]) return { page: 'ite', id: segments[2] };
  if (segments[0] === 'behavioral-drift' && segments[1] === 'users' && segments[2]) return { page: 'user-drift', id: segments[2] };
  if (segments[0] === 'experiments' && segments[1]) return { page: 'experiment-detail', id: segments[1] };
  if (segments[0] === 'users' && segments[1]) return { page: 'user-detail', id: segments[1] };
  if (segments[0] === 'models' && segments[1]) return { page: 'model-detail', id: segments[1] };

  const pageMap: Record<string, string> = {
    'dashboard': 'dashboard',
    'datasets': 'datasets',
    'causal-analysis': 'causal-analysis',
    'counterfactual': 'counterfactual',
    'behavioral-drift': 'behavioral-drift',
    'experiments': 'experiments',
    'policy-lab': 'policy-lab',
    'users': 'users',
    'models': 'models',
    'research': 'research',
  };

  return { page: pageMap[segments[0]] || 'dashboard' };
}

function Router() {
  const [route, setRoute] = useState<{ page: string; id?: string }>({ page: 'dashboard' });
  const { sidebarCollapsed } = useUiStore();

  const handleHash = useCallback(() => {
    setRoute(parseRoute(typeof window !== 'undefined' ? window.location.hash : '#/dashboard'));
  }, []);

  useEffect(() => {
    const onHash = () => handleHash();
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = '#/dashboard';
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, [handleHash]);

  const renderPage = () => {
    switch (route.page) {
      case 'dashboard': return <DashboardPage />;
      case 'datasets': return <DatasetsPage />;
      case 'dataset-detail': return <DatasetDetailPage datasetId={route.id!} />;
      case 'causal-analysis': return <CausalAnalysisPage />;
      case 'cate': return <CatePage />;
      case 'ite': return <ItePage userId={route.id!} />;
      case 'counterfactual': return <CounterfactualPage />;
      case 'behavioral-drift': return <BehavioralDriftPage />;
      case 'user-drift': return <UserDriftPage userId={route.id!} />;
      case 'experiments': return <ExperimentsPage />;
      case 'experiment-detail': return <ExperimentDetailPage experimentId={route.id!} />;
      case 'policy-lab': return <PolicyLabPage />;
      case 'users': return <UsersPage />;
      case 'user-detail': return <UserDetailPage userId={route.id!} />;
      case 'models': return <ModelsPage />;
      case 'model-detail': return <ModelDetailPage modelId={route.id!} />;
      case 'research': return <ResearchPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <div className="flex flex-1">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} min-h-screen`}>
          <TopBar />
          <main className="flex-1 p-6">
            {renderPage()}
          </main>
          <footer className="sticky bottom-0 border-t border-grid-line bg-bg/80 backdrop-blur-md px-6 py-3 flex items-center justify-between text-xs text-text-muted">
            <span>Causal Personalization Under Behavioral Drift</span>
            <span className="font-stat">v0.1.0</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return <Router />;
}
