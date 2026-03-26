'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { OverviewView } from '@/components/OverviewView';
import { DashboardView } from '@/components/DashboardView';
import { TestCasesView } from '@/components/TestCasesView';
import { LogsView } from '@/components/LogsView';
import type { ViewType } from '@/lib/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');

  return (
    <div className="min-h-screen">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main className="md:ml-72 p-6 md:p-12 pb-24 md:pb-12">
        {currentView === 'overview' && <OverviewView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'test-cases' && <TestCasesView />}
        {currentView === 'logs' && <LogsView />}
      </main>
    </div>
  );
}
