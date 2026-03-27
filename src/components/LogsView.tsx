'use client';

import {
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Activity,
  Zap,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { perfSummary, getSystemLogs } from '@/lib/data-loader';
import { useState } from 'react';

const systemLogs = getSystemLogs();
const stab = perfSummary.stabilityScore;
const tcCount = perfSummary.tcDetails.length;

type LogLevel = 'All' | 'Error' | 'Warning' | 'Success' | 'Info';

export function LogsView() {
  const [filter, setFilter] = useState<LogLevel>('All');

  const filteredLogs = filter === 'All'
    ? systemLogs
    : systemLogs.filter(log => log.level === filter);

  const errorCount = systemLogs.filter(l => l.level === 'Error').length;
  const warningCount = systemLogs.filter(l => l.level === 'Warning').length;
  const infoCount = systemLogs.filter(l => l.level === 'Info' || l.level === 'Success').length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <label className="text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
            Internal Diagnostics
          </label>
          <h2 className="text-[3.5rem] font-black leading-none tracking-tighter">System Logs</h2>
        </div>
        <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95 shadow-sm">
          <Download className="w-5 h-5" />
          Export Logs
        </button>
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-8 flex flex-wrap items-center gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Log Level Filter</label>
            <div className="flex gap-2">
              {(['All', 'Error', 'Warning', 'Success', 'Info'] as LogLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-bold transition-all',
                    filter === level
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-lowest text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {level === 'All' ? 'All Levels' : level}
                </button>
              ))}
            </div>
          </div>

          <div className="h-12 w-[1px] bg-slate-200 hidden md:block" />

          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                type="text"
                placeholder="Search logs..."
              />
            </div>
          </div>
        </div>

        {/* Pulse Card */}
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-on-primary flex flex-col justify-between shadow-xl shadow-primary/10">
          <div className="flex justify-between items-start">
            <Zap className="w-8 h-8" />
            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">Latest</span>
          </div>
          <div>
            <p className="text-[2.5rem] font-black leading-none tracking-tighter">{systemLogs.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Events / Run</p>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            Recent Activity
          </h3>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-error rounded-full" /> Error ({errorCount})
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full" /> Warning ({warningCount})
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Info ({infoCount})
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 px-8">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <th className="pb-4 pl-4">Timestamp</th>
                <th className="pb-4">Level</th>
                <th className="pb-4">Source / Service</th>
                <th className="pb-4">Message</th>
                <th className="pb-4 pr-4" />
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="bg-surface-container-lowest rounded-xl group hover:scale-[1.005] transition-transform shadow-sm"
                >
                  <td className="py-5 pl-6 font-mono font-medium text-slate-500 rounded-l-2xl">{log.timestamp}</td>
                  <td className="py-5">
                    <span
                      className={cn(
                        'px-3 py-1 text-[10px] font-black uppercase rounded-full',
                        log.level === 'Error' && 'bg-error-container text-on-error-container',
                        log.level === 'Warning' && 'bg-amber-100 text-amber-800',
                        log.level === 'Success' && 'bg-emerald-100 text-emerald-800',
                        log.level === 'Info' && 'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="py-5 font-bold">{log.source}</td>
                  <td className="py-5 font-mono text-on-surface-variant max-w-md truncate">{log.message}</td>
                  <td className="py-5 pr-6 rounded-r-2xl" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredLogs.length} of {systemLogs.length} total logs
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        <StatCard icon={Activity} label="Total Events" value={String(systemLogs.length)} badge="Latest Run" badgeColor="emerald" badgeDesc="Events from latest test execution" />
        <StatCard icon={Zap} label="Avg. Response Time" value={`${Math.round(perfSummary.avgApiTime)}ms`} badge={perfSummary.avgApiTime <= 500 ? 'Optimal' : perfSummary.avgApiTime <= 1000 ? 'Acceptable' : 'Slow'} badgeColor={perfSummary.avgApiTime <= 500 ? 'emerald' : perfSummary.avgApiTime <= 1000 ? 'amber' : 'rose'} badgeDesc={`ค่าเฉลี่ย API response time จากรอบล่าสุด`} />
        <StatCard icon={CheckCircle2} label="Success Rate" value={`${tcCount > 0 ? ((stab.passed / tcCount) * 100).toFixed(1) : 0}%`} badge={stab.failed > 0 ? 'Failed' : stab.warned > 0 ? 'Warned' : 'Passed'} badgeColor={stab.failed > 0 ? 'rose' : stab.warned > 0 ? 'amber' : 'emerald'} badgeDesc={`${stab.passed}/${tcCount} TC ผ่าน จากรอบล่าสุด`} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, badge, badgeColor = 'emerald', badgeDesc }: {
  icon: typeof Activity; label: string; value: string; badge: string; badgeColor?: string; badgeDesc: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="text-xl font-black">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${colorMap[badgeColor] || colorMap.emerald}`}>
          {badge}
        </span>
        <span className="text-xs text-slate-400 font-medium">{badgeDesc}</span>
      </div>
    </div>
  );
}
