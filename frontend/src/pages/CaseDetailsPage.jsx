import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  fetchCaseDetail, submitHumanReview, assignStaff, 
  resolveCase, sendNotification 
} from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { 
  ArrowLeft, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle, 
  FileText, Calendar, CheckSquare, User, Send, MessageSquare, 
  Printer, History, PhoneCall, Mail, CheckCircle, Clock, ShieldCheck
} from 'lucide-react';

export default function CaseDetailsPage() {
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Human Review Form State
  const [reviewMode, setReviewMode] = useState('confirm'); // 'confirm' or 'override'
  const [overridePriority, setOverridePriority] = useState('HIGH');
  const [reviewerName, setReviewerName] = useState('Staff Clinician A');
  const [reviewerNote, setReviewerNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  // Assignment Form State
  const [assignedStaff, setAssignedStaff] = useState('Staff A');
  const [dueTime, setDueTime] = useState('Today, 3:30 PM');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignMessage, setAssignMessage] = useState(null);

  // Resolution Form State
  const [resolutionDisposition, setResolutionDisposition] = useState('Follow-up Call Completed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvedByName, setResolvedByName] = useState('Staff Clinician A');
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState(null);

  // Notification / Patient Communication Simulator State
  const [notifChannel, setNotifChannel] = useState('SMS');
  const [notifRecipient, setNotifRecipient] = useState('+1 (555) 234-5678');
  const [notifTemplate, setNotifTemplate] = useState('Safety Check-in');
  const [notifBody, setNotifBody] = useState('Hospital Support: We have received your post-discharge request. A clinician has been assigned and is reaching out to you.');
  const [submittingNotif, setSubmittingNotif] = useState(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState(null);

  const loadCase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCaseDetail(caseId);
      setCaseData(data);
      setOverridePriority(data.system_priority || 'HIGH');
      if (data.contact_method === 'Email') {
        setNotifChannel('Email');
        setNotifRecipient('patient.care@example.com');
      }
    } catch (err) {
      setError(`Failed to load details for case ${caseId}. Ensure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMessage(null);

    const finalPriority = reviewMode === 'confirm' ? caseData.system_priority : overridePriority;
    const note = reviewerNote.trim() || (reviewMode === 'confirm' ? 'Priority confirmed after human staff review.' : `Priority overridden to ${finalPriority}.`);

    try {
      const updatedCase = await submitHumanReview(caseId, {
        final_priority: finalPriority,
        reviewer: reviewerName,
        reviewer_note: note
      });

      setCaseData(updatedCase);
      setReviewMessage('Human review decision successfully recorded in audit log.');
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAssignment(true);
    setAssignMessage(null);

    try {
      const updatedCase = await assignStaff(caseId, {
        assigned_to: assignedStaff,
        due_time: dueTime,
        notes: assignmentNotes
      });

      setCaseData(updatedCase);
      setAssignMessage(`Case assigned to ${assignedStaff} with follow-up target: ${dueTime}.`);
    } catch (err) {
      setError('Failed to assign staff member.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingResolution(true);
    setResolutionMessage(null);

    try {
      const updatedCase = await resolveCase(caseId, {
        disposition: resolutionDisposition,
        notes: resolutionNotes || 'Case resolved and closed following clinical protocol.',
        resolved_by: resolvedByName
      });

      setCaseData(updatedCase);
      setResolutionMessage('Case successfully marked as Resolved & Closed.');
    } catch (err) {
      setError('Failed to resolve case.');
    } finally {
      setSubmittingResolution(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSubmittingNotif(true);
    setNotifSuccessMessage(null);

    try {
      const updatedCase = await sendNotification(caseId, {
        channel: notifChannel,
        recipient: notifRecipient,
        template_type: notifTemplate,
        message_body: notifBody,
        sent_by: reviewerName || 'Clinical Coordinator'
      });

      setCaseData(updatedCase);
      setNotifSuccessMessage(`Simulated ${notifChannel} delivered successfully to ${notifRecipient}.`);
    } catch (err) {
      setError('Failed to send notification.');
    } finally {
      setSubmittingNotif(false);
    }
  };

  const applyTemplate = (type) => {
    setNotifTemplate(type);
    if (type === 'Safety Check-in') {
      setNotifBody('Hospital Crisis Support: We have received your urgent message. A clinician is calling you directly right now. If you are in immediate physical danger, please call 988 or 911.');
    } else if (type === 'Clinician Assigned') {
      setNotifBody(`Hello, your support request has been assigned to ${assignedStaff}. A clinician will connect with you by ${dueTime}.`);
    } else if (type === 'Appointment Scheduled') {
      setNotifBody('Hospital Post-Discharge Team: Your outpatient follow-up appointment has been scheduled for tomorrow at 2:00 PM with Dr. Reynolds.');
    } else if (type === 'Crisis Resources') {
      setNotifBody('Mental Health Support Resources: 24/7 Suicide & Crisis Lifeline: 988. Hospital Direct Helpline: (555) 019-2834. You are not alone.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        <p className="text-sm">Loading details for case {caseId}...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl max-w-lg mx-auto text-sm font-medium">
          {error || 'Case not found.'}
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const latestReview = caseData.reviews && caseData.reviews.length > 0 ? caseData.reviews[caseData.reviews.length - 1] : null;
  const latestFollowup = caseData.followups && caseData.followups.length > 0 ? caseData.followups[caseData.followups.length - 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-xs font-bold tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Back to Urgency Triage Dashboard</span>
        </Link>

        {/* Print / Save Clinical Report */}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print / PDF Clinical Report</span>
        </button>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-sky-700 font-mono tracking-tight">
              Case {caseData.case_id}
            </h1>
            <PriorityBadge priority={caseData.system_priority} />
            <StatusBadge status={caseData.status} />
          </div>
          <p className="text-xs text-slate-500">
            Intake Registered: {new Date(caseData.created_at).toLocaleString()}
          </p>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-3 gap-4 text-xs bg-sky-50/60 p-4 rounded-xl border border-sky-100">
          <div>
            <span className="text-slate-500 block font-medium">Request Type</span>
            <span className="font-bold text-slate-900">{caseData.request_type}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Waiting Time</span>
            <span className="font-bold text-slate-900">{caseData.waiting_time_minutes} min</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Preferred Contact</span>
            <span className="font-bold text-slate-900">{caseData.contact_method || 'Phone'}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Human Review Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Grid: Request Text & Triage Rule Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Patient Request Content */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Patient Request Message</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-slate-800 text-sm leading-relaxed border border-slate-200/60 whitespace-pre-wrap font-sans">
            "{caseData.message}"
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Contact Channel: <strong>{caseData.contact_method}</strong></span>
            <span>Recorded Queue Time: <strong>{caseData.waiting_time_minutes}m</strong></span>
          </div>

          {/* If Resolved, show resolution details banner */}
          {caseData.status === 'Resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Case Resolved & Closed</span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Disposition:</strong> {caseData.resolution_disposition}
              </p>
              {caseData.resolution_notes && (
                <p className="text-xs text-slate-600">
                  <strong>Notes:</strong> {caseData.resolution_notes}
                </p>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                Resolved by <strong>{caseData.resolved_by}</strong> on {caseData.resolved_at ? new Date(caseData.resolved_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Transparent Triage Engine Scoring & Evidence */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Transparent Triage Scoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Risk Score:</span>
              <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg font-mono ${
                caseData.risk_score >= 6 ? 'bg-rose-100 text-rose-800' :
                caseData.risk_score >= 3 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{caseData.risk_score}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Trigger phrases and operational conditions detected by the Python rule engine:
          </p>

          <div className="space-y-2.5">
            {caseData.risk_indicators && caseData.risk_indicators.length > 0 ? (
              caseData.risk_indicators.map((ind, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    ind.severity === 'HIGH' ? 'bg-rose-50/70 border-rose-200' :
                    ind.severity === 'MEDIUM' ? 'bg-amber-50/70 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        ind.severity === 'HIGH' ? 'bg-rose-600' :
                        ind.severity === 'MEDIUM' ? 'bg-amber-500' :
                        'bg-sky-500'
                      }`}></span>
                      {ind.name}
                    </div>
                    <div className="text-slate-600 mt-0.5 text-[11px]">
                      {ind.evidence}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    +{ind.score}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No high-risk keywords detected. Standard routine inquiry scoring applied (Score 0 - LOW Priority).</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Clinical Operations Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel 1: Human Clinical Review & Override */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Human-in-the-Loop Review</span>
          </div>
          <p className="text-xs text-slate-600">
            Confirm the rule recommendation or override to another priority based on clinical judgment.
          </p>

          {reviewMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reviewMessage}</span>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            
            {/* Mode selection: Confirm vs Override */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewMode('confirm')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  reviewMode === 'confirm'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Confirm Priority ({caseData.system_priority})
              </button>

              <button
                type="button"
                onClick={() => setReviewMode('override')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                  reviewMode === 'override'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Override Priority
              </button>
            </div>

            {/* Override Priority Select */}
            {reviewMode === 'override' && (
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <label className="font-bold text-amber-900 block">Select Overridden Priority:</label>
                <div className="flex gap-2">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setOverridePriority(p)}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        overridePriority === p
                          ? p === 'HIGH' ? 'bg-rose-600 text-white' : p === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Reviewer Name / ID</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                placeholder="e.g. Dr. Sarah Jenkins, LCSW"
              />
            </div>

            {/* Reviewer Clinical Note */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Clinical Rationale / Reviewer Note</label>
              <textarea
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                placeholder="Enter justification for priority decision..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submittingReview ? 'Recording Review...' : 'Record Human Review Decision'}
            </button>
          </form>
        </div>

        {/* Panel 2: Staff Assignment & Follow-up Scheduling */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Staff Assignment & Follow-up</span>
          </div>
          <p className="text-xs text-slate-600">
            Assign responsibility to a clinical care coordinator and schedule target callback time.
          </p>

          {assignMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{assignMessage}</span>
            </div>
          )}

          <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
            
            {/* Assignee Selection */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Assign To Clinician / Team</label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Staff A (Psychiatric Nurse)">Staff A (Psychiatric Nurse)</option>
                <option value="Staff B (Clinical Social Worker)">Staff B (Clinical Social Worker)</option>
                <option value="Staff C (Outpatient Counsellor)">Staff C (Outpatient Counsellor)</option>
                <option value="Crisis Response Team">Crisis Response Team</option>
              </select>
            </div>

            {/* Due Time */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Follow-up Target Due Time</label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                placeholder="e.g. Today, 3:30 PM or Within 15 minutes"
              />
            </div>

            {/* Assignment Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Instructions & Notes</label>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                placeholder="Specific instructions for assigned clinician..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingAssignment}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
            >
              {submittingAssignment ? 'Assigning...' : 'Assign Staff & Schedule Follow-up'}
            </button>
          </form>
        </div>

      </div>

      {/* Advanced Panels: Patient Communication Simulation & Case Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel 3: Simulated Patient Communication (SMS / Email) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Simulated Patient Communication</span>
          </div>
          <p className="text-xs text-slate-600">
            Simulate automated or manual SMS/Email messages sent directly to the patient's contact channel.
          </p>

          {notifSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notifSuccessMessage}</span>
            </div>
          )}

          {/* Quick Template Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Response Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Safety Check-in', 'Clinician Assigned', 'Appointment Scheduled', 'Crisis Resources'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => applyTemplate(t)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    notifTemplate === t
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Channel</label>
                <select
                  value={notifChannel}
                  onChange={(e) => setNotifChannel(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="SMS">SMS Text Message</option>
                  <option value="Email">Secure Email</option>
                  <option value="In-App">Patient Portal Notification</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient</label>
                <input
                  type="text"
                  value={notifRecipient}
                  onChange={(e) => setNotifRecipient(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Content</label>
              <textarea
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                rows={3}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={submittingNotif}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingNotif ? 'Dispatching Message...' : 'Send Simulated Communication'}</span>
            </button>
          </form>

          {/* Sent Notifications Log */}
          {caseData.notifications && caseData.notifications.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Dispatched Communications Log ({caseData.notifications.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {caseData.notifications.map((n) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{n.channel}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">{n.template_type}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          {n.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{n.message_body}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel 4: Case Resolution & Close Workflow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Case Resolution & Closure</span>
          </div>
          <p className="text-xs text-slate-600">
            Once patient safety and care coordination goals are fulfilled, finalize and close the case record.
          </p>

          {resolutionMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resolutionMessage}</span>
            </div>
          )}

          <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Resolution Disposition</label>
              <select
                value={resolutionDisposition}
                onChange={(e) => setResolutionDisposition(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Follow-up Call Completed">Follow-up Call Completed</option>
                <option value="Safety Plan Formed">Safety Plan Formed & Verified</option>
                <option value="Outpatient Appointment Scheduled">Outpatient Appointment Scheduled</option>
                <option value="Referred to Acute Crisis Team">Referred to Acute Crisis Team</option>
                <option value="Administrative Query Solved">Administrative Query Solved</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Closing Clinician Name</label>
              <input
                type="text"
                value={resolvedByName}
                onChange={(e) => setResolvedByName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Dr. Sarah Jenkins, LCSW"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Resolution Summary Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Details of care plan delivered or patient disposition..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingResolution || caseData.status === 'Resolved'}
              className={`w-full py-2.5 font-bold rounded-xl transition-all shadow-md ${
                caseData.status === 'Resolved'
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {caseData.status === 'Resolved' ? '✓ Case Already Resolved' : submittingResolution ? 'Resolving Case...' : 'Mark Case as Resolved & Closed'}
            </button>
          </form>
        </div>

      </div>

      {/* Comprehensive Audit Trail & Chronological Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <History className="w-4 h-4 text-sky-600" />
          <span>Case Timeline & Compliance Audit Trail</span>
        </div>
        <p className="text-xs text-slate-600">
          Immutable event log tracking all system detections, human clinician reviews, assignments, communications, and dispositions.
        </p>

        <div className="space-y-3 pt-2">
          {caseData.audit_logs && caseData.audit_logs.length > 0 ? (
            caseData.audit_logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></div>
                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span className="font-mono text-sky-700">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Performed by: <strong>{log.performed_by}</strong></p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No historical audit entries found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
