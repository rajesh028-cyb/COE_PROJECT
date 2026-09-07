import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-xs border-y border-r border-amber-200">
      <div className="flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs font-bold text-amber-800 tracking-wider uppercase">
            Prototype recommendation — human review required
          </div>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            This system provides a preliminary transparent rule-based score using synthetic demo data. 
            <strong> Final clinical priority decisions and follow-up actions MUST always be confirmed or modified by authorized hospital staff.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
