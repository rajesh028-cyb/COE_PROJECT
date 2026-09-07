import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchCases } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import PriorityChart from '../components/PriorityChart';
import { 
  Users, AlertCircle, Clock, CalendarClock, Search, Filter, 
  ExternalLink, RefreshCw, Activity 
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [selectedPriority, selectedStatus, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Clinical Operations Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Urgency Triage Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review incoming post-discharge support requests and human-review preliminary priorities.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/intake"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-sky-600/20"
          >
            <span>+ New Intake</span>
          </Link>
        </div>
      </div>

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
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Card 1: Total Open Cases */}
          <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Cases</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats?.total_cases ?? '—'}
            </div>
            <p className="text-xs text-slate-500">All registered support requests</p>
          </div>

          {/* Card 2: High Priority */}
          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-xs font-bold uppercase tracking-wider">High Priority</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600">
              {stats?.high_priority_count ?? '—'}
            </div>
            <p className="text-xs text-slate-500">Requires rapid review</p>
          </div>

          {/* Card 3: Awaiting Review */}
          <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-xs font-bold uppercase tracking-wider">Awaiting Review</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-purple-700">
              {stats?.awaiting_review_count ?? '—'}
            </div>
            <p className="text-xs text-slate-500">Pending human confirmation</p>
          </div>

          {/* Card 4: Follow-up Pending */}
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-bold uppercase tracking-wider">Follow-up Pending</span>
              <CalendarClock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700">
              {stats?.followup_pending_count ?? '—'}
            </div>
            <p className="text-xs text-slate-500">Assigned staff tasks</p>
          </div>

        </div>

        {/* Priority Chart (1 col) */}
        <div className="lg:col-span-1">
          <PriorityChart data={stats?.priority_distribution} />
        </div>

      </div>

      {/* Case Table Container */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-xs overflow-hidden space-y-4">
        
        {/* Controls Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Priority / Status Filter Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            
            {['All', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPriority(p);
                  setSelectedStatus('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPriority === p && selectedStatus === 'All'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {p === 'All' ? 'All Priorities' : p}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {['Pending Review', 'Assigned'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setSelectedPriority('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search case ID, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

        </div>

        {/* Cases Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-50/70 text-slate-700 border-b border-sky-100 uppercase font-bold tracking-wider">
                <th className="py-3.5 px-5">Case ID</th>
                <th className="py-3.5 px-5">Request Type</th>
                <th className="py-3.5 px-5">Waiting</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Assigned To</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    Loading urgency triage cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/40 transition-colors group">
                    <td className="py-4 px-5 font-mono font-bold text-sky-700">
                      {c.case_id}
                    </td>
                    <td className="py-4 px-5 text-slate-900 font-semibold">
                      {c.request_type}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {c.waiting_time_minutes} min
                    </td>
                    <td className="py-4 px-5">
                      <PriorityBadge priority={c.system_priority} size="small" />
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-5 text-slate-700">
                      {c.assigned_to ? (
                        <span className="font-bold text-slate-900">{c.assigned_to}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/cases/${c.case_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-600 hover:text-white transition-all text-xs font-bold shadow-2xs"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Displaying {cases.length} active prototype cases</span>
          <span>Click "View" to perform clinician human-review</span>
        </div>

      </div>

    </div>
  );
}
