'use client';

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link as LinkIcon,
  Clock,
  Key,
  Database,
  ShieldCheck,
  Globe,
  User,
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
import {
  perfSummary, analytics, getCriticalChecks,
  getAvailabilityPercent, getEfficiencyScore, toThaiTime, getOverallStatus,
  getTrendData, slowThresholdS, type TrendEntry,
} from '@/lib/data-loader';

const TARGET_DURATION = 60; // seconds

// Build trend data with status + tooltip
const trendData = getTrendData(15);

const availability = getAvailabilityPercent();
const efficiencyScore = getEfficiencyScore();
const criticalChecks = getCriticalChecks();

// checkIcons now computed dynamically via criticalCheckIcons below

// Derived values from real data
const siteUrl = perfSummary.webVitals?.url?.replace(/\/console.*/, '') || '';
const lastRunTime = toThaiTime(perfSummary.timestamp);
const overallStatus = getOverallStatus();
const env = perfSummary.metadata.environment;
const avgLatencyMs = Math.round(perfSummary.avgApiTime);
const durations = trendData.map(d => d.value);
const totalRuns = analytics.length;

// Web Vitals
const webVitals = perfSummary.webVitals;
const thresholds = perfSummary.metadata.thresholds;
const ttfb = webVitals?.ttfb ?? 0;
const lcp = webVitals?.lcp ?? 0;
const ttfbGrade = ttfb <= thresholds.ttfbGoodMs ? 'Good' : ttfb <= thresholds.ttfbPoorMs ? 'Needs Improvement' : 'Poor';
const lcpGrade = lcp <= thresholds.lcpGoodMs ? 'Good' : lcp <= thresholds.lcpPoorMs ? 'Needs Improvement' : 'Poor';
const gradeColor = (g: string) => g === 'Good' ? 'text-emerald-600 bg-emerald-50' : g === 'Needs Improvement' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';

// Dynamic status styling (ปกติ = pass + not slow, ช้ากว่าปกติ = pass + slow, ผิดปกติ = has fail)
const statusConfig = (() => {
  switch (overallStatus) {
    case 'ปกติ':
      return { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', fill: 'fill-primary/20' };
    case 'ช้ากว่าปกติ':
      return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', fill: '' };
    case 'ผิดปกติ':
    default:
      return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', fill: '' };
  }
})();

// Map critical endpoint labels to icons
const labelIconMap: Record<string, typeof Key> = {
  'Auth Login': Key,
  'Patient Search': Database,
  'FHIR Data Sync': ShieldCheck,
  'User Profile': User,
};
const criticalCheckIcons = criticalChecks.map(
  (c) => labelIconMap[c.label] || Globe
);

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
              {siteUrl}
            </span>
            <LinkIcon className="text-primary w-4 h-4" />
          </div>
          <div className="mt-6 bg-surface-container-low border border-primary/10 rounded-xl p-5 inline-block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Latest Run
              </p>
            </div>
            <p className="text-2xl font-black font-mono tracking-tight">{lastRunTime}</p>
            <div className="flex items-center gap-2 mt-2 text-on-surface-variant/50 font-bold text-[10px]">
              <Clock className="w-3 h-3" />
              Schedule: 09:00 / 13:00 / 17:00
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="relative h-full overflow-hidden bg-surface-container-lowest p-1 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-10 flex flex-col items-center justify-center text-center relative z-[1] h-full">
              <div className={cn('mb-4 w-16 h-16 rounded-full flex items-center justify-center pulse-orb', statusConfig.bg)}>
                <statusConfig.icon className={cn('w-10 h-10', statusConfig.color, statusConfig.fill)} />
              </div>
              <h2 className={cn('text-5xl lg:text-7xl font-black leading-none tracking-tighter', statusConfig.color)}>
                {overallStatus}
              </h2>
              <p className="text-sm mt-4 text-on-surface-variant font-medium max-w-sm">
                วิเคราะห์ผลการทดสอบรอบล่าสุดเสร็จสิ้น ในสภาวะ {env.toUpperCase()} Environment
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <StatusBadge label={`Uptime ${availability}%`} source="all" count={totalRuns} />
                <StatusBadge label={`Latency ${avgLatencyMs}ms`} source="latest" />
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
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black tracking-tight">Performance Trend</h3>
                <SourceBadge type="history" count={trendData.length} />
              </div>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                แนวโน้มเวลารันทั้งหมด (วินาที)
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <LegendItem color="bg-emerald-500" label="ปกติ" />
              <LegendItem color="bg-amber-400" label="ช้า" />
              <LegendItem color="bg-rose-500" label="ไม่ผ่าน" />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide domain={[0, Math.ceil(Math.max(...durations, TARGET_DURATION) * 1.2)]} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={<CustomTooltip />}
                />
                <ReferenceLine y={slowThresholdS} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Slow (${slowThresholdS}s)`, position: 'right', fontSize: 10, fontWeight: 700, fill: '#f59e0b' }} />
                <ReferenceLine y={TARGET_DURATION} stroke="#006c49" strokeDasharray="6 4" strokeWidth={2} label={{ value: `Target (${TARGET_DURATION}s)`, position: 'right', fontSize: 10, fontWeight: 700, fill: '#006c49' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {trendData.map((entry, index) => {
                    const fillColor = entry.status === 'failed' ? '#f43f5e'
                      : entry.status === 'slow' ? '#f59e0b'
                      : '#10b981';
                    return (
                      <Cell key={`cell-${index}`} fill={fillColor} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-3 gap-8">
            <MetricBox label="เร็วที่สุด" value={`${Math.min(...durations)}s`} />
            <MetricBox
              label="เฉลี่ย"
              value={`${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)}s`}
            />
            <MetricBox
              label="ช้าที่สุด"
              value={`${Math.max(...durations)}s`}
              isError
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-xl p-8 space-y-6 flex-1 border border-slate-200/50">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight uppercase">API Health</h3>
                <SourceBadge type="latest" />
              </div>
              <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">ตรวจสอบ API หลักว่าตอบกลับปกติ</p>
            </div>
            <div className="space-y-2">
              {criticalChecks.map((check, i) => (
                <CheckItem key={check.label} icon={criticalCheckIcons[i]} label={check.label} ok={check.ok} />
              ))}
            </div>
          </div>

          {webVitals && (
            <div className="bg-surface-container-low rounded-xl p-6 border border-slate-200/50 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black tracking-widest uppercase text-on-surface-variant">Web Vitals</h3>
                  <SourceBadge type="latest" />
                </div>
                <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">ความเร็วโหลดหน้าเว็บ</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase">TTFB</p>
                    <p className="text-[9px] text-on-surface-variant/50 font-medium">เวลาตอบกลับแรก</p>
                    <p className="text-xl font-black">{ttfb}ms</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase', gradeColor(ttfbGrade))}>
                    {ttfbGrade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase">LCP</p>
                    <p className="text-[9px] text-on-surface-variant/50 font-medium">เวลาโหลดเนื้อหาหลัก</p>
                    <p className="text-xl font-black">{(lcp / 1000).toFixed(1)}s</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase', gradeColor(lcpGrade))}>
                    {lcpGrade}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-primary p-8 rounded-xl text-on-primary">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Efficiency Score</p>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-white/15 text-white/80">รอบล่าสุด</span>
            </div>
            <p className="text-[10px] font-medium opacity-60 mt-0.5">คะแนนรวม (ผลทดสอบ + ความเร็ว + API)</p>
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

function StatusBadge({ label, source, count }: { label: string; source?: SourceType; count?: number }) {
  const sourceLabel = source === 'all' ? `ทุกรัน (${count})` : source === 'latest' ? 'รอบล่าสุด' : '';
  return (
    <div className="px-5 py-2 bg-surface-container-low rounded-full flex flex-col items-center gap-0.5" title={sourceLabel}>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {sourceLabel && (
        <span className="text-[8px] font-medium text-on-surface-variant/40">{sourceLabel}</span>
      )}
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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: TrendEntry }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const borderColor = data.status === 'failed' ? 'border-rose-400'
    : data.status === 'slow' ? 'border-amber-400'
    : 'border-emerald-400';

  return (
    <div className={cn('bg-white rounded-xl shadow-lg p-4 border-l-4 min-w-[180px]', borderColor)}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-500 mb-1">RUN : {data.runTime}</p>
      <p className="text-lg font-black">{data.value}s</p>
      <div className="mt-2 space-y-0.5">
        {data.tooltip.split('\n').map((line, i) => (
          <p key={i} className="text-xs font-bold leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}

type SourceType = 'latest' | 'history' | 'all';

function SourceBadge({ type, count }: { type: SourceType; count?: number }) {
  const config = {
    latest: { label: 'รอบล่าสุด', color: 'bg-emerald-50 text-emerald-600' },
    history: { label: `${count || 15} รอบล่าสุด`, color: 'bg-blue-50 text-blue-600' },
    all: { label: `ทุกรัน (${count || 0} รอบ)`, color: 'bg-violet-50 text-violet-600' },
  };
  const c = config[type];
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide', c.color)}>
      {c.label}
    </span>
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
