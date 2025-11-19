/**
 * Available product option (SKU)
 */
export interface Product {
  id: string; // e.g., "product_100k"
  name: string; // e.g., "Tenant Liability Waiver - 100k"
  description: string; // e.g., "Base coverage with 100k liability"
}

/**
 * Selected product with admin-entered price
 */
export interface SelectedProduct {
  id: string; // e.g., "product_100k"
  name: string; // e.g., "Tenant Liability Waiver - 100k"
  description: string;
  price: string; // e.g., "$15/month" or "$15"
}

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

