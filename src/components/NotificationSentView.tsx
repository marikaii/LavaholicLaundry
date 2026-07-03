/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, User, MessageSquare, ArrowLeft } from 'lucide-react';

interface NotificationSentViewProps {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  message: string;
  onBack: () => void;
  onViewLogs: () => void;
}

export default function NotificationSentView({
  orderId,
  customerName,
  phoneNumber,
  message,
  onBack,
  onViewLogs
}: NotificationSentViewProps) {
  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="w-full max-w-[560px] relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-surface-container-lowest rounded-[32px] p-6 md:p-8 shadow-[0_24px_48px_rgba(0,104,119,0.08)] border border-outline-variant/30 flex flex-col items-center text-center">
          {/* Success Checkmark Circle */}
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            {/* Pulsing ring background */}
            <div className="absolute inset-0 bg-secondary-container rounded-full animate-ping opacity-20 duration-[2000ms]"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-secondary-container rounded-full">
              <Check className="w-12 h-12 text-primary stroke-[3]" />
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">Notification Sent!</h1>
          <p className="font-sans text-sm text-on-surface-variant max-w-sm">The pickup alert has been successfully delivered.</p>

          {/* Recipient Information Card */}
          <div className="w-full bg-surface-container-low rounded-2xl p-4 mt-6 mb-6 border border-outline-variant/20 flex items-center gap-4 text-left">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-sans text-xs text-outline font-semibold uppercase tracking-wider">Recipient Name &amp; Phone</span>
              <span className="block font-headline text-base text-on-surface font-semibold mt-0.5">
                {customerName} • {phoneNumber}
              </span>
            </div>
          </div>

          {/* Message Preview (asymmetric quote layout) */}
          <div className="w-full text-left mb-6">
            <h3 className="font-sans text-xs font-bold text-primary mb-2 px-1 uppercase tracking-wider">Message Preview</h3>
            <div className="relative bg-secondary-container/40 border border-secondary-container text-on-secondary-container p-5 rounded-[24px] rounded-bl-none italic shadow-inner">
              "{message || `Your laundry is fresh, clean, and ready for pickup at Lavaholic Laundry Hub! [#${orderId}]`}"
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-surface-bright border border-outline-variant/20 p-4 rounded-xl text-left shadow-sm">
              <span className="block font-sans text-xs text-outline font-semibold">Channel</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-sans text-sm font-semibold text-on-surface">SMS Alert</span>
              </div>
            </div>
            <div className="bg-surface-bright border border-outline-variant/20 p-4 rounded-xl text-left shadow-sm">
              <span className="block font-sans text-xs text-outline font-semibold">Status</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                <span className="font-sans text-sm font-semibold text-on-surface">Delivered</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <button 
            className="w-full bg-primary hover:bg-primary/95 text-white font-headline font-bold py-4 rounded-full transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/15 flex items-center justify-center gap-2 cursor-pointer"
            onClick={onBack}
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <button 
            className="mt-3 font-sans text-sm font-bold text-outline hover:text-primary transition-colors py-2 cursor-pointer"
            onClick={onViewLogs}
            id="view-log-history-link"
          >
            View Log History
          </button>
        </div>
      </main>

      {/* Decorative wash image in premium desktop viewport */}
      <div className="hidden lg:block absolute -right-24 top-12 w-48 h-64 rotate-12 opacity-40 select-none pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center rounded-[32px] shadow-xl border-4 border-white"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9ZF8i0Dqjaupkvti-ADw6klnt274Plr6xTxsevR4BKwBbHS0Xe39eLUTldtZZjPzU29MtEzCCRr_CQzvFiEofeW7oue3Y8JRBmx7eauLebLLN3bX2fUm9aLNu9UiBls8h06FzrWdashOkUAveKeJfZ_O9bc5bOcJfCdrXsZqi8J7qiwyiFTPOT16Lfxw-L5DiJSB5s9nmHsc_tGBhU_kgcTP-W3DKYNzC6BXEOyf4lCBO97oBrLAOcQ')` }}
        />
      </div>
    </div>
  );
}
