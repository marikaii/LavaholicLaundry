/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, ChevronDown, ChevronUp, Play, Bell, 
  Droplet, Layers, Wind, Check, Flame, X, CheckSquare, ListOrdered, ClipboardList, RefreshCw, LogOut, Settings, TrendingUp, DollarSign, Calendar, Download, MessageSquare, Send 
} from 'lucide-react';
import { Order, OrderStatus, NotificationLog, ChatMessage } from '../types';

interface StaffDashboardProps {
  orders: Order[];
  notificationLogs: NotificationLog[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddNewOrderClick: () => void;
  onSendNotification: (order: Order) => void;
  onSwitchToCustomerView: () => void;
  onSignOut: () => void;
  activeTab: 'orders' | 'logs' | 'sales' | 'pricing' | 'support';
  onChangeTab: (tab: 'orders' | 'logs' | 'sales' | 'pricing' | 'support') => void;
  priceConfig: any;
  onUpdatePriceConfig: (newConfig: any) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (threadId: string, sender: 'customer' | 'staff', senderName: string, text: string) => void;
}

export default function StaffDashboard({
  orders,
  notificationLogs,
  onUpdateOrder,
  onAddNewOrderClick,
  onSendNotification,
  onSwitchToCustomerView,
  onSignOut,
  activeTab,
  onChangeTab,
  priceConfig,
  onUpdatePriceConfig,
  chatMessages,
  onSendChatMessage,
}: StaffDashboardProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({
    'LAV8829': true, // Expanded by default in mockup
  });

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [staffChatInput, setStaffChatInput] = useState('');

  const [exportPreset, setExportPreset] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleExportCSV = () => {
    // Columns: Order ID, Customer Name, Phone, Service, Weight, Status, Duration, Total Amount, Is Paid, Is Picked Up, Created At
    const headers = ['Order ID', 'Customer Name', 'Phone Number', 'Service Type', 'Weight (kg)', 'Status', 'Duration Left (min)', 'Total Amount (PHP)', 'Is Paid', 'Is Picked Up', 'Created At'];
    
    const rows = orders.map(o => [
      o.id,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.phoneNumber}"`,
      `"${o.serviceType}"`,
      o.weight,
      o.status,
      o.duration,
      (o.totalAmount || 0).toFixed(2),
      o.isPaid ? 'Yes' : 'No',
      o.isPickedUp ? 'Yes' : 'No',
      new Date(o.createdAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lavaholic_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSalesCSV = () => {
    const now = new Date();
    let filteredOrders = orders.filter(o => o.status !== 'Cancelled');

    if (exportPreset === 'daily') {
      const todayStr = now.toDateString();
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
    } else if (exportPreset === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
    } else if (exportPreset === 'monthly') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredOrders = filteredOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (exportPreset === 'yearly') {
      const currentYear = now.getFullYear();
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt).getFullYear() === currentYear);
    } else if (exportPreset === 'custom') {
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= start);
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= end);
      }
    }

    // Columns: Transaction Date, Order ID, Customer Name, Service Type, Weight, Total Amount, Payment Status, Pickup Status
    const headers = ['Transaction Date', 'Order ID', 'Customer Name', 'Service Type', 'Weight (kg)', 'Total Amount (PHP)', 'Payment Status', 'Pickup Status'];
    
    const rows = filteredOrders.map(o => [
      `"${new Date(o.createdAt).toLocaleString()}"`,
      o.id,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.serviceType}"`,
      o.weight,
      (o.totalAmount || 0).toFixed(2),
      o.isPaid ? 'Paid' : 'Unpaid',
      o.isPickedUp ? 'Picked Up' : 'Pending'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lavaholic_sales_export_${exportPreset}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleAdjustDuration = (orderId: string, currentDuration: number, amount: number) => {
    const newVal = Math.max(0, currentDuration + amount);
    onUpdateOrder(orderId, { duration: newVal });
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    onUpdateOrder(orderId, { status });
  };

  // Helper to choose status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Sorting':
        return <ListOrdered className="w-6 h-6 text-primary" />;
      case 'Washing':
        return <Droplet className="w-6 h-6 text-primary" />;
      case 'Drying':
        return <Wind className="w-6 h-6 text-primary animate-pulse" />;
      case 'Folding':
        return <Layers className="w-6 h-6 text-outline" />;
      case 'Ready':
        return <Check className="w-6 h-6 text-primary stroke-[3]" />;
      case 'Cancelled':
        return <X className="w-6 h-6 text-error" />;
      default:
        return <Droplet className="w-6 h-6 text-outline" />;
    }
  };

  // Stats calculation
  const inProgressCount = orders.filter(o => o.status !== 'Ready' && o.status !== 'Cancelled').length;
  const readyCount = orders.filter(o => o.status === 'Ready').length;

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-container-lowest border-b border-outline-variant/10 flex justify-between items-center px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <span className="font-headline text-lg font-bold text-primary">Lavaholic</span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">Staff</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Switch to Customer Portal button */}
          <button 
            onClick={onSwitchToCustomerView}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-primary/20 text-[11px] font-bold text-primary hover:bg-secondary-container transition-all active:scale-95 cursor-pointer"
            id="switch-to-customer-portal-btn"
            title="Switch to customer mode"
          >
            <span>Customer View</span>
          </button>
          
          {/* Sign Out button */}
          <button 
            onClick={onSignOut}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-error/10 hover:bg-error/20 text-[11px] font-bold text-error transition-all active:scale-95 cursor-pointer"
            id="staff-sign-out-btn"
            title="Log out of Staff portal"
          >
            <LogOut className="w-3.5 h-3.5 text-error" />
            <span>Sign Out</span>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20 hidden sm:block">
            <img 
              className="w-full h-full object-cover" 
              alt="Manager portrait" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD10UOYfUGXRYhKyndxHauhXQfyNTVJDKyBnZgn61YU21bMPdqoGaERE_WClXjJXsT47X5kWsov1wD3YJSmyGSNPUsJyFSrI0h6NVZNn3su_JWyoCIzcuecmyukIiCqaZ-TOxHFccMm5NkXxT880sTjiu8DGysddFMsqor9RLHfZl8iHokl27Nup_Il71mHyHrHRE552Ie2c3rcC4ykf3SQ8TE5oASVLgvShYqAupyIXOf-es0FnlkpKA"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-20 px-5 max-w-md md:max-w-xl mx-auto w-full flex-1">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Dashboard Header */}
            <div className="mb-4">
              <h2 className="font-headline text-2xl font-bold text-on-background">Active Orders</h2>
              <p className="font-sans text-xs text-on-surface-variant font-medium">Manage {orders.length} ongoing cycles in the hub</p>
            </div>

            {/* Create Order & Export Actions */}
            <div className="flex gap-3 mb-4">
              <button 
                onClick={onAddNewOrderClick}
                className="flex-1 bg-primary hover:bg-primary/95 text-white py-3.5 rounded-2xl font-sans text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                id="add-order-shortcut-btn"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add New Order</span>
              </button>
              
              <button 
                onClick={handleExportCSV}
                className="px-4 bg-secondary-container text-primary hover:bg-secondary-container/85 py-3.5 rounded-2xl font-sans text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-primary/10 shadow-sm cursor-pointer"
                id="export-orders-btn"
                title="Export order summary to CSV"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.id];
                return (
                  <div 
                    key={order.id}
                    className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                    id={`order-card-${order.id}`}
                  >
                    {/* Collapsed Header */}
                    <div 
                      onClick={() => toggleExpand(order.id)}
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans text-sm font-bold text-on-surface">#{order.id}</span>
                            <span className={`px-2 py-0.5 font-bold text-[9px] uppercase rounded tracking-wider ${
                              order.status === 'Sorting' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'Washing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Drying' ? 'bg-cyan-100 text-primary' :
                              order.status === 'Folding' ? 'bg-stone-100 text-outline' :
                              order.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                            {order.customerName} • {order.weight}kg • {order.serviceType}
                          </p>
                        </div>
                      </div>
                      <button className="text-outline hover:text-on-surface transition-colors cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Expanded Controls */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-outline-variant/30 pt-4 bg-surface-container-low/20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Duration Control */}
                          <div className="space-y-1">
                            <label className="font-sans text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Duration (min)</label>
                            <div className="flex items-center border border-outline rounded-xl overflow-hidden w-full bg-surface-container-lowest shadow-inner">
                              <button 
                                className="px-3 py-2 hover:bg-surface-container transition-colors active:scale-95 font-bold text-primary cursor-pointer"
                                onClick={() => handleAdjustDuration(order.id, order.duration, -5)}
                                id={`adjust-duration-minus-${order.id}`}
                              >
                                -
                              </button>
                              <input 
                                className="w-full text-center border-none focus:ring-0 font-sans font-bold text-on-surface text-sm bg-transparent focus:bg-surface-container-low focus:outline-none rounded-md px-1" 
                                type="number" 
                                value={order.duration} 
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  onUpdateOrder(order.id, { duration: val });
                                }}
                              />
                              <button 
                                className="px-3 py-2 hover:bg-surface-container transition-colors active:scale-95 font-bold text-primary cursor-pointer"
                                onClick={() => handleAdjustDuration(order.id, order.duration, 5)}
                                id={`adjust-duration-plus-${order.id}`}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Status Update Dropdown */}
                          <div className="space-y-1">
                            <label className="font-sans text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Update Status</label>
                            <select 
                              className="w-full bg-surface-container-lowest border border-outline rounded-xl px-3 py-2 font-sans text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer shadow-sm"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              id={`status-dropdown-${order.id}`}
                            >
                              <option value="Sorting">Sorting</option>
                              <option value="Washing">Washing</option>
                              <option value="Drying">Drying</option>
                              <option value="Folding">Folding</option>
                              <option value="Ready">Ready</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customizable Order Date & Time */}
                        <div className="mb-4 bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/20 text-left space-y-1">
                          <label className="font-sans text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-primary">calendar_month</span>
                            <span>Order Placement Date & Time</span>
                          </label>
                          <input 
                            type="datetime-local" 
                            value={(() => {
                              const d = new Date(order.createdAt);
                              const pad = (n: number) => n.toString().padStart(2, '0');
                              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                            })()}
                            onChange={(e) => {
                              const selected = new Date(e.target.value);
                              if (!isNaN(selected.getTime())) {
                                onUpdateOrder(order.id, { createdAt: selected.toISOString() });
                              }
                            }}
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg px-2.5 py-1.5 font-sans text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer shadow-sm"
                            id={`order-date-${order.id}`}
                          />
                        </div>

                        {/* Add-ons and Pricing Summary */}
                        <div className="mb-4 bg-surface-container p-3 rounded-xl border border-outline-variant/35 text-left space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-on-surface">Load Size:</span>
                            <span className="font-bold text-primary">{order.loadSize || 'Medium'}</span>
                          </div>
                          {order.addOns && order.addOns.length > 0 && (
                            <div className="text-xs">
                              <span className="font-bold text-on-surface block mb-1">Add-ons:</span>
                              <div className="flex flex-wrap gap-1">
                                {order.addOns.map(addon => (
                                  <span key={addon} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-bold">
                                    {addon}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs pt-1 border-t border-outline-variant/30">
                            <span className="font-bold text-on-surface">Total Amount:</span>
                            <span className="font-bold text-primary text-sm">₱{(order.totalAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateOrder(order.id, { isPaid: !order.isPaid });
                              }}
                              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all border ${
                                order.isPaid 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              id={`toggle-paid-${order.id}`}
                            >
                              {order.isPaid ? '✓ Paid' : 'Mark as Paid'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextPickedUp = !order.isPickedUp;
                                const updates: Partial<Order> = { isPickedUp: nextPickedUp };
                                if (nextPickedUp) {
                                  updates.status = 'Ready';
                                  updates.duration = 0;
                                }
                                onUpdateOrder(order.id, updates);
                              }}
                              className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all border ${
                                order.isPickedUp 
                                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                  : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                              }`}
                              id={`toggle-pickedup-${order.id}`}
                            >
                              {order.isPickedUp ? '✓ Picked Up' : 'Mark as Picked Up'}
                            </button>
                          </div>
                        </div>

                        {/* Special instructions preview inside expand details */}
                        {order.specialInstructions && (
                          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                            <span className="text-[9px] font-bold text-yellow-800 uppercase tracking-wider block">Special Instructions</span>
                            <p className="text-xs text-yellow-900 mt-0.5">{order.specialInstructions}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button 
                            className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-sans text-xs font-bold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                            onClick={() => {
                              const updates: Partial<Order> = {};
                              if (order.status === 'Sorting') {
                                updates.status = 'Washing';
                              }
                              updates.duration = Math.max(1, order.duration - 1);
                              onUpdateOrder(order.id, updates);
                            }}
                            id={`start-cycle-btn-${order.id}`}
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start / Resume Cycle</span>
                          </button>
                          
                          <button 
                            className="w-full border border-primary text-primary py-3 rounded-xl font-sans text-xs font-bold hover:bg-primary/5 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                            onClick={() => onSendNotification(order)}
                            id={`notify-customer-btn-${order.id}`}
                          >
                            <Bell className="w-4 h-4" />
                            <span>Send Pickup Notification</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Productivity Bento-styled summary */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-secondary-container p-4 rounded-2xl shadow-sm">
                <p className="font-sans text-xs text-on-secondary-container uppercase tracking-wider font-bold">In-Progress</p>
                <p className="font-headline text-3xl font-bold text-primary mt-1">{inProgressCount < 10 ? `0${inProgressCount}` : inProgressCount}</p>
              </div>
              <div className="bg-surface-container-high p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
                <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider font-bold">Ready for Pickup</p>
                <p className="font-headline text-3xl font-bold text-primary mt-1">{readyCount < 10 ? `0${readyCount}` : readyCount}</p>
              </div>
            </div>

            {/* Simulation Controls (Styled cleanly as a bottom card) */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 mt-6 space-y-4 shadow-sm text-left">
              <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                <Settings className="w-4 h-4 text-primary" />
                <span>Simulation Controls</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[11px] font-bold text-on-surface">Sample Orders</h4>
                  <p className="text-[9px] text-outline mb-2">Replenish data to initial state.</p>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to restore the default sample orders? This will overwrite your current progress.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2 bg-secondary-container text-primary font-bold text-[10px] rounded-lg hover:bg-secondary-container/80 transition-all cursor-pointer text-center"
                    id="reset-sample-orders-btn"
                  >
                    Restore Defaults
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-on-surface">Mock Live Countdown</h4>
                  <p className="text-[9px] text-outline mb-2">Simulate real-time cycle progress.</p>
                  <button 
                    onClick={() => {
                      orders.forEach(o => {
                        if (o.status !== 'Ready' && o.status !== 'Cancelled') {
                          onUpdateOrder(o.id, { duration: Math.max(0, o.duration - 1) });
                        }
                      });
                    }}
                    className="w-full py-2 bg-primary text-white font-bold text-[10px] rounded-lg hover:bg-primary/90 transition-all cursor-pointer text-center"
                    id="sim-countdown-btn"
                  >
                    Simulate -1 min
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="font-headline text-2xl font-bold text-on-background">Live Support Chat</h2>
              <p className="font-sans text-xs text-on-surface-variant font-medium">Chat directly with online customers in real time</p>
            </div>

            {(() => {
              // Get list of active customer names from orders
              const customerNamesFromOrders = orders.map(o => o.customerName);
              // Get list of customer names from existing chat messages
              const customerNamesFromChats = chatMessages.map(m => m.threadId);
              // Combine and unique
              const threadsList = Array.from(new Set([...customerNamesFromChats, ...customerNamesFromOrders]))
                .filter(t => t && t !== 'System' && t !== 'General' && t !== 'Support Bot' && t !== 'Laundry Support' && t !== 'Live Chat Support');

              // Select the first thread by default if none is chosen
              const activeThread = selectedThread || (threadsList.length > 0 ? threadsList[0] : null);

              // Filter messages for active thread
              const activeMessages = activeThread 
                ? chatMessages.filter(m => m.threadId === activeThread || m.threadId === 'System') 
                : [];

              const handleSendStaffMessage = (e: React.FormEvent) => {
                e.preventDefault();
                if (!staffChatInput.trim() || !activeThread) return;
                onSendChatMessage(activeThread, 'staff', 'Laundry Support', staffChatInput.trim());
                setStaffChatInput('');
              };

              return (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-md flex flex-col md:grid md:grid-cols-3 h-[500px]">
                  {/* Left Column: Thread List */}
                  <div className="border-b md:border-b-0 md:border-r border-outline-variant/20 flex flex-col h-[150px] md:h-full bg-surface-container-low/30 overflow-y-auto">
                    <div className="p-3 bg-surface-container-low border-b border-outline-variant/25">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Active Conversations</span>
                    </div>
                    {threadsList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-outline font-semibold">
                        No active customers to chat with.
                      </div>
                    ) : (
                      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible divide-x md:divide-x-0 md:divide-y divide-outline-variant/15">
                        {threadsList.map((thread) => {
                          const isSelected = activeThread === thread;
                          const threadMsgs = chatMessages.filter(m => m.threadId === thread);
                          const lastMsg = threadMsgs[threadMsgs.length - 1];
                          const unreadCount = threadMsgs.filter(m => m.sender === 'customer').length; // For simple demo

                          return (
                            <button
                              key={thread}
                              onClick={() => setSelectedThread(thread)}
                              className={`flex-shrink-0 md:flex-shrink flex items-center gap-3 p-3 text-left w-[180px] md:w-full hover:bg-surface-container-low transition-all cursor-pointer ${
                                isSelected ? 'bg-secondary-container/40 md:bg-secondary-container/30 border-l-2 border-primary' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {thread.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-1">
                                  <h4 className="text-xs font-bold text-on-surface truncate">{thread}</h4>
                                  {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-outline truncate mt-0.5 font-medium">
                                  {lastMsg ? lastMsg.text : 'No messages yet'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right 2 Columns: Active Conversation Chat Box */}
                  <div className="col-span-2 flex flex-col h-[350px] md:h-full bg-background/30">
                    {activeThread ? (
                      <>
                        {/* Thread Header */}
                        <div className="p-3 bg-surface-container-low border-b border-outline-variant/25 flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-bold text-on-surface flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                              Chat with {activeThread}
                            </h3>
                            <p className="text-[9px] text-outline font-semibold">Customer Live Link • Lavaholic Hub</p>
                          </div>
                        </div>

                        {/* Thread Chat Body */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col bg-background/10">
                          {activeMessages.map((msg, i) => {
                            const isStaff = msg.sender === 'staff';
                            return (
                              <div
                                key={msg.id || i}
                                className={`flex ${isStaff ? 'justify-end' : 'justify-start'} animate-in fade-in duration-100`}
                              >
                                <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed text-left ${
                                  isStaff
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white border border-outline-variant/30 text-on-surface rounded-tl-none shadow-sm'
                                }`}>
                                  {!isStaff && (
                                    <span className="block font-bold text-[9px] text-primary mb-0.5">
                                      {msg.senderName} (Customer)
                                    </span>
                                  )}
                                  {isStaff && (
                                    <span className="block font-bold text-[9px] text-white/80 mb-0.5">
                                      {msg.senderName} (Staff)
                                    </span>
                                  )}
                                  <p>{msg.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Thread Input Bar */}
                        <form onSubmit={handleSendStaffMessage} className="p-3 bg-surface-container border-t border-outline-variant/20 flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${activeThread}...`}
                            className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-primary focus:ring-0"
                            value={staffChatInput}
                            onChange={(e) => setStaffChatInput(e.target.value)}
                            id="staff-chat-reply-input"
                          />
                          <button
                            type="submit"
                            className="bg-primary text-white p-2 rounded-full hover:opacity-90 active:scale-95 transition-transform cursor-pointer shadow-sm"
                            id="staff-chat-send-btn"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-outline">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">Select a customer conversation from the list to start chatting.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="font-headline text-2xl font-bold text-on-background">Notification History</h2>
              <p className="font-sans text-xs text-on-surface-variant font-medium">Real-time SMS &amp; push logs dispatched to customers</p>
            </div>

            {notificationLogs.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 text-center rounded-2xl border border-outline-variant/20 text-outline">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-55" />
                <p className="text-sm">No notifications sent yet in this session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationLogs.map((log) => (
                  <div key={log.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/25 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-xs font-bold text-primary">#{log.orderId}</span>
                      <span className="text-[10px] text-outline font-semibold">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-bold text-on-surface">{log.customerName} ({log.phoneNumber})</p>
                    <div className="bg-secondary-container/30 border border-secondary-container/20 p-2.5 rounded-lg text-xs italic text-on-secondary-container mt-2">
                      "{log.message}"
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-bold">
                      <span className="text-outline">Channel: <strong className="text-on-surface-variant">{log.channel}</strong></span>
                      <span className="flex items-center gap-1 text-primary">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (() => {
          const now = new Date();
          const todayStr = now.toDateString();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Daily Sales
          const dailyOrders = orders.filter(o => o.status !== 'Cancelled' && new Date(o.createdAt).toDateString() === todayStr);
          const dailySalesTotal = dailyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          const dailyPaidCount = dailyOrders.filter(o => o.isPaid).length;

          // Monthly Sales
          const monthlyOrders = orders.filter(o => {
            const d = new Date(o.createdAt);
            return o.status !== 'Cancelled' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });
          const monthlySalesTotal = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          const monthlyPaidCount = monthlyOrders.filter(o => o.isPaid).length;

          // Overall Sales
          const activeOrders = orders.filter(o => o.status !== 'Cancelled');
          const overallSalesTotal = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          const overallPaidCount = activeOrders.filter(o => o.isPaid).length;

          return (
            <div className="space-y-6 text-left">
              <div className="mb-4">
                <h2 className="font-headline text-2xl font-bold text-on-background">Sales Dashboard</h2>
                <p className="font-sans text-xs text-on-surface-variant font-medium">Real-time financial summaries and transaction health</p>
              </div>

              {/* Grid of Stats Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Daily Card */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex justify-between items-start">
                    <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-wider">Daily Sales</span>
                    <span className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="font-headline text-2xl font-extrabold text-on-surface block">₱{dailySalesTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-outline font-semibold block mt-0.5">
                      {dailyOrders.length} orders ({dailyPaidCount} paid)
                    </span>
                  </div>
                </div>

                {/* Monthly Card */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary" />
                  <div className="flex justify-between items-start">
                    <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-wider">Monthly Sales</span>
                    <span className="p-1.5 bg-secondary/15 rounded-lg text-primary">
                      <Calendar className="w-4 h-4 text-primary" />
                    </span>
                  </div>
                  <div>
                    <span className="font-headline text-2xl font-extrabold text-on-surface block">₱{monthlySalesTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-outline font-semibold block mt-0.5">
                      {monthlyOrders.length} orders ({monthlyPaidCount} paid)
                    </span>
                  </div>
                </div>

                {/* Overall Card */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <div className="flex justify-between items-start">
                    <span className="font-sans text-[11px] font-bold text-outline uppercase tracking-wider">Overall Sales</span>
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="font-headline text-2xl font-extrabold text-on-surface block">₱{overallSalesTotal.toFixed(2)}</span>
                    <span className="text-[10px] text-outline font-semibold block mt-0.5">
                      {activeOrders.length} active orders ({overallPaidCount} paid)
                    </span>
                  </div>
                </div>
              </div>

              {/* Exporter Section */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-primary" />
                    Export Sales Report
                  </h3>
                  <p className="text-[10px] text-outline font-semibold">Generate and download CSV reports based on custom date ranges or preset periods.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold text-outline uppercase block mb-1.5">Preset Period</label>
                    <div className="grid grid-cols-5 gap-1 bg-surface-container-low p-1 rounded-xl">
                      {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setExportPreset(preset)}
                          className={`py-1.5 px-1 text-[9px] font-bold rounded-lg transition-all capitalize cursor-pointer text-center ${
                            exportPreset === preset
                              ? 'bg-primary text-white shadow-sm font-extrabold'
                              : 'text-outline hover:text-on-surface'
                          }`}
                        >
                          {preset === 'daily' ? 'Daily' : preset === 'weekly' ? '7 Days' : preset === 'monthly' ? 'Month' : preset === 'yearly' ? 'Year' : 'Custom'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportPreset === 'custom' ? (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary font-medium"
                          id="sales-export-start-date"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-outline uppercase block mb-1">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary font-medium"
                          id="sales-export-end-date"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end">
                      <div className="bg-surface-container-low/50 border border-outline-variant/15 p-2 rounded-xl w-full text-left">
                        <span className="text-[10px] text-outline font-semibold block">Active Period Filter:</span>
                        <span className="text-xs font-bold text-on-surface block capitalize">
                          {exportPreset === 'daily' && 'Today Only'}
                          {exportPreset === 'weekly' && 'Last 7 Days'}
                          {exportPreset === 'monthly' && 'Current Calendar Month'}
                          {exportPreset === 'yearly' && 'Current Calendar Year'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleExportSalesCSV}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
                    id="sales-export-download-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV Report
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-3">
                <h3 className="font-headline text-sm font-bold text-primary border-b border-outline-variant/20 pb-2">
                  Recent Sales Records
                </h3>
                {activeOrders.length === 0 ? (
                  <p className="text-xs text-outline text-center py-4">No active sales records found.</p>
                ) : (
                  <div className="divide-y divide-outline-variant/25 max-h-80 overflow-y-auto pr-1">
                    {activeOrders.slice().reverse().map(o => (
                      <div key={o.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-on-surface">Order #{o.id}</span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-outline text-[10px]">{o.customerName}</span>
                          </div>
                          <span className="text-[10px] text-outline block mt-0.5">
                            {new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary block">₱{(o.totalAmount || 0).toFixed(2)}</span>
                          <span className={`text-[9px] font-bold ${o.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {o.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === 'pricing' && (
          <div className="space-y-6 text-left">
            <div className="mb-4">
              <h2 className="font-headline text-2xl font-bold text-on-background">Pricing Configuration</h2>
              <p className="font-sans text-xs text-on-surface-variant font-medium">Update standard rates for wash levels and premium add-ons</p>
            </div>

            {/* Service Prices Column */}
            <div className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
                <h3 className="font-headline text-sm font-bold text-primary border-b border-outline-variant/20 pb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">local_laundry_service</span>
                  <span>Base Rates (by Load Classification)</span>
                </h3>

                <div className="space-y-4">
                  {Object.entries(priceConfig?.services || {}).map(([serviceName, classifications]: [string, any]) => (
                    <div key={serviceName} className="space-y-2 border-b border-outline-variant/15 pb-4 last:border-0 last:pb-0">
                      <span className="text-xs font-bold text-on-surface block">{serviceName}</span>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Light */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-outline uppercase block">Light Load</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-xs font-bold text-outline">₱</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={classifications.light}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = {
                                  ...priceConfig,
                                  services: {
                                    ...priceConfig.services,
                                    [serviceName]: {
                                      ...classifications,
                                      light: val
                                    }
                                  }
                                };
                                onUpdatePriceConfig(updated);
                              }}
                              className="w-full bg-surface border border-outline-variant rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-on-surface font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Medium */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-outline uppercase block">Medium Load</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-xs font-bold text-outline">₱</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={classifications.medium}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = {
                                  ...priceConfig,
                                  services: {
                                    ...priceConfig.services,
                                    [serviceName]: {
                                      ...classifications,
                                      medium: val
                                    }
                                  }
                                };
                                onUpdatePriceConfig(updated);
                              }}
                              className="w-full bg-surface border border-outline-variant rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-on-surface font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Heavy */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-outline uppercase block">Heavy Load</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-xs font-bold text-outline">₱</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={classifications.heavy}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = {
                                  ...priceConfig,
                                  services: {
                                    ...priceConfig.services,
                                    [serviceName]: {
                                      ...classifications,
                                      heavy: val
                                    }
                                  }
                                };
                                onUpdatePriceConfig(updated);
                              }}
                              className="w-full bg-surface border border-outline-variant rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-on-surface font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addon Prices Card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-sm space-y-4">
                <h3 className="font-headline text-sm font-bold text-primary border-b border-outline-variant/20 pb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">soap</span>
                  <span>Premium Add-ons & Detergents</span>
                </h3>

                <div className="space-y-3">
                  {Object.entries(priceConfig?.addOns || {}).map(([addonName, price]: [string, any]) => (
                    <div key={addonName} className="flex items-center justify-between gap-4 py-1.5 border-b border-outline-variant/10 last:border-0 last:pb-0">
                      <span className="text-xs text-on-surface font-semibold">{addonName}</span>
                      <div className="relative flex items-center w-28">
                        <span className="absolute left-2.5 text-xs font-bold text-outline">₱</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = {
                              ...priceConfig,
                              addOns: {
                                ...priceConfig.addOns,
                                [addonName]: val
                              }
                            };
                            onUpdatePriceConfig(updated);
                          }}
                          className="w-full bg-surface border border-outline-variant rounded-xl pl-6 pr-2.5 py-1.5 text-xs text-on-surface font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,104,119,0.05)]">
        <div className="flex justify-around items-center w-full max-w-md mx-auto px-2 pb-4 pt-2">
          {/* Orders */}
          <button 
            onClick={() => onChangeTab('orders')}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-secondary-container text-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-low/50'
            }`}
            id="tab-staff-orders"
          >
            <ClipboardList className={`w-4 h-4 ${activeTab === 'orders' ? 'text-primary' : 'text-outline'}`} />
            <span className="text-[9px] mt-1">Orders</span>
          </button>

          {/* Sales Summary */}
          <button 
            onClick={() => onChangeTab('sales')}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'sales' 
                ? 'bg-secondary-container text-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-low/50'
            }`}
            id="tab-staff-sales"
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'sales' ? 'text-primary' : 'text-outline'}`} />
            <span className="text-[9px] mt-1">Sales</span>
          </button>

          {/* Edit Prices */}
          <button 
            onClick={() => onChangeTab('pricing')}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'pricing' 
                ? 'bg-secondary-container text-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-low/50'
            }`}
            id="tab-staff-pricing"
          >
            <DollarSign className={`w-4 h-4 ${activeTab === 'pricing' ? 'text-primary' : 'text-outline'}`} />
            <span className="text-[9px] mt-1">Prices</span>
          </button>

          {/* Alerts / History */}
          <button 
            onClick={() => onChangeTab('logs')}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 relative transition-all duration-200 cursor-pointer ${
              activeTab === 'logs' 
                ? 'bg-secondary-container text-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-low/50'
            }`}
            id="tab-staff-alerts"
          >
            <Bell className={`w-4 h-4 ${activeTab === 'logs' ? 'text-primary' : 'text-outline'}`} />
            <span className="text-[9px] mt-1">Alerts</span>
            {notificationLogs.length > 0 && activeTab !== 'logs' && (
              <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-error rounded-full"></div>
            )}
          </button>

          {/* Support Chat */}
          <button 
            onClick={() => onChangeTab('support')}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 relative transition-all duration-200 cursor-pointer ${
              activeTab === 'support' 
                ? 'bg-secondary-container text-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-low/50'
            }`}
            id="tab-staff-support"
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'support' ? 'text-primary' : 'text-outline'}`} />
            <span className="text-[9px] mt-1">Support</span>
            {chatMessages.filter(m => m.sender === 'customer').length > 0 && activeTab !== 'support' && (
              <span className="absolute top-1 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
