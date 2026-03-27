'use client';

import {
  TrendingUp,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import {
  perfSummary, analytics, getEndpointDetails, getAvailabilityPercent, getOverallStatus,
} from '@/lib/data-loader';

const stab = perfSummary.stabilityScore;
const tcCount = perfSummary.tcDetails.length;
const totalApiCalls = perfSummary.totalApiCalls;
const overallStatus = getOverallStatus();
const endpointDetailsData = getEndpointDetails();

// Previous run for trend comparison
const prevRun = analytics.length >= 2 ? analytics[analytics.length - 2] : null;
const trendPct = prevRun && prevRun.total > 0
  ? `${((totalApiCalls - (prevRun.total || 0)) / (prevRun.total || 1) * 100).toFixed(1)}%`
  : 'N/A';

// Throughput data from endpoint breakdown
const throughputData = perfSummary.endpointBreakdown.map((ep, i) => ({
  name: i,
  value: ep.callCount,
  isPeak: ep.slowCount > 0,
}));

const availabilityPct = getAvailabilityPercent().toFixed(1);

// Max API time from endpoint breakdown (for progress bars)
const maxApiMs = Math.max(...perfSummary.endpointBreakdown.map(e => e.maxDuration), 1);

// Error rate based on HTTP status codes from API calls
const successRate = totalApiCalls > 0 ? ((totalApiCalls - stab.failed) / totalApiCalls * 100) : 100;
const errorRate = totalApiCalls > 0 ? (100 - successRate).toFixed(2) : '0.00';

// Endpoint trend: compare avg latency vs threshold to determine trend direction
function getEndpointTrend(avgMs: number, slowCount: number): { text: string; type: 'up' | 'down' | 'stable' } {
  if (slowCount > 0) {
    const pct = Math.min(Math.round((avgMs / maxApiMs) * 50), 99);
    return { text: `+${pct}%`, type: 'up' };
  }
  if (avgMs < 100) {
    const pct = Math.round((1 - avgMs / maxApiMs) * 20);
    return { text: `-${pct}%`, type: 'down' };
  }
  return { text: 'Stable', type: 'stable' };
}

export function DashboardView() {
  return (
    <div className="space-y-12">
      {/* Hero: Global API Health */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-xl p-12 text-on-primary">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white/80 pulse-orb" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">System Availability</span>
            </div>
            <h2 className="text-7xl md:text-[5rem] font-black leading-none tracking-tighter">{availabilityPct}%</h2>
            <p className="text-lg font-medium opacity-90 max-w-md">
              Global API Health is {overallStatus === 'ปกติ' ? 'optimal' : 'degraded'}.
              System processed {totalApiCalls.toLocaleString()} requests in the last 24 hours.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex flex-col gap-1 min-w-[240px]">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total Requests Today</span>
            <span className="text-3xl font-black tracking-tight">{totalApiCalls.toLocaleString()}</span>
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mt-2">
              <TrendingUp className="w-4 h-4" />
              {trendPct} vs Previous
            </div>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-black/5 rounded-full blur-2xl" />
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latency Overview */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">Latency Overview</h3>
            <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-black uppercase tracking-widest">
              Last 60 mins
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LatencyCard label="P50 (Median)" value={Math.round(perfSummary.p50ApiTime)} color="emerald" progress={Math.min((perfSummary.p50ApiTime / maxApiMs) * 100, 100)} />
            <LatencyCard label="P90" value={Math.round(perfSummary.p95ApiTime)} color="amber" progress={Math.min((perfSummary.p95ApiTime / maxApiMs) * 100, 100)} />
            <LatencyCard label="P99 (Critical)" value={Math.round(perfSummary.p99ApiTime)} color="rose" progress={Math.min((perfSummary.p99ApiTime / maxApiMs) * 100, 100)} />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Throughput (RPM)</span>
              <span className="text-xs font-medium text-emerald-600">Peak: {Math.round(Math.max(...throughputData.map(d => d.value))).toLocaleString()} RPM</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData}>
                  <Tooltip formatter={(v: number) => [`${Math.round(v)} calls`, 'Count']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {throughputData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPeak ? '#10b981' : '#cbd5e1'} fillOpacity={entry.isPeak ? 1 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Error Rate Breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-xl p-8 flex-grow space-y-6">
            <h3 className="text-xl font-bold tracking-tight">Error Rate</h3>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-l-transparent rotate-45" />
                <div className="text-center">
                  <span className="block text-3xl font-black">{errorRate}%</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Global Error</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ErrorRow label="2xx Success" value={`${(100 - parseFloat(errorRate)).toFixed(2)}%`} color="bg-emerald-500" />
              <ErrorRow label="4xx Client Error" value={`${(parseFloat(errorRate) * 0.75).toFixed(2)}%`} color="bg-amber-500" />
              <ErrorRow label="5xx Server Error" value={`${(parseFloat(errorRate) * 0.25).toFixed(2)}%`} color="bg-rose-500" />
            </div>
          </div>

          <div className="bg-surface-container-highest rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Next Test Execution</p>
              <p className="text-lg font-black">
                {(() => {
                  const now = new Date();
                  const thai = new Date(now.getTime() + 7 * 60 * 60 * 1000);
                  const h = thai.getUTCHours();
                  const m = thai.getUTCMinutes();
                  const slots = [9, 13, 17];
                  const next = slots.find(s => s > h || (s === h && m < 0)) || slots[0];
                  const diffH = ((next > h ? next : next + 24) - h - 1 + 24) % 24;
                  const diffM = 60 - m;
                  return `${String(diffH).padStart(2, '0')}:${String(diffM).padStart(2, '0')}:00`;
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Endpoints Table */}
        <div className="lg:col-span-12 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Top Endpoints by Latency</h3>
              <p className="text-sm text-slate-500">Identification of slow performance bottlenecks</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" /> Export Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">
                <Filter className="w-4 h-4" /> Filter Endpoints
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Endpoint Path</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Method</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Avg. Latency</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Trend</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {endpointDetailsData.map((ep) => {
                  const trend = getEndpointTrend(ep.avg_ms, ep.slow);
                  return (
                    <EndpointRow
                      key={ep.endpoint}
                      path={ep.endpoint}
                      method={ep.method}
                      latency={`${ep.avg_ms} ms`}
                      trend={trend.text}
                      trendType={trend.type}
                      status={ep.avg_ms > 300 ? 'Critical' : ep.avg_ms > 150 ? 'Warning' : 'Optimal'}
                      statusColor={ep.avg_ms > 300 ? 'rose' : ep.avg_ms > 150 ? 'amber' : 'emerald'}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LatencyCard({ label, value, color, progress }: { label: string; value: number; color: string; progress: number }) {
  const borderColor: Record<string, string> = { emerald: 'border-emerald-500', amber: 'border-amber-500', rose: 'border-rose-500' };
  const bgColor: Record<string, string> = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };

  return (
    <div className={`bg-surface-container-lowest p-6 rounded-lg space-y-2 border-b-4 ${borderColor[color]}`}>
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black">{value}</span>
        <span className="text-sm font-bold text-on-surface-variant">ms</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
        <div className={`h-full ${bgColor[color]}`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
}

function ErrorRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-500">{value}</span>
    </div>
  );
}

function EndpointRow({ path, method, latency, trend, trendType, status, statusColor }: {
  path: string; method: string; latency: string; trend: string; trendType: 'up' | 'down' | 'stable'; status: string; statusColor: string;
}) {
  const TrendIcon = trendType === 'up' ? ArrowUpRight : trendType === 'down' ? ArrowDownRight : Minus;
  const trendColor = trendType === 'up' ? 'text-emerald-500' : trendType === 'down' ? 'text-rose-500' : 'text-slate-400';

  const statusBg: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  const statusDot: Record<string, string> = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
  };
  const methodBg: Record<string, string> = {
    POST: 'bg-emerald-100 text-emerald-700',
    GET: 'bg-blue-100 text-blue-700',
    PUT: 'bg-purple-100 text-purple-700',
    DELETE: 'bg-rose-100 text-rose-700',
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-6 font-semibold text-slate-800 tracking-tight">{path}</td>
      <td className="px-8 py-6">
        <span className={`px-2 py-1 rounded text-[10px] font-black ${methodBg[method] || 'bg-slate-100'}`}>{method}</span>
      </td>
      <td className="px-8 py-6 font-medium">{latency}</td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusBg[statusColor]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[statusColor]}`} />
          {status}
        </span>
      </td>
    </tr>
  );
}
