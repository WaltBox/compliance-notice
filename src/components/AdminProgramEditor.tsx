'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { BeagleProgramData, ProgramProduct } from '@/types';
import { generateSlug, getDefaultPageTitle, getDefaultProgramSubheading } from '@/lib/utils';
import BeagleProgramPage from './BeagleProgramPage';
import ProductBuilder from './ProductBuilder';

interface AdminProgramEditorProps {
  program?: BeagleProgramData;
  isNew?: boolean;
}

/**
 * Admin program editor with live preview
 * Two-column layout on desktop, stacked on mobile
 */
export default function AdminProgramEditor({ program, isNew = false }: AdminProgramEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    propertyManagerName: program?.propertyManagerName || '',
    propertyManagerSlug: program?.propertyManagerSlug || '',
    pageTitle: program?.pageTitle || '',
    introText: program?.introText || '',
    insuranceVerificationUrl: program?.insuranceVerificationUrl || '',
    programHeading: program?.programHeading || 'View your Beagle program',
    programSubheading: program?.programSubheading || getDefaultProgramSubheading(),
    products: program?.products || ([] as ProgramProduct[]),
    isPublished: program?.isPublished || false,
  });

  // Auto-generate pageTitle when propertyManagerName changes
  const handlePropertyManagerNameChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      propertyManagerName: value,
      pageTitle: prev.pageTitle === getDefaultPageTitle(prev.propertyManagerName) || !prev.pageTitle
        ? getDefaultPageTitle(value)
        : prev.pageTitle,
    }));
    setValidationErrors((prev) => ({ ...prev, propertyManagerName: '' }));
  }, []);

  // Auto-generate slug when propertyManagerName changes (only for new programs)
  const handleSlugChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      propertyManagerSlug: value,
    }));
    setValidationErrors((prev) => ({ ...prev, propertyManagerSlug: '' }));
  }, []);

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
    if (!formData.pageTitle.trim()) {
      errors.pageTitle = 'Page title is required';
    }
    if (!formData.introText.trim()) {
      errors.introText = 'Intro text is required';
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
        // Update local state with server response
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
          <h2 className="text-2xl font-bold text-beagle-dark mb-4">Program Editor</h2>

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
              onChange={(e) => handlePropertyManagerNameChange(e.target.value)}
              placeholder="e.g., Santa Fe Property Management"
              className={`w-full px-4 py-2 border rounded-lg font-montserrat ${
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
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="auto-generated from property manager name"
              disabled={!isNew}
              className={`w-full px-4 py-2 border rounded-lg font-montserrat ${
                !isNew ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${validationErrors.propertyManagerSlug ? 'border-red-500' : 'border-gray-300'}`}
            />
            {validationErrors.propertyManagerSlug && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.propertyManagerSlug}</p>
            )}
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Page Title *
            </label>
            <input
              type="text"
              value={formData.pageTitle}
              onChange={(e) => updateFormData('pageTitle', e.target.value)}
              placeholder="e.g., Insurance Verification – Santa Fe Property Management"
              className={`w-full px-4 py-2 border rounded-lg font-montserrat ${
                validationErrors.pageTitle ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.pageTitle && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.pageTitle}</p>
            )}
          </div>

          {/* Intro Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Intro Text *
            </label>
            <textarea
              value={formData.introText}
              onChange={(e) => updateFormData('introText', e.target.value)}
              placeholder="e.g., Your lease requires renters insurance. Let's get you covered…"
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg font-montserrat ${
                validationErrors.introText ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.introText && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.introText}</p>
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
              placeholder="https://..."
              className={`w-full px-4 py-2 border rounded-lg font-montserrat ${
                validationErrors.insuranceVerificationUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.insuranceVerificationUrl && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.insuranceVerificationUrl}</p>
            )}
          </div>

          {/* Program Heading */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Program Heading
            </label>
            <input
              type="text"
              value={formData.programHeading}
              onChange={(e) => updateFormData('programHeading', e.target.value)}
              placeholder="View your Beagle program"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-montserrat"
            />
          </div>

          {/* Program Subheading */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-beagle-dark mb-2">
              Program Subheading
            </label>
            <textarea
              value={formData.programSubheading}
              onChange={(e) => updateFormData('programSubheading', e.target.value)}
              placeholder="See the renter protections and services that you have access to…"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-montserrat"
            />
          </div>

          {/* Product Builder */}
          <ProductBuilder
            products={formData.products}
            onChange={(products) => updateFormData('products', products)}
          />

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
            <BeagleProgramPage program={previewData} mode="notice" />
          </div>
        </div>
      </div>
    </div>
  );
}

