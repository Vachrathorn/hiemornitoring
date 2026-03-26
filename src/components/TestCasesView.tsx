'use client';

import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Timer,
  Key,
  Database,
  Lock,
  Network,
  Activity,
  Clock,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { latestRun, tcDetails } from '@/lib/mock-data';

const iconMap: Record<string, typeof Key> = { Key, Database, Lock, Network, Activity };

const iconColorMap: Record<string, string> = {
  Key: 'bg-emerald-50 text-emerald-600',
  Database: 'bg-slate-100 text-slate-600',
  Lock: 'bg-orange-50 text-orange-600',
  Network: 'bg-red-50 text-red-600',
  Activity: 'bg-blue-50 text-blue-600',
};

const passRate = latestRun.tc_total > 0
  ? ((latestRun.tc_passed / latestRun.tc_total) * 100).toFixed(1)
  : '0';

const avgExecTime = latestRun.tc_total > 0
  ? (latestRun.total_duration_s / latestRun.tc_total).toFixed(1)
  : '0';

export function TestCasesView() {
  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-emerald-600">
              {latestRun.environment.toUpperCase()} Environment
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tight">Test Case Results</h3>
          <p className="text-slate-500 font-medium mt-2 flex items-center">
            <Network className="w-4 h-4 mr-2" />
            {latestRun.base_url}
          </p>
        </div>
        <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-xl shadow-emerald-900/10 hover:translate-y-[-2px] transition-all flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SummaryCard label="Total Tests" value={String(latestRun.tc_total)} trend="" progress={100} />
        <SummaryCard label="Passed" value={String(latestRun.tc_passed)} trend={`${passRate}%`} progress={Number(passRate)} color="emerald" />
        <SummaryCard label="Failed" value={String(latestRun.tc_failed)} trend={`${(100 - Number(passRate)).toFixed(1)}%`} progress={100 - Number(passRate)} color="rose" />
        <SummaryCard label="Avg Exec Time" value={avgExecTime} unit="s" progress={Math.min((Number(avgExecTime) / 30) * 100, 100)} color="emerald" />
      </section>

      {/* TC Table */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <h4 className="text-xl font-bold">Detailed Inventory</h4>
          <div className="flex items-center space-x-4">
            <div className="flex bg-surface-container-high p-1 rounded-lg">
              <button className="px-4 py-2 bg-white rounded-md text-xs font-bold shadow-sm">All</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-500">Failed</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-500">Warnings</button>
            </div>
            <button className="flex items-center px-4 py-2 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-xs font-black tracking-widest uppercase text-slate-400">Test Case Name</th>
                <th className="pb-6 text-xs font-black tracking-widest uppercase text-slate-400">Status</th>
                <th className="pb-6 text-xs font-black tracking-widest uppercase text-slate-400">Environment</th>
                <th className="pb-6 text-xs font-black tracking-widest uppercase text-slate-400">Execution Time</th>
                <th className="pb-6 text-xs font-black tracking-widest uppercase text-slate-400">Last Run</th>
                <th className="pb-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tcDetails.map((tc) => {
                const Icon = iconMap[tc.icon] || Activity;
                const iconColor = iconColorMap[tc.icon] || 'bg-slate-100 text-slate-600';
                return (
                  <tr key={tc.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6">
                      <div className="flex items-center space-x-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColor)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{tc.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{tc.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase',
                          tc.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                          tc.status === 'FAIL' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        )}
                      >
                        {tc.status === 'PASS' ? 'PASSED' : tc.status === 'FAIL' ? 'FAILED' : tc.status}
                      </span>
                    </td>
                    <td className="py-6 text-sm font-medium text-slate-500">{latestRun.environment.toUpperCase()}</td>
                    <td className="py-6">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-slate-900">{tc.duration_s}s</span>
                        <div className="ml-4 w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full', tc.duration_s > 15 ? 'bg-amber-400' : 'bg-emerald-400')}
                            style={{ width: `${Math.min((tc.duration_s / 30) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-sm font-medium text-slate-500">
                      {latestRun.timestamp.replace('T', ' ').slice(0, 16)}
                    </td>
                    <td className="py-6 text-right">
                      <button className="text-slate-400 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-emerald-500" />
            <h4 className="text-xl font-bold">Test Execution Schedule</h4>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Scheduler: ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Last Successful Run</p>
              <p className="text-xl font-black text-slate-900">{latestRun.timestamp.replace('T', ' ').slice(11, 16)}</p>
            </div>
          </div>
          <div className="p-6 bg-primary text-on-primary rounded-xl flex items-center space-x-4 shadow-lg shadow-emerald-900/10">
            <div className="p-3 bg-white/20 rounded-full">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-1">Schedule</p>
              <p className="text-xl font-black">09:00 / 13:00 / 17:00</p>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Runs Today</p>
              <p className="text-xl font-black text-slate-900">{latestRun.slot === 'morning' ? '1' : latestRun.slot === 'afternoon' ? '2' : '3'} / 3</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, trend, progress, color, unit }: {
  label: string; value: string; trend?: string; progress: number; color?: string; unit?: string;
}) {
  const colorClass = color === 'emerald' ? 'bg-emerald-500' : color === 'rose' ? 'bg-rose-500' : 'bg-slate-900';
  const trendColor = color === 'rose' ? 'text-rose-500' : 'text-emerald-600';

  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-transparent hover:border-emerald-200/50 transition-all">
      <p className="text-xs font-black tracking-widest uppercase text-on-surface-variant mb-4">{label}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-5xl font-black leading-none">{value}</span>
        {unit && <span className="text-on-surface-variant font-bold text-sm ml-1">{unit}</span>}
        {trend && <span className={cn('font-bold text-sm', trendColor)}>{trend}</span>}
      </div>
      <div className="mt-6 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={cn('h-full', colorClass)} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
}
