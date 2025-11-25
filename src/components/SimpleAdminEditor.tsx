'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { BeagleProgramData, SelectedProduct } from '@/types';
import { generateSlug } from '@/lib/utils';
import { AVAILABLE_PRODUCTS, AVAILABLE_UPGRADES } from '@/types';
import BeagleProgramPagePreview from './BeagleProgramPagePreview';

// Thin scrollbar styles
const scrollbarStyles = `
  .thin-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .thin-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb {
    background: #FF9500;
    border-radius: 3px;
  }
  .thin-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #E68A00;
  }
  .thin-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #FF9500 transparent;
  }
`;

interface SimpleAdminEditorProps {
  program?: BeagleProgramData;
  isNew?: boolean;
}

/**
 * Simplified admin editor for fixed Tenant Liability Waiver program
 */
export default function SimpleAdminEditor({ program, isNew = false }: SimpleAdminEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    propertyManagerName: program?.propertyManagerName || '',
    propertyManagerSlug: program?.propertyManagerSlug || '',
    insuranceVerificationUrl: program?.insuranceVerificationUrl || '',
    webviewUrl: program?.webviewUrl || '',
    selectedProducts: program?.selectedProducts || ([] as SelectedProduct[]),
    isPublished: program?.isPublished || false,
    noticeTitle: program?.noticeTitle || '',
    noticeIntroText: program?.noticeIntroText || '',
    noticeInsuranceText: program?.noticeInsuranceText || '',
    insuranceNotRequired: program?.insuranceNotRequired || false,
  });

  // Form opt-out configuration
  const [formConfig, setFormConfig] = useState({
    id: 'preview-form',
    tenantLiabilityWaiverCanOptOut: false,
    rentersKitCanOptOut: false,
  });

  // Load form config from program data when editing
  useEffect(() => {
    if (program?.id && !isNew) {
      const fetchFormConfig = async () => {
        try {
          const response = await fetch(`/api/admin/beagle-programs/${program.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.data?.form) {
              setFormConfig({
                id: data.data.form.id,
                tenantLiabilityWaiverCanOptOut: data.data.form.tenantLiabilityWaiverCanOptOut || false,
                rentersKitCanOptOut: data.data.form.rentersKitCanOptOut || false,
              });
            }
          }
        } catch (err) {
          console.error('Failed to load form config:', err);
        }
      };
      fetchFormConfig();
    }
  }, [program?.id, isNew]);

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    setError(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.propertyManagerName.trim()) {
      errors.propertyManagerName = 'Property manager name is required';
    }
    if (!formData.propertyManagerSlug.trim()) {
      errors.propertyManagerSlug = 'Slug is required';
    }
    if (!formData.insuranceVerificationUrl.trim()) {
      errors.insuranceVerificationUrl = 'Insurance verification URL is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) {
      setError('Please fix validation errors');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = isNew
        ? '/api/admin/beagle-programs'
        : `/api/admin/beagle-programs/${program?.id}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, form: formConfig }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save program');
      }

      const result = await response.json();

      if (!isNew) {
        setFormData((prev) => ({
          ...prev,
          ...result.data,
        }));
      }

      // If publish is requested
      if (publish && (isNew || !program?.isPublished)) {
        const publishUrl = `/api/admin/beagle-programs/${isNew ? result.data.id : program?.id}/publish`;
        const publishResponse = await fetch(publishUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!publishResponse.ok) {
          const errorData = await publishResponse.json();
          throw new Error(errorData.error || 'Failed to publish program');
        }

        const publishResult = await publishResponse.json();
        setFormData((prev) => ({
          ...prev,
          isPublished: publishResult.data.isPublished,
        }));
      }

      // Redirect to edit page if new
      if (isNew) {
        router.push(`/admin/beagle-programs/${result.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save program');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!program?.id) return;

    setIsSaving(true);
    setError(null);

    try {
      // First, save the form data
      const saveUrl = `/api/admin/beagle-programs/${program.id}`;
      const saveResponse = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, form: formConfig }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save program');
      }

      const savedResult = await saveResponse.json();

      // Then, toggle publish status
      const publishUrl = `/api/admin/beagle-programs/${program.id}/publish`;
      const publishResponse = await fetch(publishUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error || 'Failed to toggle publish status');
      }

      const publishResult = await publishResponse.json();
      setFormData((prev) => ({
        ...prev,
        isPublished: publishResult.data.isPublished,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedProducts.some((p) => p.id === productId);
      
      if (isSelected) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter((p) => p.id !== productId),
        };
      } else {
        // Add new product with empty price
        const product = AVAILABLE_PRODUCTS.find((p) => p.id === productId);
        if (!product) return prev;
        
        return {
          ...prev,
          selectedProducts: [
            ...prev.selectedProducts,
            {
              id: product.id,
              name: product.name,
              description: product.description,
              price: '', // Admin will enter price
            } as SelectedProduct,
          ],
        };
      }
    });
  };

  const updateProductPrice = (productId: string, price: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product) =>
        product.id === productId ? { ...product, price } : product
      ),
    }));
  };

  const updateFormConfig = (field: string, value: boolean) => {
    setFormConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleProductUpgrades = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product) =>
        product.id === productId
          ? { ...product, upgradesEnabled: !product.upgradesEnabled }
          : product
      ),
    }));
  };

  // Generate preview data
  const previewData: BeagleProgramData = {
    ...formData,
    id: program?.id || 'preview',
    createdAt: program?.createdAt || new Date().toISOString(),
    updatedAt: program?.updatedAt || new Date().toISOString(),
  } as BeagleProgramData;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8 h-screen">
        {/* Left: Form Editor */}
        <div className="space-y-6 overflow-y-auto pr-4 thin-scrollbar">
        <div>
          <h2 className="text-2xl font-bold text-beagle-dark mb-4">Program Configuration</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}


          {/* Property Manager Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Property Manager Name *
            </label>
            <input
              type="text"
              value={formData.propertyManagerName}
              onChange={(e) => {
                updateFormData('propertyManagerName', e.target.value);
                // Auto-generate slug
                updateFormData('propertyManagerSlug', generateSlug(e.target.value));
              }}
              placeholder="e.g., Santa Fe Property Management"
              className={`w-full px-4 py-2 border rounded-lg font-bricolage ${
                validationErrors.propertyManagerName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.propertyManagerName && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.propertyManagerName}</p>
            )}
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.propertyManagerSlug}
              onChange={(e) => updateFormData('propertyManagerSlug', e.target.value)}
              placeholder="auto-generated"
              disabled={!isNew}
              className={`w-full px-4 py-2 border rounded-lg font-bricolage ${
                !isNew ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${validationErrors.propertyManagerSlug ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.propertyManagerSlug && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.propertyManagerSlug}</p>
            )}
            {formData.propertyManagerSlug && (
              <p className="text-xs text-gray-500 mt-1">
                URL: /programs/{formData.propertyManagerSlug}
              </p>
            )}
          </div>

          {/* Insurance Verification URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Insurance Verification URL *
            </label>
            <input
              type="url"
              value={formData.insuranceVerificationUrl}
              onChange={(e) => updateFormData('insuranceVerificationUrl', e.target.value)}
              placeholder="https://example.com/verify"
              className={`w-full px-4 py-2 border rounded-lg font-bricolage ${
                validationErrors.insuranceVerificationUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.insuranceVerificationUrl && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.insuranceVerificationUrl}</p>
            )}
          </div>

          {/* Optional Webview URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Embedded Webview URL (Optional)
            </label>
            <input
              type="url"
              value={formData.webviewUrl}
              onChange={(e) => updateFormData('webviewUrl', e.target.value)}
              placeholder="https://tools.yourrenterskit.com/renter-benefits/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bricolage"
            />
            <p className="text-xs text-gray-600 mt-2">
              If provided, this webpage will be embedded as an iframe on the public program page.
              Example: tools.yourrenterskit.com
            </p>
          </div>

          {/* Notice Customization Section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-3">
              Notice Text Customization (Optional)
            </label>
            <p className="text-xs text-gray-600 mb-4">
              Customize the text that appears on the public notice page. Leave blank to use defaults.
            </p>

            {/* Notice Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-beagle-dark mb-2">
                Notice Title (Default: "Insurance Verification")
              </label>
              <input
                type="text"
                value={formData.noticeTitle}
                onChange={(e) => updateFormData('noticeTitle', e.target.value)}
                placeholder="e.g., Insurance Verification"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bricolage text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The orange title text at the top of the page
              </p>
            </div>

            {/* Notice Intro Text */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-beagle-dark mb-2">
                Intro Text (Default: "Your lease requires renters insurance...")
              </label>
              <textarea
                value={formData.noticeIntroText}
                onChange={(e) => updateFormData('noticeIntroText', e.target.value)}
                placeholder="Enter the introduction text that appears at the top of the notice..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bricolage text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                The main paragraph explaining the program (appears after the title). Use &lt;br&gt; for line breaks and &lt;bold&gt;text&lt;/bold&gt; for bold text.
              </p>
            </div>

            {/* Insurance Not Required Checkbox */}
            <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.insuranceNotRequired}
                  onChange={(e) => updateFormData('insuranceNotRequired', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-beagle-dark text-sm">Insurance Not Required</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Check this if renters insurance is not required. This will hide the "Already have renters insurance?" section from the public page.
                  </p>
                </div>
              </label>
            </div>

            {/* Notice Insurance Text (only show if insurance is required) */}
            {!formData.insuranceNotRequired && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-beagle-dark mb-2">
                  "Already Have Insurance" Section Text
                </label>
                <textarea
                  value={formData.noticeInsuranceText}
                  onChange={(e) => updateFormData('noticeInsuranceText', e.target.value)}
                  placeholder='Enter text for the "Already have renters insurance?" section...'
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-bricolage text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text for tenants who already have their own renters insurance policy. Use &lt;br&gt; for line breaks and &lt;bold&gt;text&lt;/bold&gt; for bold text.
                </p>
              </div>
            )}
          </div>

          {/* Products Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-3">
              Insurance Products to Offer
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Select which products to include in this program and enter the price for each
            </p>
            <div className="space-y-3">
              {AVAILABLE_PRODUCTS.map((product, index) => {
                const isSelected = formData.selectedProducts.some((p) => p.id === product.id);
                const selectedProduct = formData.selectedProducts.find((p) => p.id === product.id);
                const isRentersKit = product.id.startsWith('renters_kit_');
                const prevProduct = index > 0 ? AVAILABLE_PRODUCTS[index - 1] : null;
                const prevIsRentersKit = prevProduct?.id.startsWith('renters_kit_');
                
                // Show separator if transitioning from liability to renters kit
                const showSeparator = !prevIsRentersKit && isRentersKit;
                
                return (
                  <div key={product.id}>
                    {showSeparator && (
                      <div className="my-4 border-t border-gray-300 pt-4">
                        <p className="text-xs font-semibold text-beagle-dark text-center mb-3">Renters Kits</p>
                      </div>
                    )}
                    <div className="border border-gray-200 rounded p-3">
                      <label className="flex items-start gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(product.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-beagle-dark">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                      </label>
                      
                      {isSelected && (
                        <div className="ml-6 border-t border-gray-200 pt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-beagle-dark mb-2">
                              Price for this product *
                            </label>
                            <input
                              type="text"
                              value={selectedProduct?.price || ''}
                              onChange={(e) => updateProductPrice(product.id, e.target.value)}
                              placeholder="e.g., $15/month or $15"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              What does this product cost? (e.g., $15/month or $15)
                            </p>
                          </div>

                          {/* Optional Upgrades Button - Only for 100k Liability */}
                          {product.id === 'product_100k' && (
                            <div>
                              <button
                                type="button"
                                onClick={() => toggleProductUpgrades(product.id)}
                                className={`w-full px-3 py-2 rounded text-sm font-semibold transition ${
                                  selectedProduct?.upgradesEnabled
                                    ? 'bg-beagle-orange text-white'
                                    : 'bg-gray-100 text-beagle-dark hover:bg-gray-200'
                                }`}
                              >
                                {selectedProduct?.upgradesEnabled ? '✓ Optional Upgrades Enabled' : 'Enable Optional Upgrades'}
                              </button>
                              {selectedProduct?.upgradesEnabled && (
                                <div className="mt-2 text-xs text-gray-600 bg-orange-50 border border-orange-100 p-3 rounded">
                                  <p className="font-semibold text-beagle-orange mb-2">Tenants can choose:</p>
                                  <ul className="space-y-1.5">
                                    {AVAILABLE_UPGRADES.map((upgrade) => (
                                      <li key={upgrade.id} className="flex items-center justify-between">
                                        <span>{upgrade.name}</span>
                                        <span className="font-semibold text-beagle-orange">{upgrade.priceAdd}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Opt-Out Configuration */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-3">
              Opt-Out Options
            </label>
            <p className="text-xs text-gray-600 mb-4">
              Which products can tenants opt out of on this form? (Leave unchecked if opt-out is not allowed)
            </p>
            <div className="space-y-3">
              {/* Tenant Liability Waiver */}
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formConfig.tenantLiabilityWaiverCanOptOut}
                  onChange={(e) => updateFormConfig('tenantLiabilityWaiverCanOptOut', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-beagle-dark">Tenant Liability Waiver</p>
                  <p className="text-xs text-gray-600">Allow tenants to opt out of the liability waiver</p>
                </div>
              </label>

              {/* Renters Kit */}
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formConfig.rentersKitCanOptOut}
                  onChange={(e) => updateFormConfig('rentersKitCanOptOut', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-beagle-dark">Renters Kit</p>
                  <p className="text-xs text-gray-600">Allow tenants to opt out of the renters kit</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex-1 bg-beagle-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            {!isNew && (
              <button
                onClick={handlePublishToggle}
                disabled={isSaving}
                className={`flex-1 px-6 py-2 rounded-lg font-semibold ${
                  formData.isPublished
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-beagle-orange text-white hover:bg-opacity-90'
                } disabled:opacity-50`}
              >
                {isSaving ? 'Updating...' : formData.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            )}

            {isNew && (
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex-1 bg-beagle-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create & Publish'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="overflow-y-auto pl-4 hidden lg:block thin-scrollbar">
        <div className="bg-beagle-light rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-beagle-dark mb-4 sticky top-0 bg-beagle-light">Live Preview</p>
          <div className="bg-white rounded border border-gray-300 overflow-hidden">
            <BeagleProgramPagePreview program={previewData} form={formConfig as any} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

