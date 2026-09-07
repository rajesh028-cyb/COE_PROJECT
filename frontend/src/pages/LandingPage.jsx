import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Activity, ArrowRight, HeartPulse, Sparkles, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto py-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Clinical Operations Prototype
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Post-Discharge Support
        </h1>

        <p className="text-xl font-semibold text-slate-700">
          Human-reviewed urgency triage for counselling and helpline requests.
        </p>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          This prototype helps authorised hospital staff identify potentially urgent patient requests 
          following acute psychiatric care discharge, while strictly keeping final clinical decisions under human staff control.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/intake"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-slate-800 font-semibold border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
          >
            <HeartPulse className="w-5 h-5 text-sky-600" />
            <span>Submit Support Request</span>
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-all shadow-md shadow-sky-600/25 group"
          >
            <span>Staff Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="inline-flex items-center gap-2 pt-6 text-xs text-amber-700 font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>Prototype using synthetic data. Not a clinical diagnostic or emergency-response system.</span>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs hover:border-sky-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-4">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">1. Patient Intake</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Patients submit follow-up, counselling, or helpline requests. Triage scores and internal indicators are strictly kept confidential from patients.
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs hover:border-sky-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">2. Transparent Triage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rule-based engine detects safety concerns, severe distress, and support isolation language to compute preliminary LOW, MEDIUM, or HIGH priorities with evidence rationale.
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs hover:border-sky-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">3. Human Review & Control</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authorised clinicians review evidence, confirm or override the priority, add reviewer notes, and assign staff members for follow-up.
          </p>
        </div>

      </div>

    </div>
  );
}
