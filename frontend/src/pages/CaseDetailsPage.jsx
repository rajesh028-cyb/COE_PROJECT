import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCaseDetail, submitHumanReview, assignStaff } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { 
  ArrowLeft, ShieldAlert, CheckCircle2, 
  UserCheck, AlertTriangle, FileText, Calendar, CheckSquare, User 
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

  const loadCase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCaseDetail(caseId);
      setCaseData(data);
      setOverridePriority(data.system_priority || 'HIGH');
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
      setReviewMessage('Human review successfully recorded.');
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
      setAssignMessage(`Case assigned to ${assignedStaff} with follow-up set for ${dueTime}.`);
    } catch (err) {
      setError('Failed to assign staff member.');
    } finally {
      setSubmittingAssignment(false);
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
      
      {/* Top Navigation */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-xs font-bold tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Back to Urgency Triage Dashboard</span>
        </Link>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-sky-700 font-mono tracking-tight">
              Case {caseData.case_id}
            </h1>
            <PriorityBadge priority={latestReview ? latestReview.final_priority : caseData.system_priority} />
            <StatusBadge status={caseData.status} />
          </div>
          <p className="text-xs text-slate-500">
            Created: {new Date(caseData.created_at).toLocaleString()}
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
            <span className="text-slate-500 block font-medium">Assigned Staff</span>
            <span className="font-bold text-slate-900">{caseData.assigned_to || 'Unassigned'}</span>
          </div>
        </div>
      </div>

      {/* Prominent Human Review Disclaimer */}
      <DisclaimerBanner />

      {/* Section 1: Patient Request Text */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-sky-600" />
          <span>Patient Request Message</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-900 text-sm leading-relaxed font-sans font-medium">
          "{caseData.message}"
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-between">
          <span>Preferred Contact: <strong className="text-slate-800">{caseData.contact_method}</strong></span>
          <span>Submitted via post-discharge support portal</span>
        </div>
      </div>

      {/* Grid: Risk Indicators & Triage Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Detected Risk Indicators */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Detected Risk Indicators
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
              {caseData.risk_indicators?.length || 0} Found
            </span>
          </div>

          <div className="space-y-3">
            {caseData.risk_indicators && caseData.risk_indicators.length > 0 ? (
              caseData.risk_indicators.map((ind, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{ind.name}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      ind.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                      ind.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      +{ind.score} ({ind.severity})
                    </span>
                  </div>
                  {caseData.evidence && caseData.evidence[idx] && (
                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-2 mt-1">
                      <strong>Evidence:</strong> {caseData.evidence[idx].evidence}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 p-4 text-center">
                No specific risk keywords detected. Routine follow-up score assigned.
              </div>
            )}
          </div>
        </div>

        {/* System Triage Recommendation */}
        <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                System Triage Recommendation
              </h3>
              <p className="text-xs text-slate-500">Automated prototype rule calculation</p>
            </div>

            <div className="bg-sky-50/60 p-5 rounded-xl border border-sky-100 space-y-4 text-center">
              <div className="flex items-center justify-center gap-6">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-mono font-semibold">Risk Score</span>
                  <span className="text-4xl font-extrabold text-sky-700 font-mono">
                    {caseData.risk_score}
                  </span>
                </div>
                <div className="h-10 w-px bg-sky-200" />
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-mono font-semibold">Preliminary Priority</span>
                  <div className="mt-1">
                    <PriorityBadge priority={caseData.system_priority} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-sky-100">
                The recommendation is based on detected prototype risk indicators and waiting time ({caseData.waiting_time_minutes} min).
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Prototype recommendation — human staff review required</span>
          </div>
        </div>

      </div>

      {/* Section 2: Human Review Panel */}
      <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <span>HUMAN REVIEW PANEL</span>
          </div>
          {latestReview && (
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              Reviewed by {latestReview.reviewer}
            </span>
          )}
        </div>

        {reviewMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{reviewMessage}</span>
          </div>
        )}

        {latestReview ? (
          /* Reviewed Display State */
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-200">
              <div>
                <span className="text-slate-500 block font-medium">System Priority</span>
                <PriorityBadge priority={latestReview.system_priority} size="small" />
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Final Priority (Human)</span>
                <PriorityBadge priority={latestReview.final_priority} size="small" />
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Reviewed By</span>
                <span className="font-bold text-slate-900">{latestReview.reviewer}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Reviewed Timestamp</span>
                <span className="text-slate-700">{new Date(latestReview.reviewed_at).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Reviewer Note:</span>
              <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-slate-200">
                "{latestReview.reviewer_note || 'No additional note provided.'}"
              </p>
            </div>
          </div>
        ) : (
          /* Interactive Review Form */
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Review Decision Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Reviewer Decision
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewMode('confirm')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      reviewMode === 'confirm'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Confirm Priority ({caseData.system_priority})
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewMode('override')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      reviewMode === 'override'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Override Priority
                  </button>
                </div>
              </div>

              {/* Priority Selector (If override) */}
              {reviewMode === 'override' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Overridden Priority
                  </label>
                  <div className="flex gap-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setOverridePriority(p)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                          overridePriority === p
                            ? p === 'HIGH' ? 'bg-rose-600 text-white border-rose-500'
                            : p === 'MEDIUM' ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Reviewer Meta Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Reviewer Note
                </label>
                <input
                  type="text"
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="E.g., Priority confirmed after direct telephone contact."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="py-3 px-6 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{submittingReview ? 'Submitting Review...' : 'Confirm & Save Human Review'}</span>
            </button>

          </form>
        )}

      </div>

      {/* Section 3: Staff Assignment & Follow-Up Panel */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-xs space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            <span>Staff Assignment & Follow-up</span>
          </h3>
          {caseData.assigned_to && (
            <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold">
              Assigned: {caseData.assigned_to}
            </span>
          )}
        </div>

        {assignMessage && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>{assignMessage}</span>
          </div>
        )}

        {latestFollowup ? (
          /* Existing Followup Display */
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500 block font-medium">Assigned Clinician:</span>
                <span className="font-bold text-slate-900 text-sm">{latestFollowup.assigned_to}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block font-medium">Follow-up Due:</span>
                <span className="font-bold text-amber-700">{latestFollowup.due_time}</span>
              </div>
            </div>
            {latestFollowup.notes && (
              <p className="text-slate-700 pt-2 border-t border-slate-200">
                <strong>Notes:</strong> {latestFollowup.notes}
              </p>
            )}
          </div>
        ) : null}

        {/* Assignment Form */}
        <form onSubmit={handleAssignmentSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Assign Staff Member
              </label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
              >
                <option value="Staff A">Staff A (Psychiatric Nurse Coordinator)</option>
                <option value="Staff B">Staff B (Clinical Social Worker)</option>
                <option value="Staff C">Staff C (Outpatient Counsellor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Follow-up Due Time
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="E.g., Today, 3:30 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                required
              />
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Assignment Notes / Instructions
            </label>
            <input
              type="text"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="E.g., Conduct urgent telephone risk assessment."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submittingAssignment}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>{submittingAssignment ? 'Saving Assignment...' : 'Assign Staff & Set Follow-up'}</span>
          </button>

        </form>

      </div>

    </div>
  );
}
