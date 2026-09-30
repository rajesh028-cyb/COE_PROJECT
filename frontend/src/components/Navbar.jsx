import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, FilePlus, ShieldCheck, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-sky-600 transition-colors flex items-center gap-2">
                <span>Post-Discharge Triage</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Active
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Psychiatric Outpatient & Helpline Gateway
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2">
            <Link
              to="/"
              className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('/')
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Overview</span>
            </Link>

            <Link
              to="/intake"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive('/intake')
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FilePlus className="h-4 w-4 text-sky-600" />
              <span>Submit Request</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive('/dashboard') || location.pathname.startsWith('/cases')
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 hover:bg-sky-500'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Staff Dashboard</span>
            </Link>
          </nav>

        </div>
      </div>
    </header>
  );
}
