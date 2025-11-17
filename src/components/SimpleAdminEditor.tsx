'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { BeagleProgramData, SelectedProduct } from '@/types';
import { generateSlug } from '@/lib/utils';
import { AVAILABLE_PRODUCTS } from '@/types';
import BeagleProgramPagePreview from './BeagleProgramPagePreview';

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
  });

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
        body: JSON.stringify(formData),
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
      const response = await fetch(
        `/api/admin/beagle-programs/${program.id}/publish`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle publish status');
      }

      const result = await response.json();
      setFormData((prev) => ({
        ...prev,
        isPublished: result.data.isPublished,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publish status');
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

  // Generate preview data
  const previewData: BeagleProgramData = {
    ...formData,
    id: program?.id || 'preview',
    createdAt: program?.createdAt || new Date().toISOString(),
    updatedAt: program?.updatedAt || new Date().toISOString(),
  } as BeagleProgramData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
      {/* Left: Form Editor */}
      <div className="space-y-6">
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

          {/* Products Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-3">
              Insurance Products to Offer
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Select which products to include in this program and enter the price for each
            </p>
            <div className="space-y-3">
              {AVAILABLE_PRODUCTS.map((product) => {
                const isSelected = formData.selectedProducts.some((p) => p.id === product.id);
                const selectedProduct = formData.selectedProducts.find((p) => p.id === product.id);
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded p-3">
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
                      <div className="ml-6 border-t border-gray-200 pt-3">
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
                    )}
                  </div>
                );
              })}
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
      <div className="lg:sticky lg:top-8 lg:h-fit">
        <div className="bg-beagle-light rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-beagle-dark mb-4">Live Preview</p>
          <div className="bg-white rounded border border-gray-300 overflow-hidden">
            <BeagleProgramPagePreview program={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}

