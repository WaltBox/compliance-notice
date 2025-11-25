/**
 * Available product option (SKU)
 */
export interface Product {
  id: string; // e.g., "product_100k"
  name: string; // e.g., "Tenant Liability Waiver - 100k"
  description: string; // e.g., "Base coverage with 100k liability"
}

/**
 * Upgrade option for Tenant Liability products
 */
export interface ProductUpgrade {
  id: 'upgrade_5k' | 'upgrade_10k' | 'upgrade_20k';
  name: string; // e.g., "Add 5k content coverage"
  priceAdd: string; // e.g., "+$2"
}

/**
 * Selected product with admin-entered price
 */
export interface SelectedProduct {
  id: string; // e.g., "product_100k"
  name: string; // e.g., "Tenant Liability Waiver - 100k"
  description: string;
  price: string; // e.g., "$15/month" or "$15"
  upgradesEnabled?: boolean; // only for product_100k - enables optional upgrades
}

/**
 * Available upgrades for Tenant Liability Waiver - 100k
 */
export const AVAILABLE_UPGRADES: ProductUpgrade[] = [
  {
    id: 'upgrade_5k',
    name: 'Add $5,000 in personal content coverage',
    priceAdd: '+$2',
  },
  {
    id: 'upgrade_10k',
    name: 'Add $10,000 in personal content coverage',
    priceAdd: '+$4',
  },
  {
    id: 'upgrade_20k',
    name: 'Add $20,000 in personal content coverage',
    priceAdd: '+$8',
  },
];

/**
 * Fixed available products
 */
export const AVAILABLE_PRODUCTS: Product[] = [
  {
    id: 'product_100k',
    name: 'Tenant Liability Waiver - 100k',
    description: 'Base coverage with 100k in liability',
  },
  {
    id: 'product_100k_5k_content',
    name: 'Tenant Liability Waiver - 100k + 5k content',
    description: '100k liability + $5,000 in personal property coverage',
  },
  {
    id: 'product_100k_10k_content',
    name: 'Tenant Liability Waiver - 100k + 10k content',
    description: '100k liability + $10,000 in personal property coverage',
  },
  {
    id: 'product_100k_20k_content',
    name: 'Tenant Liability Waiver - 100k + 20k content',
    description: '100k liability + $20,000 in personal property coverage',
  },
  {
    id: 'renters_kit_base',
    name: 'Renters Kit - Base',
    description: 'Move-in Concierge, ID Theft Protection, Positive Credit Reporting, AI Tools',
  },
  {
    id: 'renters_kit_base_air_filter',
    name: 'Renters Kit - Base + Air Filter Delivery',
    description: 'Move-in Concierge, ID Theft Protection, Positive Credit Reporting, AI Tools, Monthly Air Filter Delivery',
  },
  {
    id: 'renters_kit_base_pest',
    name: 'Renters Kit - Base + Pest Control',
    description: 'Move-in Concierge, ID Theft Protection, Positive Credit Reporting, AI Tools, Pest Control Service',
  },
  {
    id: 'renters_kit_base_air_filter_pest',
    name: 'Renters Kit - Base + Air Filter + Pest Control',
    description: 'Move-in Concierge, ID Theft Protection, Positive Credit Reporting, AI Tools, Monthly Air Filter Delivery, Pest Control Service',
  },
];

/**
 * BeagleProgramData - the shape of data returned from API for public and admin
 */
export interface BeagleProgramData {
  id: string;
  createdAt: string;
  updatedAt: string;
  propertyManagerName: string;
  propertyManagerSlug: string;
  insuranceVerificationUrl: string;
  webviewUrl?: string; // optional embedded webview URL
  selectedProducts: SelectedProduct[]; // array of selected products with prices
  isPublished: boolean;
  responseCount?: number; // number of responses (only included in admin list view)
  noticeTitle?: string; // customizable notice title (optional - defaults to hardcoded)
  noticeIntroText?: string; // customizable intro text (optional - defaults to hardcoded)
  noticeInsuranceText?: string; // customizable insurance section text (optional - defaults to hardcoded)
  insuranceNotRequired?: boolean; // if true, hides the insurance section
}

/**
 * Form configuration for opt-out functionality
 */
export interface FormConfig {
  tenantLiabilityWaiverCanOptOut?: boolean;
  rentersKitCanOptOut?: boolean;
}

/**
 * Request body for creating a new BeagleProgram
 */
export interface CreateBeagleProgramRequest {
  propertyManagerName: string;
  propertyManagerSlug?: string; // optional, auto-generated if not provided
  insuranceVerificationUrl: string;
  webviewUrl?: string; // optional embedded webview URL
  selectedProducts?: SelectedProduct[]; // array of selected products with prices
  form?: FormConfig; // optional form configuration
  noticeTitle?: string; // optional customizable notice title
  noticeIntroText?: string; // optional customizable intro text
  noticeInsuranceText?: string; // optional customizable insurance section text
  insuranceNotRequired?: boolean; // if true, hides the insurance section
}

/**
 * Request body for updating a BeagleProgram
 */
export interface UpdateBeagleProgramRequest {
  propertyManagerName?: string;
  propertyManagerSlug?: string;
  insuranceVerificationUrl?: string;
  webviewUrl?: string; // optional embedded webview URL
  selectedProducts?: SelectedProduct[]; // array of selected products with prices
  form?: FormConfig; // optional form configuration
  noticeTitle?: string; // optional customizable notice title
  noticeIntroText?: string; // optional customizable intro text
  noticeInsuranceText?: string; // optional customizable insurance section text
  insuranceNotRequired?: boolean; // if true, hides the insurance section
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * BeagleProgramPage component modes
 */
export type BeagleProgramPageMode = 'notice' | 'form';

