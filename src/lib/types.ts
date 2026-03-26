/** Performance data from a single test run */
export interface RunData {
  run_id: string;
  timestamp: string;
  platform: string;
  environment: string;
  slot: string;
  overall_status: string;
  base_url: string;
  total_duration_s: number;
  date: string;
  week_number: string;

  tc_01_status: string;
  tc_02_status: string;
  tc_03_status: string;
  tc_04_status: string;
  tc_05_status: string;
  tc_01_duration_s: number;
  tc_02_duration_s: number;
  tc_03_duration_s: number;
  tc_04_duration_s: number;
  tc_05_duration_s: number;

  tc_passed: number;
  tc_warned: number;
  tc_failed: number;
  tc_total: number;
  stability_grade: string;

  total_api_calls: number;
  unique_endpoints: number;
  slow_api_count: number;
  avg_api_s: number;
  p50_api_s: number;
  p95_api_s: number;
  p99_api_s: number;
  max_api_s: number;
  slowest_endpoint: string;

  ttfb_s: number;
  lcp_s: number;
  ttfb_grade: string;
  lcp_grade: string;

  critical_ok: number;
  critical_total: number;
  critical_all_healthy: boolean;

  console_error_count: number;
  network_failure_count: number;

  longest_step_s: number;
  longest_step_id: string;
  longest_step_action: string;

  slow_api_details: string;
  endpoint_breakdown_json: string;
  all_steps_json: string;
}

export interface TCDetail {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'IN_PROGRESS';
  duration_s: number;
  icon: string;
}

export interface EndpointDetail {
  endpoint: string;
  method: string;
  avg_ms: number;
  max_ms: number;
  calls: number;
  slow: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'Error' | 'Warning' | 'Success' | 'Info';
  source: string;
  message: string;
}

export interface CriticalCheck {
  label: string;
  ok: boolean;
}

export type ViewType = 'overview' | 'dashboard' | 'test-cases' | 'logs';
