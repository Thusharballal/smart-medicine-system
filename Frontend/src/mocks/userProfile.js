/**
 * Mock data for User Profile, Settings, and Activity modules.
 * Replace with real API calls in the backend integration phase.
 */

export const MOCK_PROFILE = {
  id: 'u1',
  displayName: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  mobile: '9876543210',
  dateJoined: '2024-01-15T08:00:00.000Z',
  role: 'user',
  preferredLanguage: 'en',
  address: {
    line1: '42, Lotus Apartments',
    line2: 'Sector 18',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
  },
  emergencyContact: {
    name: 'Rahul Sharma',
    relation: 'Spouse',
    mobile: '9765432100',
  },
  avatarUrl: null,
}

export const MOCK_SETTINGS = {
  appearance: 'light',          // 'light' | 'dark' | 'system'
  language: 'en',               // 'en' | 'hi'
  defaultSearchRadius: 5,       // km
  defaultMedicineType: 'all',   // 'all' | 'branded' | 'janaushadhi'
  preferredPharmacy: '',
  twoFactorEnabled: false,
}

export const MOCK_NOTIFICATION_PREFS = {
  emailNotifications: true,
  pushNotifications: true,
  priceAlerts: true,
  stockAlerts: true,
  medicineRecommendations: true,
  systemAnnouncements: true,
}

export const MOCK_ACTIVE_SESSIONS = [
  {
    id: 's1',
    device: 'Chrome on Windows',
    location: 'Noida, India',
    ip: '103.21.xx.xx',
    lastActive: new Date(Date.now() - 60000).toISOString(),
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'Firefox on Android',
    location: 'Delhi, India',
    ip: '49.36.xx.xx',
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
    isCurrent: false,
  },
]

export const MOCK_ACTIVITY = [
  {
    id: 'a1',
    type: 'search',
    title: 'Searched for Metformin',
    description: 'Found 3 Jan Aushadhi alternatives',
    icon: 'search',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'a2',
    type: 'saved',
    title: 'Saved Atorvastatin 10mg',
    description: 'Added to watchlist — saves ₹168/strip',
    icon: 'heart',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a3',
    type: 'pharmacy',
    title: 'Visited Jan Aushadhi Store, Sector 18',
    description: 'Viewed pharmacy details and directions',
    icon: 'map',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'a4',
    type: 'search',
    title: 'Searched for Amoxicillin',
    description: 'Found generic alternative saving ₹75',
    icon: 'search',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'a5',
    type: 'profile',
    title: 'Updated profile information',
    description: 'Changed mobile number and address',
    icon: 'user',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'a6',
    type: 'saved',
    title: 'Saved Omeprazole 20mg',
    description: 'Added to watchlist — saves ₹89/pack',
    icon: 'heart',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'a7',
    type: 'search',
    title: 'Searched for Cetirizine',
    description: 'Found Jan Aushadhi at ₹4 vs ₹48 branded',
    icon: 'search',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'a8',
    type: 'pharmacy',
    title: 'Viewed PMBJP Store, Connaught Place',
    description: 'Checked operating hours and stock',
    icon: 'map',
    timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
]

export const EXTENDED_NOTIFICATIONS = [
  {
    id: 'en1',
    type: 'Price_Drop',
    title: 'Metformin price dropped by 20%',
    message: 'Metformin 500mg (Jan Aushadhi) is now ₹4 per strip — down from ₹5.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isRead: false,
    category: 'Price_Drop',
  },
  {
    id: 'en2',
    type: 'Stock_Available',
    title: 'Atorvastatin back in stock near you',
    message: 'Atorvastatin 10mg is available at 3 nearby Jan Aushadhi stores.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
    category: 'Stock_Available',
  },
  {
    id: 'en3',
    type: 'System_Announcement',
    title: '45 new pharmacies added in Delhi NCR',
    message: 'We have partnered with 45 new Jan Aushadhi stores in your area.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    category: 'System_Announcement',
  },
  {
    id: 'en4',
    type: 'Price_Drop',
    title: 'Omeprazole price alert',
    message: 'Omeprazole 20mg (Jan Aushadhi) dropped to ₹7 from ₹9.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isRead: false,
    category: 'Price_Drop',
  },
  {
    id: 'en5',
    type: 'Stock_Available',
    title: 'Amoxicillin now in stock',
    message: 'Your saved Amoxicillin 500mg is available at Sector 18 store.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isRead: true,
    category: 'Stock_Available',
  },
  {
    id: 'en6',
    type: 'System_Announcement',
    title: 'App update: Prescription OCR coming soon',
    message: 'Upload your prescription to auto-search medicines. Feature launching next week.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isRead: true,
    category: 'System_Announcement',
  },
]
