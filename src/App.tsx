/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_ORDERS, INITIAL_NOTIFICATIONS, Order, NotificationLog, DEFAULT_PRICE_CONFIG, ChatMessage } from './types';
import CustomerView from './components/CustomerView';
import StaffDashboard from './components/StaffDashboard';
import NewOrderView from './components/NewOrderView';
import NotificationSentView from './components/NotificationSentView';
import WelcomeView from './components/WelcomeView';

export default function App() {
  // Roles: 'welcome' | 'customer' | 'staff'
  const [role, setRole] = useState<'welcome' | 'customer' | 'staff'>('welcome');

  // Customer's entered name
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('lavaholic_customer_name') || '';
    } catch (e) {
      return '';
    }
  });
  
  // Views inside Staff mode: 'dashboard' | 'new_order' | 'notification_sent'
  const [view, setView] = useState<'dashboard' | 'new_order' | 'notification_sent'>('dashboard');

  // Active tab within Staff mode: 'orders' | 'logs' | 'sales' | 'pricing' | 'support'
  const [staffTab, setStaffTab] = useState<'orders' | 'logs' | 'sales' | 'pricing' | 'support'>('orders');

  // Timer Speed configuration: 'realtime' (1m per 60s) | 'demo' (1m per 1s)
  const [timerSpeed, setTimerSpeed] = useState<'realtime' | 'demo'>(() => {
    try {
      const saved = localStorage.getItem('lavaholic_timer_speed');
      return (saved as 'realtime' | 'demo') || 'demo';
    } catch (e) {
      return 'demo';
    }
  });

  // Sync timerSpeed to localStorage
  useEffect(() => {
    localStorage.setItem('lavaholic_timer_speed', timerSpeed);
  }, [timerSpeed]);

  // Live Chat messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lavaholic_chat_messages');
      return saved ? JSON.parse(saved) : [
        {
          id: 'initial',
          threadId: 'System',
          sender: 'staff',
          senderName: 'Support Bot',
          text: 'Hi! Welcome to Lavaholic Support. How can we help you with your laundry order today?',
          timestamp: new Date().toISOString()
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Price configuration state
  const [priceConfig, setPriceConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('lavaholic_price_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.services && 'Wash & Fold' in parsed.services) {
          return DEFAULT_PRICE_CONFIG;
        }
        return {
          ...DEFAULT_PRICE_CONFIG,
          ...parsed,
          services: {
            ...DEFAULT_PRICE_CONFIG.services,
            ...(parsed.services || {})
          },
          addOns: {
            ...DEFAULT_PRICE_CONFIG.addOns,
            ...(parsed.addOns || {})
          }
        };
      }
      return DEFAULT_PRICE_CONFIG;
    } catch (e) {
      return DEFAULT_PRICE_CONFIG;
    }
  });

  // Load state from localStorage or default to initial data
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('lavaholic_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('lavaholic_logs');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Reference for the notification success screen
  const [justNotified, setJustNotified] = useState<{
    orderId: string;
    customerName: string;
    phoneNumber: string;
    message: string;
  } | null>(null);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('lavaholic_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lavaholic_logs', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  useEffect(() => {
    localStorage.setItem('lavaholic_price_config', JSON.stringify(priceConfig));
  }, [priceConfig]);

  useEffect(() => {
    localStorage.setItem('lavaholic_customer_name', customerName);
  }, [customerName]);

  // Sync chat messages to localStorage and handle cross-tab synchronization
  useEffect(() => {
    localStorage.setItem('lavaholic_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lavaholic_chat_messages' && e.newValue) {
        try {
          setChatMessages(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing synced chat messages:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSendChatMessage = (threadId: string, sender: 'customer' | 'staff', senderName: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `MSG-${Math.floor(100000 + Math.random() * 900000)}`,
      threadId,
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  // Automatic real-time countdown timer for active cycles (Washing, Drying, Folding)
  useEffect(() => {
    const delay = timerSpeed === 'demo' ? 1000 : 60000;
    const timer = setInterval(() => {
      setOrders((prevOrders) => {
        let changed = false;
        const updated = prevOrders.map((order) => {
          const isCycleActive = order.status === 'Washing' || order.status === 'Drying' || order.status === 'Folding';
          if (isCycleActive && order.duration > 0) {
            changed = true;
            const nextDuration = order.duration - 1;
            
            // Auto transition state based on remaining fraction of totalDuration
            let nextStatus = order.status;
            const third = Math.ceil(order.totalDuration / 3);
            const twoThirds = Math.ceil((order.totalDuration * 2) / 3);

            if (nextDuration <= 0) {
              nextStatus = 'Ready';
            } else if (order.status === 'Washing' && nextDuration <= twoThirds) {
              nextStatus = 'Drying';
            } else if (order.status === 'Drying' && nextDuration <= third) {
              nextStatus = 'Folding';
            }

            return {
              ...order,
              duration: nextDuration,
              status: nextStatus,
            };
          }
          return order;
        });
        return changed ? updated : prevOrders;
      });
    }, delay);

    return () => clearInterval(timer);
  }, [timerSpeed]);

  // Update a single order's attributes
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, ...updates };
          // If status gets marked as Ready, also ensure minutes are zero
          if (updates.status === 'Ready') {
            updated.duration = 0;
          }
          return updated;
        }
        return o;
      })
    );
  };

  // Add a brand new order from the staff form with customizable creation date
  const handleCreateNewOrder = (newOrderData: Omit<Order, 'id' | 'status' | 'duration' | 'totalDuration' | 'createdAt' | 'estimatedTime' | 'alertsOn' | 'deliveryScheduled' | 'deliveryTime'> & { createdAt?: string, duration?: number }) => {
    const nextId = `LH-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDate = newOrderData.createdAt ? new Date(newOrderData.createdAt) : new Date();
    
    // Simple ETC text generator (e.g., 04:45 PM Today)
    const etcHour = (orderDate.getHours() + 1) % 12 || 12;
    const ampm = (orderDate.getHours() + 1) >= 12 ? 'PM' : 'AM';
    const estimatedTimeText = `${etcHour < 10 ? '0' + etcHour : etcHour}:${orderDate.getMinutes() < 10 ? '0' + orderDate.getMinutes() : orderDate.getMinutes()} ${ampm} Today`;

    const initialDuration = newOrderData.duration !== undefined ? newOrderData.duration : 45;

    const created: Order = {
      ...newOrderData,
      id: nextId,
      status: 'Sorting',
      duration: initialDuration, // Use dynamic custom duration
      totalDuration: initialDuration,
      createdAt: orderDate.toISOString(),
      estimatedTime: estimatedTimeText,
      alertsOn: newOrderData.notifySms || newOrderData.notifyInApp,
      deliveryScheduled: false,
      deliveryTime: 'In-store Pickup'
    };

    setOrders((prev) => [created, ...prev]);
    setView('dashboard');
  };

  // Trigger pickup notification dispatch flow
  const handleSendNotification = (order: Order) => {
    const messageBody = `Your laundry is fresh, clean, and ready for pickup at Lavaholic Laundry Hub! [#ORD-${order.id}]`;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: NotificationLog = {
      id: `N-${Math.floor(100 + Math.random() * 900)}`,
      orderId: order.id,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      channel: order.notifySms ? 'SMS Alert' : 'In-App',
      status: 'Delivered',
      message: messageBody,
      timestamp: timeString
    };

    setNotificationLogs((prev) => [newLog, ...prev]);
    
    // Set success screen context
    setJustNotified({
      orderId: order.id,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      message: messageBody
    });

    // Automatically transition status to Ready and 0 min left when alert is sent
    handleUpdateOrder(order.id, { status: 'Ready', duration: 0 });
    setView('notification_sent');
  };

  // Switch role utilities
  const handleSwitchToStaff = () => {
    // Take them to the welcome screen, which handles secure admin login
    setRole('welcome');
  };

  const handleSwitchToCustomer = () => {
    setRole('customer');
  };

  // Render correct screen depending on current state/role
  if (role === 'welcome') {
    return (
      <WelcomeView
        onSelectRole={(selectedRole, name) => {
          if (selectedRole === 'customer') {
            setCustomerName(name);
            setRole('customer');
          }
        }}
        onAdminLogin={() => {
          setRole('staff');
          setView('dashboard');
        }}
      />
    );
  }

  if (role === 'customer') {
    return (
      <CustomerView 
        orders={orders} 
        onUpdateOrder={handleUpdateOrder}
        onSwitchToStaffView={handleSwitchToStaff} 
        priceConfig={priceConfig}
        customerName={customerName}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendChatMessage}
      />
    );
  }

  // Staff Portal screens
  if (role === 'staff') {
    if (view === 'new_order') {
      return (
        <NewOrderView 
          onBack={() => setView('dashboard')} 
          onCreateOrder={handleCreateNewOrder} 
          priceConfig={priceConfig}
        />
      );
    }

    if (view === 'notification_sent' && justNotified) {
      return (
        <NotificationSentView 
          orderId={justNotified.orderId}
          customerName={justNotified.customerName}
          phoneNumber={justNotified.phoneNumber}
          message={justNotified.message}
          onBack={() => {
            setJustNotified(null);
            setView('dashboard');
          }}
          onViewLogs={() => {
            setJustNotified(null);
            setStaffTab('logs');
            setView('dashboard');
          }}
        />
      );
    }

    return (
      <StaffDashboard 
        orders={orders}
        notificationLogs={notificationLogs}
        onUpdateOrder={handleUpdateOrder}
        onAddNewOrderClick={() => setView('new_order')}
        onSendNotification={handleSendNotification}
        onSwitchToCustomerView={handleSwitchToCustomer}
        onSignOut={() => setRole('welcome')}
        activeTab={staffTab}
        onChangeTab={setStaffTab}
        priceConfig={priceConfig}
        onUpdatePriceConfig={setPriceConfig}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendChatMessage}
      />
    );
  }

  return null;
}
