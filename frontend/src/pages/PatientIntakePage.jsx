import React, { useState } from 'react';
import { submitIntakeRequest } from '../services/api';
import { CheckCircle2, Send, HeartPulse, AlertCircle, RefreshCw } from 'lucide-react';

export default function PatientIntakePage() {
  const [requestType, setRequestType] = useState('Counselling');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState('Phone');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message describing your request.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitIntakeRequest({
        request_type: requestType,
        message: message.trim(),
        contact_method: contactMethod
      });

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit support request. Please ensure the backend service is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900">
            Your support request has been submitted.
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Our post-discharge support team has received your request. A staff member will review your message and reach out via your preferred contact method (<strong>{contactMethod}</strong>).
          </p>

          <div className="pt-4 border-t border-slate-100 flex justify-center gap-4">
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
          <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
          Patient Post-Discharge Portal
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Request Support
        </h1>
        <p className="text-sm text-slate-600">
          If you need assistance following your discharge, please complete the form below.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Request Type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white text-sm"
            >
              <option value="Counselling">Counselling</option>
              <option value="Helpline">Helpline</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Appointment Support">Appointment Support</option>
            </select>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Phone', 'Email', 'Portal'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setContactMethod(method)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    contactMethod === method
                      ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Message <span className="text-slate-500 font-normal text-xs">(Describe how you are feeling or what support you need)</span>
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., I am feeling very distressed and I don't feel safe being alone."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:bg-white placeholder:text-slate-400 resize-y"
              required
            />
          </div>

          {/* Quick Demo Pre-fill Button */}
          <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 flex items-center justify-between text-xs text-slate-600">
            <span>Demo Shortcut: Fill High Distress Sample Message</span>
            <button
              type="button"
              onClick={() => {
                setRequestType('Helpline');
                setContactMethod('Phone');
                setMessage("I am feeling very distressed and I don't feel safe being alone.");
              }}
              className="px-3 py-1 bg-white text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-50 font-semibold shadow-2xs"
            >
              Fill Demo Test
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
