/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Droplet, User, Bell, Phone, Check, RefreshCw, MessageSquare, 
  HelpCircle, MessageCircle, X, Navigation, ListTodo, ShieldAlert, Sparkles 
} from 'lucide-react';
import { Order, OrderStatus, ADDON_PRICES, calculateOrderPrice, ChatMessage } from '../types';

interface CustomerViewProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onSwitchToStaffView: () => void;
  priceConfig?: any;
  customerName?: string;
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
  onSendChatMessage
}: CustomerViewProps) {
  const [searchId, setSearchId] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [customerTab, setCustomerTab] = useState<'track' | 'pricing'>('track');
  const [calcService, setCalcService] = useState<'Wash Only' | 'Dry Only' | 'Deluxe'>('Wash Only');
  const [calcWeight, setCalcWeight] = useState<number>(5.0);
  const [calcAddOns, setCalcAddOns] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // 🕒 Local state to manage smooth ticking seconds
  const [secondsLeft, setSecondsLeft] = useState(0);

  // 🔒 SECURITY FILTER: Extract ONLY the orders belonging to the logged-in user profile
  const myOrders = orders.filter(
    (o) => o.customerName.trim().toLowerCase() === (customerName || '').trim().toLowerCase()
  );

  const threadId = customerName || (activeOrder ? activeOrder.customerName : 'Guest Customer');
  const threadMessages = chatMessages.filter(
    (msg) => msg.threadId === threadId || msg.threadId === 'System' || msg.threadId === 'General'
  );

  // Sync / Reset second timer baseline whenever active order status or baseline duration updates
  useEffect(() => {
    setSecondsLeft(0);
  }, [activeOrder?.status, activeOrder?.duration]);

  // Micro-second ticking effect for the dynamic clock rendering layout
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
        if (prevSeconds <= 0) return 59;
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.status, activeOrder?.duration]);

  // Secure Initialization: Automatically attach only to the user's latest active profile placement record
  useEffect(() => {
    if (activeOrder) {
      const updated = myOrders.find(o => o.id === activeOrder.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(activeOrder)) {
        setActiveOrder(updated);
      }
    } else if (myOrders.length > 0) {
      setActiveOrder(myOrders[0]); // Pick the user's first order securely instead of global master lists
    }
  }, [orders, customerName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase().replace('#', '');
    // Enforce name parameters match context boundaries during custom lookups
    const found = myOrders.find(o => o.id.toUpperCase() === cleanId);
    if (found) {
      setActiveOrder(found);
      setSearchError(false);
    } else {
      setSearchError(true);
    }
  };

  const handleSelectSuggested = (order: Order) => {
    setActiveOrder(order);
    setSearchId(`#${order.id}`);
    setSearchError(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    
    onSendChatMessage(threadId, 'customer', customerName || 'Guest', userMsg);
    setChatInput('');

    setTimeout(() => {
      try {
        const saved = localStorage.getItem('lavaholic_chat_messages');
        const parsed: ChatMessage[] = saved ? JSON.parse(saved) : [];
        const threadMsgs = parsed.filter(m => m.threadId === threadId);
        const hasLiveAgentReplied = threadMsgs.some(m => m.sender === 'staff' && m.id !== 'initial');
        
        if (!hasLiveAgentReplied) {
          let reply = "Hello! A live support attendant has been notified of your message and will reply here shortly.";
          if (activeOrder) {
            reply = `Got your message! I've flagged our laundry team about your order #${activeOrder.id} (Status: ${activeOrder.status}, ${activeOrder.duration} min left). We are on it!`;
          }
          onSendChatMessage(threadId, 'staff', 'Laundry Support', reply);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1800);
  };

  // Clock formatter logic displaying the proper mm:ss layout
  const formatClockDisplay = () => {
    if (!activeOrder) return '00:00';
    if (activeOrder.status === 'Sorting' || activeOrder.status === 'Ready') {
      return `${activeOrder.duration.toString().padStart(2, '0')}:00`;
    }
    const displayedMinutes = secondsLeft > 0 ? activeOrder.duration - 1 : activeOrder.duration;
    const mm = Math.max(0, displayedMinutes).toString().padStart(2, '0');
    const ss = secondsLeft.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const currentStepIndex = activeOrder ? ['Sorting', 'Washing', 'Drying', 'Folding', 'Ready'].indexOf(activeOrder.status) : 0;
  const radius = 80;
  const circumference = radius * 2 * Math.PI;
  const percentComplete = activeOrder 
    ? Math.min(100, Math.max(0, ((activeOrder.totalDuration - activeOrder.duration) / activeOrder.totalDuration) * 100))
    : 100;
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference;

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col pb-24 relative">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest border-b border-outline-variant/10 flex justify-between items-center px-5 py-3">
        <div className="flex items-center gap-2">
          <img className="w-8 h-8 rounded-lg object-contain" alt="Lavaholic logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_0sGCwvxLJEVdBYx3bb1K_Yz0m4jcdWfLcm_pT_qVd0ZEsDVExOmMCah57Wfc4iQAzOS6P47C2paGkvV_s84y5czTqEYEDanX9F4ydusfapMtwJjNiaKiS6DD1E2MXBM21sg6bz-Uf9xGCfW-aeudk_ZOSO7TYlrUxwhUa-n2GOVO48_zP-Bc8LCAZ7O-pUWGSxffDn0EXE54XKyIweSuKTshdi8E9xgqcxj9mBIxX7RXebV_caUR75WC0LLCnRqcckw" />
          <span className="font-headline text-lg font-bold text-primary">Lavaholic</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onSwitchToStaffView} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant text-xs font-bold hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span>Exit</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-on-surface block max-w-[80px] truncate">{customerName || 'Customer'}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden shadow-sm">
              <span className="font-sans text-xs font-bold text-primary">{(customerName || 'C').charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mt-20 px-5 max-w-md mx-auto w-full flex-1">
        {customerTab === 'track' ? (
          <>
            <section className="mb-6 text-left">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-1 leading-tight">Hello, {customerName || 'Friend'}!</h1>
              <p className="font-sans text-xs text-on-surface-variant font-medium mb-4">Track your laundry freshness and live updates in real-time.</p>
              
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest border-b-2 border-outline-variant focus:border-primary focus:outline-none py-4 px-4 pr-14 rounded-t-2xl transition-all font-sans text-sm text-on-surface placeholder:text-outline font-semibold shadow-sm"
                  placeholder="Search your order code here..." 
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  id="customer-search-input"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-full shadow-sm cursor-pointer"><Search className="w-4 h-4 stroke-[2.5]" /></button>
              </form>
              
              {searchError ? (
                <div className="mt-2 text-xs bg-red-50 border border-red-200 text-error p-3 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>We couldn't find that order ID linked to your profile name.</span>
                </div>
              ) : (
                <p className="text-[11px] text-on-surface-variant font-medium mt-2 px-1">Enter your order ID code to pull historical entries.</p>
              )}

              {/* 🔒 FIXED: Suggested shortcuts now map through strictly private personal order array */}
              {myOrders.length > 0 && (
                <div className="mt-3.5">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1.5 px-1">Your active laundry profiles:</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {myOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleSelectSuggested(o)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 border transition-all cursor-pointer ${
                          activeOrder?.id === o.id ? 'bg-secondary-container border-primary text-primary font-bold shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        #{o.id} ({o.status})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {activeOrder ? (
              <div className="space-y-6">
                <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 text-left">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface">Order #{activeOrder.id}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-md font-sans text-[11px] font-bold mt-1 shadow-sm">{activeOrder.serviceType}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-primary-container"><span className="material-symbols-outlined text-lg">local_laundry_service</span></div>
                  </div>

                  {/* Horizontal Stepper */}
                  <div className="relative flex justify-between items-center mb-8 px-1">
                    <div className="absolute top-4 left-0 w-full h-[2px] bg-outline-variant -z-10"></div>
                    <div className="absolute top-4 left-0 h-[2px] bg-primary -z-10 transition-all duration-500" style={{ width: `${(currentStepIndex / 4) * 100}%` }}></div>

                    {[
                      { name: 'Sorting', icon: 'list_alt' },
                      { name: 'Washing', icon: 'water_drop' },
                      { name: 'Drying', icon: 'cyclone' },
                      { name: 'Folding', icon: 'dry_cleaning' },
                      { name: 'Ready', icon: 'done_all' }
                    ].map((step, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <div key={step.name} className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-primary text-white' : isCurrent ? 'bg-primary-container text-primary ring-2 ring-primary border-2 border-surface-container-lowest' : 'bg-surface-container text-outline'}`}>
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="material-symbols-outlined text-[16px]">{step.icon}</span>}
                          </div>
                          <span className={`text-[10px] font-bold ${isCurrent || isCompleted ? 'text-primary' : 'text-outline'}`}>{step.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Accurate Ticking Second Circle Meter Container */}
                  <div className="flex flex-col items-center justify-center py-6 bg-secondary-container/15 rounded-2xl relative overflow-hidden shadow-inner">
                    <svg className="w-48 h-48 drop-shadow-sm">
                      <circle className="text-outline-variant/20" cx="96" cy="96" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8" />
                      <circle className="progress-ring__circle text-primary" cx="96" cy="96" fill="transparent" r={radius} stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="10" />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="font-headline text-4xl font-black text-primary tracking-tight font-mono">{formatClockDisplay()}</span>
                      <span className="font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">MM:SS LEFT</span>
                    </div>
                    <div className="mt-5 text-center px-4">
                      <p className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>{activeOrder.status} in Progress</span>
                      </p>
                      <p className="text-xs text-outline font-semibold mt-1">ETC: {activeOrder.estimatedTime}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 text-left space-y-4">
                  <h3 className="font-headline text-sm font-bold text-primary border-b pb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-base">receipt_long</span><span>Receipt & Order Details</span></h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase tracking-wider font-bold">Weight & Load Size</span>
                      <span className="text-on-surface font-semibold">{(activeOrder.weight || 0).toFixed(1)} kg ({activeOrder.loadSize || 'Medium'} Load)</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase tracking-wider font-bold">Service Category</span>
                      <span className="text-on-surface font-semibold">{activeOrder.serviceType}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase tracking-wider font-bold">Payment Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${activeOrder.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{activeOrder.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block text-[10px] uppercase tracking-wider font-bold">Pickup Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${activeOrder.isPickedUp ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{activeOrder.isPickedUp ? 'Picked Up' : 'In Progress'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10">
                    <span className="text-on-surface-variant block text-[10px] uppercase tracking-wider font-bold mb-1.5">Selected Add-ons</span>
                    {activeOrder.addOns && activeOrder.addOns.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeOrder.addOns.map((addon) => (
                          <span key={addon} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{addon} (+₱{(ADDON_PRICES[addon] || 0.00).toFixed(2)})</span>
                        ))}
                      </div>
                    ) : <span className="text-[11px] text-outline font-medium italic">No custom add-ons selected</span>}
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <div>
                      <span className="text-on-surface-variant text-[11px] font-bold block">Total Amount Due</span>
                      <span className="text-[10px] text-outline font-semibold">Includes taxes & options</span>
                    </div>
                    <span className="font-headline text-2xl font-extrabold text-primary">₱{(activeOrder.totalAmount || 0.00).toFixed(2)}</span>
                  </div>
                </section>

                {/* Live order modifier controls */}
                {activeOrder.status !== 'Ready' && activeOrder.status !== 'Cancelled' && !activeOrder.isPickedUp && (
                  <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 text-left space-y-3">
                    <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5"><Sparkles className="w-4 h-4" /><span>Add Extras to Your Live Order</span></h3>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(ADDON_PRICES).map(([addon, price]) => {
                        const isSelected = activeOrder.addOns?.includes(addon);
                        return (
                          <button
                            key={addon}
                            type="button"
                            onClick={() => {
                              const currentAddons = activeOrder.addOns || [];
                              const updatedAddons = isSelected ? currentAddons.filter(a => a !== addon) : [...currentAddons, addon];
                              const newPriceDetails = calculateOrderPrice(activeOrder.serviceType, activeOrder.weight, updatedAddons);
                              onUpdateOrder(activeOrder.id, { addOns: updatedAddons, totalAmount: newPriceDetails.totalAmount });
                            }}
                            className={`flex items-center justify-between p-2.5 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${isSelected ? 'bg-secondary-container border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface'}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline text-transparent'}`}><Check className="w-2.5 h-2.5 stroke-[3.5]" /></span>
                              <span>{addon}</span>
                            </span>
                            <span className="text-primary">+₱{price.toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 🔒 FIXED: Private History Log now renders ONLY from myOrders array profiles */}
                <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 text-left space-y-3">
                  <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 border-b pb-2"><span className="material-symbols-outlined text-base">history</span><span>Your Order History</span></h3>
                  <div className="space-y-2">
                    {myOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleSelectSuggested(o)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${activeOrder.id === o.id ? 'bg-secondary-container border-primary' : 'bg-surface border-outline-variant/20'}`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-on-surface">Order #{o.id}</span>
                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded ${o.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-primary/15 text-primary'}`}>{o.status}</span>
                          </div>
                          <span className="text-[10px] text-outline block mt-0.5">{o.serviceType} • {o.weight.toFixed(1)}kg • {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-primary block">₱{(o.totalAmount || 0.00).toFixed(2)}</span>
                          <span className="text-[8px] text-outline font-semibold">{o.isPaid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-3 text-left">
                    <div className="p-2 bg-primary/10 rounded-full text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">notifications_active</span></div>
                    <div><span className="text-xs font-bold text-on-surface block">Alerts On</span><span className="text-[10px] text-outline font-semibold">SMS Alerts</span></div>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-3 text-left">
                    <div className="p-2 bg-primary/10 rounded-full text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">local_shipping</span></div>
                    <div><span className="text-xs font-bold text-on-surface block">Delivery</span><span className="text-[10px] text-outline font-semibold">{activeOrder.deliveryTime}</span></div>
                  </div>
                </section>

                <section className="mt-6"><button onClick={() => setShowSupportChat(true)} className="w-full py-4 bg-surface-container-high text-primary font-sans text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"><span className="material-symbols-outlined text-[20px]">support_agent</span><span>Need Help? Contact Support</span></button></section>
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-container-lowest border rounded-2xl shadow-sm text-outline">
                <Droplet className="w-12 h-12 mx-auto mb-3 text-primary opacity-60" />
                <p className="text-sm font-semibold">No ongoing laundry assignments found under the account profile name "{customerName}".</p>
              </div>
            )}
          </>
        ) : (
          /* Estimate pricing calculator sandbox layout path */
          (() => {
            const priceResult = calculateOrderPrice(calcService, calcWeight, calcAddOns, priceConfig);
            return (
              <div className="space-y-6 text-left animate-in fade-in duration-300">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-left">
                  <span className="flex items-center gap-1.5 py-1 px-2.5 bg-primary/10 text-primary rounded-full w-fit text-[10px] font-bold tracking-wider uppercase mb-2"><Sparkles className="w-3.5 h-3.5" /><span>Live Service Catalog</span></span>
                  <h2 className="font-headline text-lg font-bold text-on-surface">Laundry Services & Rates</h2>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Explore pricing structures and generate live cost invoices estimation quotes.</p>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 text-left space-y-4">
                  <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 border-b pb-2"><span className="material-symbols-outlined text-base">calculate</span><span>Interactive Load Cost Calculator</span></h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">1. Select Service Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Wash Only', 'Dry Only', 'Deluxe'] as const).map((service) => (
                        <button key={service} type="button" onClick={() => setCalcService(service)} className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex flex-col justify-between cursor-pointer ${calcService === service ? 'bg-secondary-container border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
                          <span className="text-[11px] font-bold">{service}</span>
                          <span className="text-[8px] text-outline mt-1 font-semibold leading-tight">
                            {service === 'Wash Only' && 'Wash cycle only'}
                            {service === 'Dry Only' && 'Heated dry only'}
                            {service === 'Deluxe' && 'All-in treatment'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-outline uppercase tracking-wider">2. Estimated Load Weight</label>
                      <span className="text-xs font-extrabold text-primary px-2 py-0.5 bg-primary/10 rounded-md">{calcWeight.toFixed(1)} kg</span>
                    </div>
                    <input type="range" min="0.5" max="8.0" step="0.5" value={calcWeight} onChange={(e) => setCalcWeight(parseFloat(e.target.value))} className="w-full accent-primary cursor-pointer" />
                    <div className="flex justify-between text-[9px] font-bold text-outline uppercase"><span>0.5 kg (Light)</span><span className="text-primary bg-secondary-container px-1.5 py-0.5 rounded">{priceResult.loadSize} Load</span><span>8.0 kg (Max)</span></div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">3. Premium Add-ons & Extras</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(priceConfig && priceConfig.addOns ? priceConfig.addOns : ADDON_PRICES).map(([addon, price]) => {
                        const isSelected = calcAddOns.includes(addon);
                        return (
                          <button key={addon} type="button" onClick={() => setCalcAddOns(prev => prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]) className={`flex items-center justify-between p-2 border rounded-xl text-[10px] font-semibold cursor-pointer transition-all ${isSelected ? 'bg-secondary-container border-primary text-primary' : 'bg-surface border-outline-variant'}`}>
                            <span className="flex items-center gap-1.5">
                              <span className={`w-3 h-3 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline text-transparent'}`}><Check className="w-2 h-2 stroke-[4]" /></span>
                              <span className="truncate max-w-[85px]">{addon}</span>
                            </span>
                            <span className="text-primary font-bold">+₱{(price as number).toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 space-y-1 text-xs">
                    <div className="flex justify-between text-on-surface-variant"><span>Base Price ({priceResult.loadSize} service)</span><span className="font-bold">₱{priceResult.basePrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-on-surface-variant"><span>Add-ons Total</span><span className="font-bold">₱{(priceResult.totalAmount - priceResult.basePrice).toFixed(2)}</span></div>
                    <div className="pt-1.5 border-t border-primary/10 flex justify-between items-center text-primary"><span className="font-bold uppercase tracking-wider text-[10px]">Estimated Price</span><span className="font-headline text-xl font-extrabold">₱{priceResult.totalAmount.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </main>

      {/* Support Chat Modal */}
      {showSupportChat && (
        <div className="fixed inset-0 z-[100] bg-on-background/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[500px]">
            <div className="p-4 bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-white text-base">support_agent</span></div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-sm text-white">Lavaholic Support Agent</h3>
                  <p className="text-[9px] text-white/80 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span><span>Online • Attendant Sync Active</span></p>
                </div>
              </div>
              <button onClick={() => setShowSupportChat(false)} className="text-white/80 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-background/50 h-[250px]">
              {threadMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs text-left ${msg.sender === 'customer' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border text-on-surface rounded-tl-none shadow-sm'}`}>
                    {msg.sender !== 'customer' && <span className="block font-bold text-[9px] text-primary mb-0.5">{msg.senderName}</span>}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-3 bg-surface-container border-t flex gap-2">
              <input type="text" placeholder="Type message..." className="flex-1 bg-surface-container-lowest border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-primary" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" className="bg-primary text-white p-2 rounded-full cursor-pointer"><MessageCircle className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/30">
        <div className="flex justify-around items-center w-full max-w-md mx-auto px-4 pb-4 pt-2">
          <button onClick={() => { setCustomerTab('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`flex flex-col items-center justify-center rounded-full px-5 py-1.5 cursor-pointer ${customerTab === 'track' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">home</span><span className="text-[10px] mt-1 font-bold">Track</span>
          </button>
          <button onClick={() => { setCustomerTab('pricing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`flex flex-col items-center justify-center rounded-full px-5 py-1.5 cursor-pointer ${customerTab === 'pricing' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">sell</span><span className="text-[10px] mt-1 font-bold">Pricing</span>
          </button>
          <button onClick={() => setShowSupportChat(true)} className="flex flex-col items-center justify-center text-on-surface-variant rounded-full px-5 py-1.5 cursor-pointer relative">
            <span className="material-symbols-outlined">support_agent</span><span className="text-[10px] mt-1">Support</span>
            <span className="absolute top-1 right-5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </nav>
    </div>
  );
}
