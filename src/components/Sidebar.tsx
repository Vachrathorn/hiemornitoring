'use client';

import {
  LayoutDashboard,
  FlaskConical,
  Activity,
  Terminal,
  MonitorDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/lib/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: typeof MonitorDot }[] = [
  { id: 'overview', label: 'Overview', icon: MonitorDot },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'test-cases', label: 'Test Cases', icon: FlaskConical },
  { id: 'logs', label: 'System Logs', icon: Terminal },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-72 fixed left-0 top-0 rounded-r-[3rem] bg-slate-100 py-8 px-4 gap-4 z-50">
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-primary">HIE Monitoring</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Active</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm tracking-wide text-left',
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:translate-x-1'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">System Health</p>
            <p className="text-sm font-black text-slate-900">99.98% Uptime</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold',
                isActive ? 'text-primary' : 'text-slate-400'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
