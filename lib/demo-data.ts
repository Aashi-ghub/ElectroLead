// Demo Data for VoltSupply B2B Platform Testing

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  type: 'buyer' | 'seller';
  companyName: string;
  userType: string;
  location: string;
  kycStatus: 'Approved' | 'Pending' | 'Rejected';
  subscription?: {
    plan: string;
    duration: string;
    scope: string;
  };
}

export interface DemoEnquiry {
  id: string;
  title: string;
  buyerId: string;
  buyerType: string;
  scope: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  description: string;
  bidClosingDate: string;
  status: 'Open' | 'Closed' | 'Draft';
  createdAt: string;
}

export interface DemoQuotation {
  id: string;
  enquiryId: string;
  sellerId: string;
  amount: number;
  currency: string;
  deliveryTime: string;
  terms: string;
  status: 'Submitted' | 'Viewed' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: string[];
  images: string[];
}

// Demo Users
export const demoUsers: DemoUser[] = [
  // Buyers
  {
    id: 'buyer_1',
    email: 'raj_contractors@test.com',
    password: 'Demo123#',
    type: 'buyer',
    companyName: 'Raj Contractors',
    userType: 'Electrical Contractor',
    location: 'Pune, Maharashtra',
    kycStatus: 'Approved'
  },
  {
    id: 'buyer_2',
    email: 'metro_projects@test.com',
    password: 'Demo123#',
    type: 'buyer',
    companyName: 'Metro Projects Ltd',
    userType: 'Infrastructure Project',
    location: 'Hyderabad, Telangana',
    kycStatus: 'Approved'
  },
  {
    id: 'buyer_3',
    email: 'abc_industries@test.com',
    password: 'Demo123#',
    type: 'buyer',
    companyName: 'ABC Industries',
    userType: 'Industrial Plant',
    location: 'Faridabad, Haryana',
    kycStatus: 'Pending'
  },
  // Sellers
  {
    id: 'seller_1',
    email: 'elektra_components@test.com',
    password: 'Demo123#',
    type: 'seller',
    companyName: 'Elektra Components',
    userType: 'Manufacturer',
    location: 'Mumbai, Maharashtra',
    kycStatus: 'Approved',
    subscription: {
      plan: 'All-India',
      duration: 'Yearly',
      scope: 'Pan India'
    }
  },
  {
    id: 'seller_2',
    email: 'power_distributors@test.com',
    password: 'Demo123#',
    type: 'seller',
    companyName: 'Power Distributors',
    userType: 'Distributor',
    location: 'Chennai, Tamil Nadu',
    kycStatus: 'Approved',
    subscription: {
      plan: 'South India',
      duration: 'Quarterly',
      scope: 'South India'
    }
  },
  {
    id: 'seller_3',
    email: 'local_electro_mart@test.com',
    password: 'Demo123#',
    type: 'seller',
    companyName: 'Local Electro Mart',
    userType: 'Retailer',
    location: 'Lucknow, Uttar Pradesh',
    kycStatus: 'Approved',
    subscription: {
      plan: 'Local City',
      duration: 'Monthly',
      scope: 'Lucknow City'
    }
  }
];

// Demo Enquiries
export const demoEnquiries: DemoEnquiry[] = [
  {
    id: 'enquiry_1',
    title: 'PVC Cables for Residential Project',
    buyerId: 'buyer_1',
    buyerType: 'Contractor',
    scope: 'Pune City',
    items: [
      { name: 'PVC Copper Cable 1.5 sq.mm', quantity: 1000, unit: 'Meters' },
      { name: 'PVC Copper Cable 2.5 sq.mm', quantity: 750, unit: 'Meters' }
    ],
    description: 'Required for a new housing society in Kharadi. IS Standard required.',
    bidClosingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'enquiry_2',
    title: 'LED Street Lights for Infrastructure Project',
    buyerId: 'buyer_2',
    buyerType: 'Infrastructure Project',
    scope: 'All India',
    items: [
      { name: 'LED Street Light 60W, IP66', quantity: 200, unit: 'Units' },
      { name: 'Galvanized Steel Pole 6-meter', quantity: 200, unit: 'Units' }
    ],
    description: 'Tender for Hyderabad Metro Phase 2. Detailed technical specs sheet attached.',
    bidClosingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Open',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'enquiry_3',
    title: 'Urgent Requirement for MCBs',
    buyerId: 'buyer_3',
    buyerType: 'Industrial Plant',
    scope: 'Haryana State',
    items: [
      { name: 'MCB 16A, Single Pole', quantity: 50, unit: 'Units' },
      { name: 'MCB 32A, Triple Pole', quantity: 20, unit: 'Units' }
    ],
    description: 'Breakdown maintenance requirement. Need delivery within 48 hours.',
    bidClosingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo Quotations
export const demoQuotations: DemoQuotation[] = [
  {
    id: 'quote_1',
    enquiryId: 'enquiry_1',
    sellerId: 'seller_1',
    amount: 85000,
    currency: 'INR',
    deliveryTime: '7 days',
    terms: 'FOB Mumbai, 30 days credit',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'quote_2',
    enquiryId: 'enquiry_1',
    sellerId: 'seller_3',
    amount: 92500,
    currency: 'INR',
    deliveryTime: '5 days',
    terms: 'FOB Lucknow, 15 days credit',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'quote_3',
    enquiryId: 'enquiry_2',
    sellerId: 'seller_1',
    amount: 575000,
    currency: 'INR',
    deliveryTime: '14 days',
    terms: 'FOB Mumbai, 45 days credit',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'quote_4',
    enquiryId: 'enquiry_2',
    sellerId: 'seller_2',
    amount: 620000,
    currency: 'INR',
    deliveryTime: '12 days',
    terms: 'FOB Chennai, 30 days credit',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo Product Categories
export const demoProductCategories = [
  {
    name: 'Cables & Wires',
    items: ['PVC Copper Cable', 'XLPE Armoured Cable', 'FR PVC Wire']
  },
  {
    name: 'Switchgear & Protection',
    items: ['MCB (16A, 32A)', 'MCCB', 'Distribution Board', 'Changeover Switch']
  },
  {
    name: 'Lighting',
    items: ['LED Street Lights', 'LED Panels', 'Industrial Flood Lights']
  },
  {
    name: 'Energy Meters',
    items: ['Single Phase Meter', 'Three Phase Digital Meter']
  }
];

// Helper functions
export const getDemoUserByEmail = (email: string): DemoUser | undefined => {
  return demoUsers.find(user => user.email === email);
};

export const getDemoEnquiriesByBuyer = (buyerId: string): DemoEnquiry[] => {
  return demoEnquiries.filter(enquiry => enquiry.buyerId === buyerId);
};

export const getDemoQuotationsByEnquiry = (enquiryId: string): DemoQuotation[] => {
  return demoQuotations.filter(quote => quote.enquiryId === enquiryId);
};

export const getDemoQuotationsBySeller = (sellerId: string): DemoQuotation[] => {
  return demoQuotations.filter(quote => quote.sellerId === sellerId);
};

export const getDemoEnquiriesForSeller = (sellerId: string): DemoEnquiry[] => {
  // In a real app, this would filter based on seller's subscription scope and product categories
  return demoEnquiries.filter(enquiry => enquiry.status === 'Open');
};
