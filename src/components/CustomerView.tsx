/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Droplet, Wind, Layers, Check, ListOrdered, X, 
  MessageSquare, Send, ShieldAlert, Sparkles, User, Smartphone 
} from 'lucide-react';
import { Order, ChatMessage } from '../types';

interface CustomerViewProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onSwitchToStaffView: () => void;
  priceConfig: any;
  customerName: string;
  chatMessages: ChatMessage[];
  onSendChatMessage: (threadId: string, sender: 'customer' | 'staff', senderName: string, text: string) => void;
}

export default function CustomerView({
  orders,
  onUpdateOrder,
  onSwitchToStaffView,
  priceConfig,
  customerName,
  chatMessages,
  onSendChatMessage,
}: CustomerViewProps) {
  // Find the current active laundry order for this customer
  const activeOrder = orders.find(
    (o) => o.customerName.toLowerCase() === customerName.toLowerCase() && o.status !== 'Cancelled'
  );

  const [chatInput, setChatInput] = useState('');
  
  // Local state to track seconds inside the active minute
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Sync / Reset seconds when master baseline duration adjustments occur from Staff side
  useEffect(() => {
    setSecondsLeft(0);
  }, [activeOrder?.duration]);

  // Smooth local ticking mechanism
  useEffect(() => {
    const isCycleRunning = 
      activeOrder?.status === 'Washing' || 
      activeOrder?.status === 'Drying' || 
      activeOrder?.status === 'Folding';

    if (!isCycleRunning || !activeOrder || activeOrder.duration <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds <= 0) {
          return 59;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.status, activeOrder?.duration]);

  // Helper utility to generate the formatted MM:SS string safely
  const formatClockDisplay = () => {
    if (!activeOrder) return '00:00';
    
    // Display fixed base minutes if cycle hasn't been engaged yet or completed
    if (activeOrder.status === 'Sorting' || activeOrder.status === 'Ready') {
      return `${activeOrder.duration.toString().padStart(2, '0')}:00`;
    }

    // Adjust minute string value based on active partial minute ticks remaining
    const displayedMinutes = secondsLeft > 0 ? activeOrder.duration - 1 : activeOrder.duration;
    
    const mm = Math.max(0, displayedMinutes).toString().padStart(2, '0');
    const ss = secondsLeft.toString().padStart(2, '0');

    return `${mm}:${ss}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    // Send message anchored to this customer's name thread
    onSendChatMessage(customerName, 'customer', customerName, chatInput.trim());
    setChatInput('');
  };

  // Filter relevant chat threads
  const currentThreadMessages = chatMessages.filter(
    (m) => m.threadId === customerName || m.threadId === 'System'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sorting': return <ListOrdered className="w-6 h-6 text-[#0a7c92]" />;
      case 'Washing': return <Droplet className="w-6 h-6 text-[#0a7c92] animate-bounce" />;
      case 'Drying': return <Wind className="w-6 h-6 text-[#0a7c92] animate-pulse" />;
      case 'Folding': return <Layers className="w-6 h-6 text-slate-400" />;
      case 'Ready': return <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />;
      default: return <Droplet className="w-6 h-6 text-slate-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 flex flex-col items-center">
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 px-5 py-4 flex justify-between items-center shadow-sm max-w-md md:max-w-xl">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-[#0a7c92]" />
          <span className="font-bold text-slate-900 tracking-tight">Lavaholic Hub</span>
        </div>
        <button 
          onClick={onSwitchToStaffView}
          className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-full text-slate-600 transition-all flex items-center gap-1 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Staff Portal</span>
        </button>
      </header>

      {/* Main Status Container */}
      <main className="w-full max-w-md md:max-w-xl px-4 mt-6 space-y-6 flex-1">
        <div className="bg-gradient-to-r from-[#0a7c92] to-[#086375] text-white p-5 rounded-2xl shadow-md relative overflow-hidden text-left">
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Logged in tracking profile</span>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5">Welcome back, {customerName}!</h2>
          </div>
          <Sparkles className="absolute right-4 bottom-4 w-12 h-12 text-white/10 pointer-events-none" />
        </div>

        {activeOrder ? (
          <div className="space-y-4">
            {/* Countdown Timer Display block */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm text-center space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                Estimated Cycle Time Remaining
              </span>
              <div className="font-mono text-5xl font-black text-[#0a7c92] tracking-tight drop-shadow-sm select-all">
                {formatClockDisplay()}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                {getStatusIcon(activeOrder.status)}
                <span>Status: {activeOrder.status}</span>
              </div>
            </div>

            {/* Order Specification Summary Cards */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm text-left space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#0a7c92]" />
                <span>Order Summary Details #{activeOrder.id}</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Service Selection</span>
                  <span className="font-bold text-slate-800">{activeOrder.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Weight Classification</span>
                  <span className="font-bold text-slate-800">{activeOrder.weight} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Payment Invoice Status</span>
                  <span className={`font-bold uppercase tracking-wider text-[10px] ${activeOrder.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {activeOrder.isPaid ? '✓ Completed' : 'Unpaid Invoice'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Est. Completion Target</span>
                  <span className="font-bold text-slate-700">{activeOrder.estimatedTime}</span>
                </div>
              </div>
              {activeOrder.specialInstructions && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs mt-2">
                  <span className="font-bold text-amber-800 block text-[10px] uppercase tracking-wider">Special Instructions Note</span>
                  <p className="text-amber-900 mt-0.5 font-medium">{activeOrder.specialInstructions}</p>
                </div>
              )}
            </div>

            {/* Integrated Live Help Chat Section */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col h-[320px] overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-left">
                <MessageSquare className="w-4 h-4 text-[#0a7c92]" />
                <span className="text-xs font-bold text-slate-700">Live Counter Attendant Support</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2 flex flex-col bg-slate-50/40">
                {currentThreadMessages.map((msg, idx) => {
                  const isStaff = msg.sender === 'staff';
                  return (
                    <div key={idx} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] text-xs p-2.5 rounded-xl text-left shadow-sm ${
                        isStaff 
                          ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none' 
                          : 'bg-[#0a7c92] text-white rounded-tr-none'
                      }`}>
                        <span className="block text-[8px] font-bold opacity-60 mb-0.5">
                          {isStaff ? 'Staff Support' : 'You'}
                        </span>
                        <p className="font-medium leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-2 bg-white">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your laundry status..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#0a7c92]"
                />
                <button type="submit" className="bg-[#0a7c92] text-white p-2 rounded-full active:scale-95 transition-transform cursor-pointer shadow-sm">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center space-y-3 shadow-sm">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto opacity-75" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              We couldn't locate any active tracking references under your name profile right now. Please verify with our staff at the counter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
