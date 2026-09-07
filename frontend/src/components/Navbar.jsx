import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, FilePlus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl group-hover:bg-sky-100 transition-colors">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base group-hover:text-sky-600 transition-colors">
                Post-Discharge Support
              </div>
              <div className="text-xs text-sky-600 font-medium">
                Clinical Urgency Triage System
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2">
            <Link
              to="/intake"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/intake')
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FilePlus className="h-4 w-4" />
              <span>Submit Request</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard') || location.pathname.startsWith('/cases')
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 hover:bg-sky-500'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
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
