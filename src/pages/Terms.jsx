import React from 'react';
import { ShieldCheck, FileCheck, AlertTriangle, Users } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Community Standards & Code of Conduct
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          SpeakMate Terms of Service
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: November 2026 • Version 1.0
        </p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm leading-relaxed space-y-6 text-slate-700">
        
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            1. Invite-Only Membership & Purpose
          </h2>
          <p>
            SpeakMate is an invite-only language learning community dedicated exclusively to practice and improvement of spoken English. Access is conditional upon approval by community administrators or invitation through authorized referral codes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            2. Anti-Harassment & Behavioral Code
          </h2>
          <p className="mb-2">
            Every member agrees to maintain a respectful, patient, and welcoming educational environment. The following behaviors are strictly prohibited and result in immediate, permanent expulsion:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Any form of sexual harassment, nudity, suggestive behavior, or inappropriate conduct.</li>
            <li>Hate speech, racism, sexism, bigotry, or discrimination based on nationality, religion, or orientation.</li>
            <li>Bullying, mockery of accent or language errors, or aggressive interruptions.</li>
            <li>Commercial solicitation, advertising, cryptocurrency promotion, or external account scraping.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            3. Strict Prohibition on Third-Party Recording
          </h2>
          <p>
            Members are strictly forbidden from taking screenshots, screen recordings, audio recordings, or distributing any likeness or speech of other members without explicit, written mutual consent. Violations will result in account ban and referral to legal authorities where applicable.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            4. Mutual Consent & Call Skipping
          </h2>
          <p>
            SpeakMate operates with caller-receiver consent. Every invitation allows 15 seconds to accept or decline. Either participant may click <strong>"Next Partner"</strong> or <strong>"End Call"</strong> at any time without penalty.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">
            5. Network Quality & Technical Disclaimers
          </h2>
          <p>
            WebRTC connections rely on the user's internet bandwidth, router NAT configuration, and browser compatibility. SpeakMate provides standard Google STUN infrastructure, but symmetric enterprise firewalls may require configured TURN servers.
          </p>
        </div>

      </div>

    </div>
  );
}
