import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchCases, getExportCsvUrl } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityChart from '../components/PriorityChart';
import { playAlertChime } from '../utils/audioAlert';
import { 
  Users, AlertCircle, Clock, CalendarClock, Search, Filter, 
  ExternalLink, RefreshCw, Activity, Volume2, VolumeX, Download, 
  CheckCircle2, BellRing, ChevronRight, PieChart as PieChartIcon
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio Alerts State
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('hospital_sound_enabled') === 'true';
  });
  const previousHighCountRef = useRef(0);

  // Filters
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, casesData] = await Promise.all([
        fetchDashboardStats(),
        fetchCases({
          priority: selectedPriority,
          status: selectedStatus,
          search: searchTerm
        })
      ]);
      
      // Trigger chime if new high priority cases arrive and sound is enabled
      if (soundEnabled && statsData.high_priority_count > previousHighCountRef.current && previousHighCountRef.current > 0) {
        playAlertChime();
      }
      previousHighCountRef.current = statsData.high_priority_count;

      setStats(statsData);
      setCases(casesData);
    } catch (err) {
      setError('Unable to connect to the backend server. Please make sure FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Poll every 20 seconds for dashboard live refresh
    const interval = setInterval(() => {
      loadDashboardData();
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedPriority, selectedStatus, searchTerm]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('hospital_sound_enabled', next.toString());
    if (next) {
      playAlertChime();
    }
  };

  const highPendingCount = cases.filter(c => c.system_priority === 'HIGH' && c.status === 'Pending Review').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-sky-600" />
            Clinical Operations Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Urgency Triage & Case Queue
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Human-in-the-loop clinical review and rapid response for post-discharge psychiatric support requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Alert Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Disable Audio Chimes' : 'Enable Audio Chimes'}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Audio Alerts: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio Alerts: OFF</span>
              </>
            )}
          </button>

          {/* Export CSV Button */}
          <a
            href={getExportCsvUrl()}
            download
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </a>

          {/* Refresh Button */}
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* New Intake Button */}
          <Link
            to="/intake"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20"
          >
            <span>+ Submit Intake</span>
          </Link>
        </div>
      </div>

      {/* Urgent Alert Banner if High Priority Pending Review */}
      {highPendingCount > 0 && (
        <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white p-4 rounded-2xl shadow-lg shadow-rose-500/15 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">
                URGENT ATTENTION: {highPendingCount} High-Priority {highPendingCount === 1 ? 'Case Requires' : 'Cases Require'} Immediate Human Review!
              </h4>
              <p className="text-xs text-rose-100">
                Rule engine detected critical risk indicators. Staff review mandatory before clinical action.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPriority('HIGH');
              setSelectedStatus('Pending Review');
            }}
            className="px-3.5 py-1.5 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow-xs hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Filter High Priority Queue
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboardData} className="underline text-xs text-rose-900 font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Top Summary Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPI Cards (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Card 1: Total Cases */}
          <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Cases</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats?.total_cases ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500">Queue registry</p>
          </div>

          {/* Card 2: High Priority */}
          <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-xs space-y-1.5 bg-rose-50/20">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-[11px] font-bold uppercase tracking-wider">High Priority</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {stats?.high_priority_count ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500">Score 6+ (Urgent)</p>
          </div>

          {/* Card 3: Awaiting Review */}
          <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Review</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {stats?.awaiting_review_count ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500">Pending clinician</p>
          </div>

          {/* Card 4: Follow-up Pending */}
          <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[11px] font-bold uppercase tracking-wider">Follow-up</span>
              <CalendarClock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {stats?.followup_pending_count ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500">Assigned active</p>
          </div>

          {/* Card 5: Resolved / Completed */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs space-y-1.5 bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {stats?.resolved_count ?? '—'}
            </div>
            <p className="text-[11px] text-slate-500">Completed cases</p>
          </div>

        </div>

        {/* Priority Chart (1 col) */}
        <div className="lg:col-span-1">
          {stats && <PriorityChart data={stats.priority_distribution} />}
        </div>

      </div>

      {/* Case Management Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Case ID, keyword, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Priority Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-medium mr-1">Priority:</span>
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedPriority === p
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-medium mr-1">Status:</span>
              {['All', 'Pending Review', 'Follow-up Pending', 'Resolved'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedStatus === s
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Request Snippet</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading && cases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    Loading urgency triage cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500">
                    No cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/40 transition-colors group">
                    <td className="py-3 px-4 font-bold text-sky-700 font-mono">
                      {c.case_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.request_type}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={c.message}>
                      {c.message}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {c.waiting_time_minutes}m
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono text-xs ${
                        c.risk_score >= 6 ? 'bg-rose-100 text-rose-800' :
                        c.risk_score >= 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        +{c.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.system_priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.assigned_to ? (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {c.assigned_to}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/cases/${c.case_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 text-xs font-bold rounded-lg transition-all"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {cases.length} support requests</span>
          <span className="text-[11px] text-slate-400">Auto-refreshes every 20s • Synthetic demonstration data</span>
        </div>

      </div>

    </div>
  );
}
