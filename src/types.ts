// Zentrale Typdefinitionen (rekonstruiert, gleiches Prinzip wie der übrige Code).

export type ApprovalStatus =
  | 'Entwurf'
  | 'Freigabe_angefordert'
  | 'Freigegeben_Staging'
  | 'Live_Gesperrt';

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface CatalogProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  sku: string;
  ean: string;
  price: number;
  costOfGoods: number;
  compareAtPrice: number;
  rating: number;
  reviewCount: number;
  inventory: number;
  subtitle?: string;
  seoTitle: string;
  seoDescription: string;
  approvalStatus: ApprovalStatus;
  variants: ProductVariant[];
  // Werbe-Kennzahlen (für den Ad-Autopilot)
  impressionsToday: number;
  clicksToday: number;
  conversions: number;
  spendToday: number;
}

export interface EuLegalCompliance {
  ceMark: boolean;
  notes: string;
}

export interface ProductCandidate {
  id: string;
  rank: number;
  name: string;
  category: string;
  highlightUSP: string;
  searchVolumeDE: string;
  sellingPriceVK: number;
  purchasePriceEK: number;
  shippingCostDE: number;
  db2Amount: number;
  db2Percent: number;
  deliveryDaysDE: string;
  shortVideoViralScore: number;
  estimatedReturnRate: number;
  sampleStatus: string;
  supplierDE: string;
  returnRiskScore: string;
  euLegalCompliance: EuLegalCompliance;
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  phase: number;
  phaseName: string;
  action: string;
  detail: string;
  status: string;
  safetyCheckPassed?: boolean;
}

export interface CompetitorPalette {
  primary: string;
  accent: string;
  secondary: string;
}

export interface CompetitorTrafficSources {
  googleOrganic: number;
  socialAds: number;
  influencers: number;
  email: number;
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  category: string;
  monthlyTrafficEst: string;
  heroHeadline: string;
  avgOrderValue: string;
  pricingStrategy: string;
  palette: CompetitorPalette;
  salesArguments: string[];
  pdpStrengths: string[];
  trustSignals: string[];
  keyTakeaways: string[];
  trafficSources: CompetitorTrafficSources;
}

export interface AcquisitionChannel {
  channel: string;
  revenue: number;
  share: number;
}

export interface ControllingData {
  grossRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  monthlyVisitors: number;
  contributionMargin2: number;
  blendedROAS: number;
  breakEvenROAS: number;
  topAcquisitionChannels: AcquisitionChannel[];
}

export interface InstalledApp {
  name: string;
  purpose: string;
  cost: string;
}

export interface ShopAudit {
  productsAudit: {
    avgProfitMarginDB2: string;
  };
  existingDesign: {
    themeName: string;
    typography: string;
    pagespeedMobile: number;
  };
  installedApps: InstalledApp[];
}

export interface MarketingCampaign {
  id: string;
  channel: string;
  title: string;
  hookOrSubject: string;
  creativeDetails: string;
  callToAction: string;
  hashtagsOrKeywords: string[];
  targetAudience: string;
  estimatedMetrics: string;
}

// Commerce (Daten kommen vom Server, hier nur die Typen)
export interface OrderItem {
  quantity: number;
  productTitle: string;
  price?: number;
}

export interface ShippingAddress {
  street?: string;
  city: string;
  zip?: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  status?: string;
  fulfillmentStatus?: string;
  salesChannel?: string;
  trackingNumber?: string;
}

export interface SalesChannelStatus {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  activeOrdersToday: number;
  todayRevenue: number;
  syncedProductsCount: number;
}
