/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus = 'Sorting' | 'Washing' | 'Drying' | 'Folding' | 'Ready' | 'Cancelled';

export type ServiceType = 'Wash Only' | 'Dry Only' | 'Deluxe';

export type LoadSize = 'Light' | 'Medium' | 'Heavy';

export interface Order {
  id: string; // e.g., "LAV8829"
  customerName: string;
  phoneNumber: string;
  weight: number; // in kg
  serviceType: ServiceType;
  specialInstructions: string;
  notifySms: boolean;
  notifyInApp: boolean;
  status: OrderStatus;
  duration: number; // in minutes left
  totalDuration: number; // in minutes total
  createdAt: string; // ISO string
  estimatedTime: string; // e.g., "04:45 PM Today"
  alertsOn: boolean;
  deliveryScheduled: boolean;
  deliveryTime: string; // e.g., "Scheduled 6PM"
  // Financial & Load Details
  loadSize: LoadSize;
  addOns: string[];
  totalAmount: number;
  isPaid: boolean;
  isPickedUp: boolean;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  customerName: string;
  phoneNumber: string;
  channel: 'SMS Alert' | 'In-App';
  status: 'Delivered' | 'Pending' | 'Failed';
  message: string;
  timestamp: string; // e.g., "02:15 PM"
}

// Addon definitions and default prices in Philippine Peso (₱)
export const DEFAULT_PRICE_CONFIG = {
  washOnly: { Light: 50.00, Medium: 70.00, Heavy: 90.00 },
  dryOnly: { Light: 50.00, Medium: 70.00, Heavy: 90.00 },
  deluxe: { Light: 120.00, Medium: 160.00, Heavy: 200.00 },
  services: {
    'Wash Only': { light: 50.00, medium: 70.00, heavy: 90.00 },
    'Dry Only': { light: 50.00, medium: 70.00, heavy: 90.00 },
    'Deluxe': { light: 120.00, medium: 160.00, heavy: 200.00 }
  },
  addOns: {
    'Fold': 30.00,
    'Premium Detergent': 20.00,
    'Fabric Softener': 15.00,
    'Scent Booster': 25.00,
    'Eco-Friendly Soap': 20.00,
    'Color Catcher': 15.00,
  }
};

export const ADDON_PRICES: Record<string, number> = DEFAULT_PRICE_CONFIG.addOns;

// Base pricing function supporting dynamic/custom configurations
export function calculateOrderPrice(
  service: ServiceType, 
  weight: number, 
  addOns: string[], 
  customConfig?: any
): { basePrice: number, totalAmount: number, loadSize: LoadSize } {
  let loadSize: LoadSize = 'Light';
  // Maximum weight is 8kg; we categorize: Light <= 3kg, Medium <= 6kg, Heavy > 6kg (up to 8kg)
  if (weight > 6.0) {
    loadSize = 'Heavy';
  } else if (weight > 3.0) {
    loadSize = 'Medium';
  }

  const config = customConfig || DEFAULT_PRICE_CONFIG;

  // Define base prices by Service & Load size
  let basePrice = 0;
  // Ensure we fallback properly if config structure varies
  const sName = service || 'Wash Only';
  if (config.services && config.services[sName]) {
    const sizeKey = loadSize.toLowerCase() as 'light' | 'medium' | 'heavy';
    basePrice = config.services[sName][sizeKey];
  } else {
    if (sName === 'Wash Only') {
      basePrice = (config.washOnly || DEFAULT_PRICE_CONFIG.washOnly)[loadSize];
    } else if (sName === 'Dry Only') {
      basePrice = (config.dryOnly || DEFAULT_PRICE_CONFIG.dryOnly)[loadSize];
    } else { // Deluxe
      basePrice = (config.deluxe || DEFAULT_PRICE_CONFIG.deluxe)[loadSize];
    }
  }

  // Calculate addons
  const addonCost = addOns.reduce((sum, addon) => {
    const addOnMap = config.addOns || DEFAULT_PRICE_CONFIG.addOns;
    return sum + (addOnMap[addon as keyof typeof addOnMap] || 0);
  }, 0);

  return {
    basePrice,
    totalAmount: basePrice + addonCost,
    loadSize,
  };
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'LAV8829',
    customerName: 'John Doe',
    phoneNumber: '+1 (555) 012-3456',
    weight: 3.5,
    serviceType: 'Wash Only',
    specialInstructions: 'No fabric softener for the white load, hang dry the silk blouse.',
    notifySms: true,
    notifyInApp: true,
    status: 'Drying',
    duration: 12,
    totalDuration: 45,
    createdAt: new Date(Date.now() - 33 * 60000).toISOString(), // 33 minutes ago
    estimatedTime: '04:45 PM Today',
    alertsOn: true,
    deliveryScheduled: true,
    deliveryTime: 'Scheduled 6PM',
    loadSize: 'Medium',
    addOns: ['Premium Detergent', 'Fabric Softener', 'Fold'],
    totalAmount: 135.00, // Base 70.00 + 20.00 + 15.00 + 30.00
    isPaid: true,
    isPickedUp: false,
  },
  {
    id: 'LH-9801',
    customerName: 'Sarah Jenkins',
    phoneNumber: '+1 (555) 789-0123',
    weight: 4.5,
    serviceType: 'Deluxe',
    specialInstructions: 'Please use scent-free detergent.',
    notifySms: true,
    notifyInApp: true,
    status: 'Washing',
    duration: 45,
    totalDuration: 60,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    estimatedTime: '05:30 PM Today',
    alertsOn: true,
    deliveryScheduled: false,
    deliveryTime: 'In-store Pickup',
    loadSize: 'Medium',
    addOns: ['Fold'],
    totalAmount: 190.00, // Base 160.00 + 30.00
    isPaid: false,
    isPickedUp: false,
  },
  {
    id: 'LH-9805',
    customerName: 'Mark Thompson',
    phoneNumber: '+1 (555) 111-2222',
    weight: 2.0,
    serviceType: 'Wash Only',
    specialInstructions: 'Cold wash only.',
    notifySms: false,
    notifyInApp: true,
    status: 'Folding',
    duration: 20,
    totalDuration: 30,
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    estimatedTime: '04:15 PM Today',
    alertsOn: false,
    deliveryScheduled: true,
    deliveryTime: 'Scheduled 5PM',
    loadSize: 'Light',
    addOns: [],
    totalAmount: 50.00, // Base 50.00
    isPaid: true,
    isPickedUp: true,
  },
  {
    id: 'LH-9809',
    customerName: 'Aria Chen',
    phoneNumber: '+1 (555) 333-4444',
    weight: 6.2,
    serviceType: 'Dry Only',
    specialInstructions: 'Tumble dry low heat.',
    notifySms: true,
    notifyInApp: false,
    status: 'Drying',
    duration: 60,
    totalDuration: 60,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedTime: '06:00 PM Today',
    alertsOn: true,
    deliveryScheduled: false,
    deliveryTime: 'In-store Pickup',
    loadSize: 'Heavy',
    addOns: ['Scent Booster'],
    totalAmount: 115.00, // Base 90.00 + 25.00
    isPaid: false,
    isPickedUp: false,
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'N-1',
    orderId: 'LAV8829',
    customerName: 'John Doe',
    phoneNumber: '+1 (555) 012-3456',
    channel: 'SMS Alert',
    status: 'Delivered',
    message: 'Your laundry is fresh, clean, and ready for pickup at Lavaholic Laundry Hub! [#ORD-8829]',
    timestamp: '02:15 PM',
  }
];

export interface ChatMessage {
  id: string;
  threadId: string; // e.g. Customer Name or Order ID
  sender: 'customer' | 'staff';
  senderName: string;
  text: string;
  timestamp: string; // ISO string
}

