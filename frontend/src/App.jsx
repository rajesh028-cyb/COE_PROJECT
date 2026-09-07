import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import PatientIntakePage from './pages/PatientIntakePage';
import DashboardPage from './pages/DashboardPage';
import CaseDetailsPage from './pages/CaseDetailsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Body View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/intake" element={<PatientIntakePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases/:caseId" element={<CaseDetailsPage />} />
          </Routes>
        </main>

        {/* Light Healthcare Footer */}
        <footer className="bg-white border-t border-sky-100 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-slate-700">
              Post-Discharge Urgency Triage System
            </p>
            <p className="text-slate-500 font-medium">
              Synthetic Demo Data • Human Review Required • Not a diagnostic or emergency tool
            </p>
          </div>
        </footer>

      </div>
    </Router>
  );
}
