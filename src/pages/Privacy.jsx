import React from 'react';
import { Lock, ShieldCheck, EyeOff, Server, UserCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
          <Lock className="w-3.5 h-3.5" />
          Data Privacy & Encryption
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          SpeakMate Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: November 2026 • Version 1.0
        </p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-6 text-slate-700">
        
        {/* Core Guarantee */}
        <div className="p-6 bg-blue-50/60 rounded-2xl border border-blue-200/80">
          <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
            <EyeOff className="w-4 h-4 text-blue-600" />
            1. Zero Call Recording Policy
          </h2>
          <p className="text-xs text-blue-800/90 leading-relaxed">
            SpeakMate does <strong>not record, monitor, store, or transcribe</strong> any video or audio transmissions made through the service. Your calls are established directly between you and your conversation partner via browser-to-browser WebRTC peer connections (DTLS/SRTP encrypted).
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            2. Information We Collect
          </h2>
          <p className="mb-2">We collect only the minimal data required to deliver the English learning service:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Account Credentials:</strong> Email address and encrypted password stored securely with Supabase Auth.</li>
            <li><strong>Learner Profile:</strong> Your chosen display name, avatar URL, country, and self-reported English proficiency level.</li>
            <li><strong>Presence & Availability:</strong> Ephemeral online status and last-seen timestamps to pair you with active partners.</li>
            <li><strong>Safety Records:</strong> User reports and blocks submitted to enforce community standards.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            3. Information Visible to Other Members
          </h2>
          <p className="mb-2">
            To safeguard member privacy, your <strong>email address, password, IP address, and private identifiers are never displayed</strong> to other users or partners.
          </p>
          <p>
            When matching or in a call, only your public card information is shared:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Display name</li>
            <li>Avatar / initial</li>
            <li>Country</li>
            <li>English proficiency level</li>
            <li>Optional self-written bio/interests</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            4. WebRTC Media & Signaling
          </h2>
          <p>
            To negotiate peer connections, the SpeakMate signaling engine exchanges session descriptions (SDP) and ICE candidates via encrypted Supabase Realtime broadcast channels. Once established, media streams flow directly between endpoints.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            5. User Rights & Data Deletion
          </h2>
          <p>
            You retain full ownership of your data. You may update your profile at any time in the Profile section or request complete account deletion by contacting community administrators.
          </p>
        </div>

      </div>

    </div>
  );
}
