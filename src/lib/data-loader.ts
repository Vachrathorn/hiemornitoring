/**
 * Data Loader — reads real data from perf-summary.json, CSV, analytics.json
 * For static export: data is imported at build time.
 */

import perfSummaryRaw from '@/data/perf-summary.json';
import analyticsRaw from '@/data/analytics.json';
import type { TCDetail, EndpointDetail, LogEntry, CriticalCheck } from './types';

// ============================================================
// perf-summary.json (latest run)
// ============================================================

export const perfSummary = perfSummaryRaw as {
  slowApis: Array<{ url: string; duration: number; method: string; status: number }>;
  longestSteps: Array<{ stepId: string; action: string; duration: number }>;
  stabilityScore: { passed: number; warned: number; failed: number; grade: string };
  webVitals: { ttfb: number; lcp: number; capturedAt: string; url: string } | null;
  tcDetails: Array<{ id: string; name: string; status: string }>;
  consoleErrors: Array<{ message: string; timestamp: string; url: string }>;
  networkFailures: Array<{ resourceUrl: string; method: string; errorText: string; resourceType?: string; timestamp?: string }>;
  totalApiCalls: number;
  uniqueEndpoints: number;
  slowApiCount: number;
  avgApiTime: number;
  p50ApiTime: number;
  p95ApiTime: number;
  p99ApiTime: number;
  traceFilePath: string | null;
  runId: string;
  timestamp: string;
  totalDurationMs: number;
  criticalEndpoints: Array<{
    label: string; pattern: string; method: string; level: string;
    relatedTC: string; called: boolean; httpStatus: number; responseMs: number; ok: boolean;
  }>;
  metadata: {
    environment: string; platform: string; reportVersion: string;
    thresholds: { slowApiMs: number; traceTriggerMs: number; ttfbGoodMs: number; ttfbPoorMs: number; lcpGoodMs: number; lcpPoorMs: number };
  };
  allStepTimings: Array<{ stepId: string; action: string; duration: number }>;
  endpointBreakdown: Array<{ endpoint: string; callCount: number; avgDuration: number; maxDuration: number; slowCount: number }>;
};

// ============================================================
// analytics.json (historical runs)
// ============================================================

export const analytics = analyticsRaw as Array<{
  date: string;
  passed: number;
  failed: number;
  duration: number;
  botCount: number;
  total: number;
}>;

// ============================================================
// Derived: TC Details for Test Cases page
// ============================================================

const tcIconMap: Record<string, string> = {
  'TC-01': 'Key',
  'TC-02': 'Database',
  'TC-03': 'Lock',
  'TC-04': 'Network',
  'TC-05': 'Activity',
};

/** Per-TC duration calculated from step timings */
function calcTcDuration(tcNum: number): number {
  const prefix = `S${tcNum}_`;
  const steps = perfSummary.allStepTimings.filter(s => s.stepId.startsWith(prefix));
  const totalMs = steps.reduce((sum, s) => sum + s.duration, 0);
  return Math.round(totalMs / 100) / 10; // round to 1 decimal second
}

export function getTcDetails(): TCDetail[] {
  return perfSummary.tcDetails.map((tc, i) => ({
    id: tc.id,
    name: tc.name,
    status: tc.status as TCDetail['status'],
    duration_s: calcTcDuration(i + 1),
    icon: tcIconMap[tc.id] || 'Activity',
  }));
}

// ============================================================
// Derived: Endpoint Details for Dashboard page
// ============================================================

export function getEndpointDetails(): EndpointDetail[] {
  return perfSummary.endpointBreakdown
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10)
    .map(ep => {
      const parts = ep.endpoint.split(' ');
      const method = parts[0] || 'GET';
      const path = parts.slice(1).join(' ') || ep.endpoint;
      return {
        endpoint: path,
        method,
        avg_ms: Math.round(ep.avgDuration),
        max_ms: Math.round(ep.maxDuration),
        calls: ep.callCount,
        slow: ep.slowCount,
      };
    });
}

// ============================================================
// Derived: Critical Checks for Overview page
// ============================================================

export function getCriticalChecks(): CriticalCheck[] {
  return perfSummary.criticalEndpoints.map(ep => ({
    label: ep.label,
    ok: ep.ok,
  }));
}

// ============================================================
// Derived: System Logs from steps + errors
// ============================================================

export function getSystemLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  const baseTime = new Date(perfSummary.timestamp);

  // Convert step timings to log entries
  let accumulatedMs = 0;
  const sortedSteps = [...perfSummary.allStepTimings].sort((a, b) => {
    // Sort by stepId naturally
    return a.stepId.localeCompare(b.stepId);
  });

  for (const step of sortedSteps) {
    const stepTime = new Date(baseTime.getTime() - perfSummary.totalDurationMs + accumulatedMs);
    const source = `TC-${step.stepId.charAt(1)}`;

    logs.push({
      timestamp: stepTime.toISOString().replace('T', ' ').slice(0, 23),
      level: step.duration > 10000 ? 'Warning' : 'Info',
      source: `${source}.Step`,
      message: `${step.action} — ${(step.duration / 1000).toFixed(1)}s`,
    });

    accumulatedMs += step.duration;
  }

  // Add console errors
  for (const err of perfSummary.consoleErrors) {
    logs.push({
      timestamp: err.timestamp.replace('T', ' ').slice(0, 23),
      level: 'Error',
      source: 'Console',
      message: err.message,
    });
  }

  // Add network failures
  for (const nf of perfSummary.networkFailures) {
    logs.push({
      timestamp: nf.timestamp?.replace('T', ' ').slice(0, 23) || baseTime.toISOString().replace('T', ' ').slice(0, 23),
      level: 'Error',
      source: 'Network',
      message: `${nf.method} ${nf.resourceUrl} — ${nf.errorText}`,
    });
  }

  // Add overall result
  logs.push({
    timestamp: baseTime.toISOString().replace('T', ' ').slice(0, 23),
    level: perfSummary.stabilityScore.failed > 0 ? 'Warning' : 'Success',
    source: 'Test.Runner',
    message: `Suite completed — ${perfSummary.stabilityScore.passed}/${perfSummary.tcDetails.length} PASSED, Grade: ${perfSummary.stabilityScore.grade} (${(perfSummary.totalDurationMs / 1000).toFixed(1)}s)`,
  });

  // Sort by timestamp
  logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return logs;
}

// ============================================================
// Computed values for Overview / Dashboard
// ============================================================

export function getAvailabilityPercent(): number {
  const totalRuns = analytics.length;
  const passedRuns = analytics.filter(r => r.failed === 0).length;
  return totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 10000) / 100 : 0;
}

export function getEfficiencyScore(): number {
  const stability = (perfSummary.stabilityScore.passed / perfSummary.tcDetails.length) * 100;
  const speed = perfSummary.avgApiTime < 500 ? 100 : perfSummary.avgApiTime < 1000 ? 80 : 60;
  const health = perfSummary.criticalEndpoints.every(e => e.ok) ? 100 : 50;
  return Math.round((stability * 0.4 + speed * 0.3 + health * 0.3) * 10) / 10;
}

/** Convert UTC timestamp to Thailand time display */
export function toThaiTime(isoStr: string): string {
  const d = new Date(isoStr);
  d.setHours(d.getHours() + 7);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/** Overall status in Thai */
export function getOverallStatus(): string {
  const { passed, failed, grade } = perfSummary.stabilityScore;
  if (failed > 0) return 'ผิดปกติ';
  if (grade === 'A') return 'ปกติ';
  if (grade === 'B') return 'ช้ากว่าปกติ';
  return 'มีปัญหา';
}
