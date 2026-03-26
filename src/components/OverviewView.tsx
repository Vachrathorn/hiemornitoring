'use client';

import {
  CheckCircle2,
  Link as LinkIcon,
  RefreshCw,
  Key,
  Database,
  ShieldCheck,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { latestRun, historicalRuns, criticalChecks, getAvailabilityPercent, getEfficiencyScore } from '@/lib/mock-data';

const TARGET_DURATION = 60; // seconds

const trendData = historicalRuns.map((run, i) => ({
  name: run.date?.slice(5) || `R${i}`,
  value: run.total_duration_s || 0,
  isTarget: false,
}));

const availability = getAvailabilityPercent();
const efficiencyScore = getEfficiencyScore();

const checkIcons = [Key, Database, ShieldCheck, Share2];

export function OverviewView() {
  return (
    <div className="space-y-8">
      {/* Hero Section & Status Card */}
      <section className="grid grid-cols-12 gap-8 items-stretch">
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
            System Environment
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mt-2">HIE MONITORING</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="px-3 py-1 bg-surface-container-high rounded-full font-mono text-sm font-bold">
              {latestRun.base_url}
            </span>
            <LinkIcon className="text-primary w-4 h-4" />
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
              Latest Run Timestamp
            </p>
            <p className="text-xl font-bold font-mono">{latestRun.timestamp.replace('T', ' ')}</p>
            <div className="flex items-center gap-2 mt-1 text-emerald-500 font-bold text-xs">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Live Sync Active
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="relative h-full overflow-hidden bg-surface-container-lowest p-1 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-10 flex flex-col items-center justify-center text-center relative z-[1] h-full">
              <div className="mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center pulse-orb">
                <CheckCircle2 className="w-10 h-10 text-primary fill-primary/20" />
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-primary leading-none tracking-tighter">
                {latestRun.overall_status}
              </h2>
              <p className="text-sm mt-4 text-on-surface-variant font-medium max-w-sm">
                วิเคราะห์ผลการทดสอบรอบล่าสุดเสร็จสิ้น ในสภาวะ {latestRun.environment.toUpperCase()} Environment
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <StatusBadge label={`Uptime ${availability}%`} />
                <StatusBadge label={`Latency ${Math.round(latestRun.avg_api_s * 1000)}ms`} />
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 blur-[60px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Main Content: Performance Trend + Status Checks */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-9 bg-surface-container-low rounded-xl p-8 lg:p-12 flex flex-col border border-primary/5 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h3 className="text-3xl font-black tracking-tight">Performance Trend</h3>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">
                Overall Execution Speed (s) — History Analysis
              </p>
            </div>
            <div className="flex gap-6">
              <LegendItem color="bg-primary" label={`Target (${TARGET_DURATION}s)`} />
              <LegendItem color="bg-emerald-400" label="Actual" />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide domain={[0, 80]} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number) => [`${value}s`, 'Duration']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <ReferenceLine y={TARGET_DURATION} stroke="#006c49" strokeDasharray="6 4" strokeWidth={2} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value > TARGET_DURATION ? '#f43f5e' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8">
            <MetricBox label="Fastest Run" value={`${Math.min(...historicalRuns.map(r => r.total_duration_s || 999))}s`} />
            <MetricBox
              label="Average Speed"
              value={`${Math.round(historicalRuns.reduce((a, r) => a + (r.total_duration_s || 0), 0) / historicalRuns.length)}s`}
            />
            <MetricBox
              label="Slowest Peak"
              value={`${Math.max(...historicalRuns.map(r => r.total_duration_s || 0))}s`}
              isError
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-xl p-8 space-y-6 flex-1 border border-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight uppercase">Status Checks</h3>
              <button className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="space-y-2">
              {criticalChecks.map((check, i) => (
                <CheckItem key={check.label} icon={checkIcons[i]} label={check.label} ok={check.ok} />
              ))}
            </div>
          </div>

          <div className="bg-primary p-8 rounded-xl text-on-primary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Efficiency Score</p>
            <p className="text-4xl font-black mt-1">{efficiencyScore}</p>
            <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${efficiencyScore}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <div className="px-6 py-2 bg-surface-container-low rounded-full flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${color}`} />
      <span className="text-xs font-bold uppercase">{label}</span>
    </div>
  );
}

function MetricBox({ label, value, isError }: { label: string; value: string; isError?: boolean }) {
  return (
    <div className="text-center p-4 bg-white/50 rounded-xl">
      <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{label}</p>
      <p className={cn('text-3xl font-black', isError ? 'text-error' : 'text-on-surface')}>{value}</p>
    </div>
  );
}

function CheckItem({ icon: Icon, label, ok }: { icon: typeof Key; label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="font-bold text-xs truncate">{label}</span>
      </div>
      <span
        className={cn(
          'flex-shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ml-3',
          ok ? 'bg-primary text-white' : 'bg-error text-white'
        )}
      >
        {ok ? 'Passed' : 'Failed'}
      </span>
    </div>
  );
}
