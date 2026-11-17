import React from 'react';
import { ShieldCheck, Clock, FileText, Lock } from 'lucide-react';

const TermsPrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-300">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block">
          Hospitality Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100">
          Terms of Stay & Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last revised: October 2026 • Moon Light Villa Hospitality Private Limited
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-10 text-xs sm:text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> 1. Check-In & Check-Out Policy
          </h2>
          <p>
            Standard check-in time commences at <strong>2:00 PM</strong> on the scheduled date of arrival. Check-out time is strictly <strong>11:00 AM</strong> on the departure date to facilitate comprehensive deep cleaning, water testing, and sanitization of the estate for subsequent guests.
          </p>
          <p>
            Early check-in and late check-out requests are subject to availability and prior written approval from the estate manager. Additional hourly tariffs may apply.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> 2. Guest Verification & Mandatory ID Proof
          </h2>
          <p>
            In compliance with local government directives and hospitality regulations, valid government-issued photographic identification (Aadhaar Card, Passport, or Driving License) is mandatory for every adult guest prior to or upon arrival. PAN cards are not accepted as valid identity proof.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> 3. Cancellation & Refund Guidelines
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-400">
            <li><strong>Cancellations made 7+ days prior to check-in:</strong> 100% refund of advance payment, minus a 3% gateway transaction fee.</li>
            <li><strong>Cancellations between 7 days and 48 hours prior:</strong> 50% refund of advance payment.</li>
            <li><strong>Cancellations within 48 hours of check-in or No-Shows:</strong> 100% non-refundable.</li>
            <li>All approved refunds are settled directly to the original payment source within 5 to 7 business banking days.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" /> 4. Privacy & Data Protection Policy
          </h2>
          <p>
            Moon Light Villa strictly protects your personal information. Contact numbers, email addresses, and identification documents are securely stored in encrypted database repositories and used exclusively for booking verification, billing, and concierge coordination. We never sell, lease, or distribute private guest data to third-party commercial brokers.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPrivacyPage;
