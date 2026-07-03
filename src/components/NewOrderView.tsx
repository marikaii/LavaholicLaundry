/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, ServiceType, calculateOrderPrice, ADDON_PRICES } from '../types';
import { ArrowLeft, Plus, Minus, Layers, Droplet, Wind, Sparkles, MessageSquare, Bell, ChevronRight, Check, Calendar } from 'lucide-react';

interface NewOrderViewProps {
  onBack: () => void;
  onCreateOrder: (order: Omit<Order, 'id' | 'status' | 'duration' | 'totalDuration' | 'createdAt' | 'estimatedTime' | 'alertsOn' | 'deliveryScheduled' | 'deliveryTime'> & { createdAt?: string, duration?: number }) => void;
  priceConfig?: any;
}

export default function NewOrderView({ onBack, onCreateOrder, priceConfig }: NewOrderViewProps) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [weight, setWeight] = useState(5.0);
  const [serviceType, setServiceType] = useState<ServiceType>('Wash Only');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [duration, setDuration] = useState(45);
  
  // Custom Date Picker State (datetime-local format: YYYY-MM-DDTHH:mm)
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const handleAdjustWeight = (amount: number) => {
    setWeight((prev) => {
      const newVal = prev + amount;
      return newVal < 0.5 ? 0.5 : (newVal > 8.0 ? 8.0 : parseFloat(newVal.toFixed(1)));
    });
  };

  const handleToggleAddon = (addon: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    );
  };

  const priceDetails = calculateOrderPrice(serviceType, weight, selectedAddOns, priceConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    onCreateOrder({
      customerName,
      phoneNumber: phoneNumber.trim() ? phoneNumber : '+1 (555) 000-0000',
      weight,
      serviceType,
      specialInstructions,
      notifySms,
      notifyInApp,
      loadSize: priceDetails.loadSize,
      addOns: selectedAddOns,
      totalAmount: priceDetails.totalAmount,
      isPaid: false,
      isPickedUp: false,
      createdAt: new Date(customDate).toISOString(),
      duration,
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest border-b border-outline-variant/10 flex justify-between items-center px-5 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1 rounded-full text-primary hover:bg-secondary-container/30 transition-colors active:scale-95 duration-200 cursor-pointer"
            id="back-button"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-headline text-xl font-bold text-primary">New Order</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            alt="Staff headshot" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdAP4pekCa5Zx7cFz88f82woOBhwSnkoxJ1TOl5V_cOVevwCyz5vsbLFxmrZfBAPbHnxWdN0VrgbuaGaQ2-cWvwBvyn8Y1_ciPSnUxAk0YZYE9bYpXUZ63cRVpMRSxeyoVQeA9wTq3lEsIgZEvkCIUeBpTtMVC8bGScwl-NoDJI4k1QQVT4-ZzwFKvJHjQYgLcAjQEDHRWyn2PCNEiyNkYZV9svlmS5m69wlfxYt2m5d0pdMGi8qD3HA"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-16 mb-24 flex-1 max-w-md mx-auto w-full px-5 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Identity Section */}
          <section className="space-y-4">
            <div className="relative">
              <label className="font-sans text-xs font-semibold text-outline mb-1 block ml-1">Customer Name</label>
              <input 
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:outline-none focus:ring-0 px-1 py-2 text-lg placeholder:text-outline-variant transition-all"
                placeholder="John Doe" 
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                id="customer-name-input"
              />
            </div>
            
            <div className="relative">
              <label className="font-sans text-xs font-semibold text-outline mb-1 block ml-1">Phone Number</label>
              <div className="flex items-center gap-2 border-b border-outline-variant focus-within:border-primary transition-all">
                <span className="text-on-surface-variant text-base font-medium">+1</span>
                <input 
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-2 text-lg placeholder:text-outline-variant"
                  placeholder="(555) 000-0000" 
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  id="phone-number-input"
                />
              </div>
            </div>

            <div className="relative pt-2">
              <label className="font-sans text-xs font-semibold text-outline mb-1.5 block ml-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Custom Order Date & Time</span>
              </label>
              <input 
                type="datetime-local" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer shadow-inner"
                id="custom-order-date-input"
              />
            </div>
          </section>

           {/* Service & Weight Bento Card */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 space-y-5 shadow-sm">
            {/* Weight Stepper */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline text-lg font-bold text-primary">Laundry Weight</h3>
                <p className="font-sans text-xs text-on-surface-variant font-medium">Max 8.0 kg per load</p>
              </div>
              <div className="flex items-center bg-secondary-container rounded-full p-1">
                <button 
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-primary hover:bg-surface-container-lowest/80 active:scale-90 transition-all cursor-pointer" 
                  onClick={() => handleAdjustWeight(-0.5)}
                  id="weight-minus"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="px-4 min-w-[64px] text-center flex flex-col justify-center">
                  <span className="font-headline text-lg font-bold text-on-secondary-container" id="weight-value">{weight.toFixed(1)}</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-on-secondary-container/80 font-bold">kg</span>
                </div>
                <button 
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest text-primary hover:bg-surface-container-lowest/80 active:scale-90 transition-all cursor-pointer" 
                  onClick={() => handleAdjustWeight(0.5)}
                  id="weight-plus"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-semibold text-outline">Service Type (Loads more or less 8kg, max 8kg)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Wash Only', icon: Droplet, desc: 'Wash cycle only' },
                  { name: 'Dry Only', icon: Wind, desc: 'Dry cycle only' },
                  { name: 'Deluxe', icon: Sparkles, desc: 'All-in (Wash, Dry, Detergent, Fab Conditioner)' }
                ].map((serv) => {
                  const IconComp = serv.icon;
                  const isSelected = serviceType === serv.name;
                  return (
                    <button
                      key={serv.name}
                      type="button"
                      onClick={() => setServiceType(serv.name as ServiceType)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer transition-all duration-200 text-center ${
                        isSelected 
                          ? 'bg-secondary-container border-primary text-primary shadow-sm ring-1 ring-primary' 
                          : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                      }`}
                      id={`service-${serv.name.replace(/\s+/g, '-').toLowerCase()}`}
                      title={serv.desc}
                    >
                      <IconComp className={`w-5 h-5 mb-1 ${isSelected ? 'text-primary' : 'text-outline'}`} />
                      <span className="font-sans text-xs font-semibold leading-tight">{serv.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

             {/* Custom Laundry Add-ons (Detergent, Softener, etc) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/35">
              <label className="font-sans text-xs font-semibold text-outline block">Premium Add-ons</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(priceConfig ? priceConfig.addOns : ADDON_PRICES).map(([addon, price]) => {
                  const isChecked = selectedAddOns.includes(addon);
                  const displayPrice = typeof price === 'number' ? price : 0;
                  return (
                    <button
                      key={addon}
                      type="button"
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        isChecked 
                          ? 'bg-secondary-container border-primary text-primary' 
                          : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-outline text-transparent'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{addon}</span>
                      </div>
                      <span className="text-primary">+{displayPrice ? `₱${displayPrice.toFixed(2)}` : 'Free'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cycle Duration Setting */}
            <div className="space-y-1.5 pt-2 border-t border-outline-variant/35">
              <label className="font-sans text-xs font-semibold text-outline block">Initial Cycle Duration (minutes)</label>
              <input 
                type="number"
                min="1"
                max="240"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner"
                id="order-initial-duration-input"
              />
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="mt-4 bg-primary/5 rounded-2xl p-4 border border-primary/20 text-left space-y-2">
              <h4 className="font-headline text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/10 pb-1.5">Estimated Pricing summary</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Load Size Classification:</span>
                  <span className="font-bold text-on-surface">{priceDetails.loadSize} Load ({weight.toFixed(1)} kg)</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Base Rate ({serviceType}):</span>
                  <span className="font-bold text-on-surface">₱{(priceDetails.totalAmount - selectedAddOns.reduce((sum, a) => sum + ((priceConfig ? priceConfig.addOns : ADDON_PRICES)[a] || 0), 0)).toFixed(2)}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Add-ons Subtotal:</span>
                    <span className="font-bold text-on-surface">₱{selectedAddOns.reduce((sum, a) => sum + ((priceConfig ? priceConfig.addOns : ADDON_PRICES)[a] || 0), 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-primary font-bold text-sm pt-1.5 border-t border-primary/10">
                  <span>Estimated Total:</span>
                  <span>₱{priceDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Special Instructions */}
          <section className="space-y-1">
            <label className="font-sans text-xs font-semibold text-outline ml-1" htmlFor="special-instructions">Special Instructions</label>
            <textarea 
              id="special-instructions"
              className="w-full min-h-[100px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm placeholder:text-outline-variant/60 shadow-sm"
              placeholder="e.g. No fabric softener for the white load, hang dry the silk blouse..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </section>

          {/* Notification Preferences */}
          <section className="space-y-3">
            <h3 className="font-headline text-xs font-bold text-primary uppercase tracking-wider ml-1">Notify customer via:</h3>
            <div className="space-y-2">
              {/* SMS Toggle */}
              <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-sans text-sm font-bold text-on-surface">SMS / Mobile</p>
                    <p className="text-[10px] text-outline">Real-time text updates</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifySms(!notifySms)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: notifySms ? 'var(--color-primary)' : 'var(--color-outline)' }}
                  id="sms-toggle"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: notifySms ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                  />
                </button>
              </div>

              {/* In-App Toggle */}
              <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-sans text-sm font-bold text-on-surface">In-App Notification</p>
                    <p className="text-[10px] text-outline">Push alerts to their device</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyInApp(!notifyInApp)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: notifyInApp ? 'var(--color-primary)' : 'var(--color-outline)' }}
                  id="inapp-toggle"
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: notifyInApp ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Action Area (Sticky-like styling but flows nicely) */}
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full font-headline font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(129,140,248,0.25)] cursor-pointer"
              id="submit-order-button"
            >
              <span>Create Order</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
