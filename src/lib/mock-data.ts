import { RunData, TCDetail, EndpointDetail, LogEntry, CriticalCheck } from './types';

// ============================================================
// Latest Run (mock — will be replaced with real CSV/JSON data)
// ============================================================

export const latestRun: RunData = {
  run_id: 'run-mock-001',
  timestamp: '2026-03-27T09:15:32',
  platform: 'hie',
  environment: 'uat',
  slot: 'morning',
  overall_status: 'ปกติ',
  base_url: 'https://hie-uat.example.go.th',
  total_duration_s: 54.1,
  date: '2026-03-27',
  week_number: '2026-W13',

  tc_01_status: 'PASS',
  tc_02_status: 'PASS',
  tc_03_status: 'PASS',
  tc_04_status: 'PASS',
  tc_05_status: 'PASS',
  tc_01_duration_s: 10.6,
  tc_02_duration_s: 3.2,
  tc_03_duration_s: 20.0,
  tc_04_duration_s: 15.3,
  tc_05_duration_s: 5.0,

  tc_passed: 5,
  tc_warned: 0,
  tc_failed: 0,
  tc_total: 5,
  stability_grade: 'A',

  total_api_calls: 87,
  unique_endpoints: 12,
  slow_api_count: 2,
  avg_api_s: 0.142,
  p50_api_s: 0.042,
  p95_api_s: 0.380,
  p99_api_s: 0.520,
  max_api_s: 0.620,
  slowest_endpoint: 'POST /api/consent/out/doctor/request/by-case',

  ttfb_s: 0.285,
  lcp_s: 1.42,
  ttfb_grade: 'Good',
  lcp_grade: 'Good',

  critical_ok: 4,
  critical_total: 4,
  critical_all_healthy: true,

  console_error_count: 0,
  network_failure_count: 0,

  longest_step_s: 20.0,
  longest_step_id: 'S3_002',
  longest_step_action: 'Wait for FHIR data sync',

  slow_api_details: 'POST /api/consent/out/doctor/request/by-case 620ms(200) | POST /api/fhir/patient 520ms(200)',
  endpoint_breakdown_json: JSON.stringify([
    { endpoint: 'POST /api/consent/out/doctor/request/by-case', avg_ms: 580, max_ms: 620, calls: 3, slow: 1 },
    { endpoint: 'POST /api/fhir/patient', avg_ms: 490, max_ms: 520, calls: 5, slow: 1 },
    { endpoint: 'GET /api/user/user-info', avg_ms: 28, max_ms: 45, calls: 8, slow: 0 },
    { endpoint: 'POST /api/auth', avg_ms: 184, max_ms: 210, calls: 2, slow: 0 },
    { endpoint: 'GET /api/patient/doctor-search', avg_ms: 82, max_ms: 120, calls: 12, slow: 0 },
  ]),
  all_steps_json: JSON.stringify([
    { step: 'S1_001', action: 'Navigate to Login', ms: 2100 },
    { step: 'S1_002', action: 'Enter Credentials', ms: 1500 },
    { step: 'S1_003', action: 'Submit Login', ms: 7000 },
    { step: 'S2_001', action: 'Select Hospital', ms: 1800 },
    { step: 'S2_002', action: 'Search Patient', ms: 1400 },
    { step: 'S3_001', action: 'Open Patient Record', ms: 3200 },
    { step: 'S3_002', action: 'Wait for FHIR data sync', ms: 16800 },
    { step: 'S4_001', action: 'Start Consent Flow', ms: 2400 },
    { step: 'S4_002', action: 'Fill Consent Form', ms: 5100 },
    { step: 'S4_003', action: 'Submit Consent', ms: 7800 },
    { step: 'S5_001', action: 'Verify System Health', ms: 5000 },
  ]),
};

// ============================================================
// Historical Runs (for trend charts)
// ============================================================

export const historicalRuns: Partial<RunData>[] = [
  { date: '2026-03-20', total_duration_s: 48.2, p95_api_s: 0.32, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.12, total_api_calls: 82 },
  { date: '2026-03-21', total_duration_s: 52.1, p95_api_s: 0.41, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.15, total_api_calls: 85 },
  { date: '2026-03-22', total_duration_s: 45.0, p95_api_s: 0.28, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.11, total_api_calls: 79 },
  { date: '2026-03-23', total_duration_s: 68.4, p95_api_s: 0.95, overall_status: 'ช้ากว่าปกติ', tc_passed: 4, tc_failed: 1, tc_total: 5, stability_grade: 'C', avg_api_s: 0.28, total_api_calls: 91 },
  { date: '2026-03-24', total_duration_s: 51.3, p95_api_s: 0.35, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.13, total_api_calls: 84 },
  { date: '2026-03-25', total_duration_s: 49.8, p95_api_s: 0.31, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.12, total_api_calls: 86 },
  { date: '2026-03-26', total_duration_s: 53.7, p95_api_s: 0.42, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.14, total_api_calls: 88 },
  { date: '2026-03-27', total_duration_s: 54.1, p95_api_s: 0.38, overall_status: 'ปกติ', tc_passed: 5, tc_failed: 0, tc_total: 5, stability_grade: 'A', avg_api_s: 0.142, total_api_calls: 87 },
];

// ============================================================
// TC Details
// ============================================================

export const tcDetails: TCDetail[] = [
  { id: 'TC-01', name: 'Login & Authentication', status: 'PASS', duration_s: 10.6, icon: 'Key' },
  { id: 'TC-02', name: 'Hospital Selection & Patient Search', status: 'PASS', duration_s: 3.2, icon: 'Database' },
  { id: 'TC-03', name: 'Patient Data Sync & SLA', status: 'PASS', duration_s: 20.0, icon: 'Lock' },
  { id: 'TC-04', name: 'Consent Flow', status: 'PASS', duration_s: 15.3, icon: 'Network' },
  { id: 'TC-05', name: 'System Health Report', status: 'PASS', duration_s: 5.0, icon: 'Activity' },
];

// ============================================================
// Endpoint Details (parsed from endpoint_breakdown_json)
// ============================================================

export const endpointDetails: EndpointDetail[] = [
  { endpoint: '/api/consent/out/doctor/request/by-case', method: 'POST', avg_ms: 580, max_ms: 620, calls: 3, slow: 1 },
  { endpoint: '/api/fhir/patient', method: 'POST', avg_ms: 490, max_ms: 520, calls: 5, slow: 1 },
  { endpoint: '/api/auth', method: 'POST', avg_ms: 184, max_ms: 210, calls: 2, slow: 0 },
  { endpoint: '/api/patient/doctor-search', method: 'GET', avg_ms: 82, max_ms: 120, calls: 12, slow: 0 },
  { endpoint: '/api/user/user-info', method: 'GET', avg_ms: 28, max_ms: 45, calls: 8, slow: 0 },
];

// ============================================================
// Critical Checks
// ============================================================

export const criticalChecks: CriticalCheck[] = [
  { label: 'Authentication API', ok: true },
  { label: 'Database Connection', ok: true },
  { label: 'FHIR Data Sync', ok: true },
  { label: 'External Gateway', ok: true },
];

// ============================================================
// System Logs (mock — from consoleErrors + networkFailures + test events)
// ============================================================

export const systemLogs: LogEntry[] = [
  { timestamp: '2026-03-27 09:15:32.442', level: 'Success', source: 'Auth.API', message: 'Login successful — session token issued for test user.' },
  { timestamp: '2026-03-27 09:15:35.109', level: 'Info', source: 'Hospital.Select', message: 'Hospital selected: รพ.ศูนย์ขอนแก่น (ID: 10670)' },
  { timestamp: '2026-03-27 09:15:38.002', level: 'Info', source: 'Patient.Search', message: 'Patient search completed — 1 result found for CID ending 4821.' },
  { timestamp: '2026-03-27 09:15:58.221', level: 'Warning', source: 'FHIR.Sync', message: 'FHIR data sync took 16.8s — approaching SLA threshold of 20s.' },
  { timestamp: '2026-03-27 09:16:12.887', level: 'Success', source: 'Consent.Flow', message: 'Consent submitted and verified successfully for patient record.' },
  { timestamp: '2026-03-27 09:16:18.334', level: 'Info', source: 'Health.Check', message: 'All critical endpoints responding. System health grade: A.' },
  { timestamp: '2026-03-27 09:16:18.500', level: 'Success', source: 'Test.Runner', message: 'Full test suite completed — 5/5 PASSED in 54.1s.' },
];

// ============================================================
// Computed Helpers
// ============================================================

export function getAvailabilityPercent(): number {
  const totalRuns = historicalRuns.length;
  const normalRuns = historicalRuns.filter(r => r.overall_status === 'ปกติ').length;
  return Math.round((normalRuns / totalRuns) * 10000) / 100;
}

export function getEfficiencyScore(): number {
  const stabilityScore = (latestRun.tc_passed / latestRun.tc_total) * 100;
  const speedScore = latestRun.avg_api_s < 0.15 ? 100 : latestRun.avg_api_s < 0.3 ? 80 : 60;
  const healthScore = latestRun.critical_all_healthy ? 100 : 50;
  return Math.round((stabilityScore * 0.4 + speedScore * 0.3 + healthScore * 0.3) * 10) / 10;
}

export function getTrendPercent(current: number, previous: number): string {
  if (previous === 0) return 'N/A';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
