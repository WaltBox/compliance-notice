'use client';

import React, { useState } from 'react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';

interface OptInFormProps {
  formId: string;
  canOptInToTenantLiabilityWaiver: boolean;
  canOptInToRentersKit: boolean;
  optInFormTitle?: string;
  optInFormSubtitle?: string;
  onSuccess?: () => void;
}

/**
 * Opt-in form for tenants to submit their opt-in preferences
 * Displays directly on the page with attractive card design
 */
export default function OptInForm({
  formId,
  canOptInToTenantLiabilityWaiver,
  canOptInToRentersKit,
  optInFormTitle,
  optInFormSubtitle,
  onSuccess,
}: OptInFormProps) {
  // Default text
  const defaultTitle = 'Interested in using Beagle?';
  const defaultSubtitle = 'Tell us which products you\'d like to use';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    optedInToTenantLiabilityWaiver: false,
    optedInToRentersKit: false,
  });

  const handleCheckboxChange = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Format phone number as user types
    if (name === 'phoneNumber') {
      newValue = formatPhoneNumber(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Check at least one product is selected
    if (!formData.optedInToTenantLiabilityWaiver && !formData.optedInToRentersKit) {
      setError('Please select at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/opt-in-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          optedInToTenantLiabilityWaiver: formData.optedInToTenantLiabilityWaiver,
          optedInToRentersKit: formData.optedInToRentersKit,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Something went wrong try again later';
        try {
        const errorData = await response.json();
          // Use API error if available, but fallback to generic message
          if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        } catch {
          // If response is not JSON, keep generic message
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        optedInToTenantLiabilityWaiver: false,
        optedInToRentersKit: false,
      });

      // Hide success message after 4 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 4000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit opt-in response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canOptInToTenantLiabilityWaiver && !canOptInToRentersKit) {
    return null; // Don't render if no opt-in options available
  }

  return (
    <div className="w-full">
      {/* Form Card - Premium Aesthetic */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Orange Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-beagle-orange via-orange-500 to-beagle-orange"></div>
          
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="mb-5">
              <h3 className="text-xl font-bold text-beagle-dark leading-tight">
                {optInFormTitle || defaultTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {optInFormSubtitle || defaultSubtitle}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-beagle-dark mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent transition-all bg-white hover:border-gray-400"
                    disabled={isSubmitting}
                  />
                </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-beagle-dark mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent transition-all bg-white hover:border-gray-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-beagle-dark mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent transition-all bg-white hover:border-gray-400"
                disabled={isSubmitting}
              />
            </div>

              {/* Product Selection */}
              <div>
                <p className="text-sm font-semibold text-beagle-dark mb-3">
                  Which products would you like to use? 
                </p>
                
                <div className="space-y-2">
                  {canOptInToTenantLiabilityWaiver && (
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-beagle-orange hover:bg-orange-50 transition-all group">
                      <input
                        type="radio"
                        name="optInProduct"
                        checked={formData.optedInToTenantLiabilityWaiver}
                        onClick={(e) => {
                          // Allow deselection by clicking the same option
                          if (formData.optedInToTenantLiabilityWaiver) {
                            setFormData({
                              ...formData,
                              optedInToTenantLiabilityWaiver: false,
                              optedInToRentersKit: false,
                            });
                            (e.target as HTMLInputElement).checked = false;
                          } else {
                            setFormData({
                              ...formData,
                              optedInToTenantLiabilityWaiver: true,
                              optedInToRentersKit: false,
                            });
                          }
                        }}
                        className="w-5 h-5 border-2 border-beagle-orange text-beagle-orange focus:ring-beagle-orange cursor-pointer accent-beagle-orange"
                        disabled={isSubmitting}
                      />
                      <div className="ml-3">
                        <span className="font-semibold text-beagle-dark text-sm group-hover:text-beagle-orange transition-colors">
                          Tenant Liability Waiver
                        </span>
                        <span className="text-xs text-gray-600 block mt-0.5">
                          100k base liability coverage
                        </span>
                      </div>
                    </label>
                  )}

                  {canOptInToRentersKit && (
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-beagle-orange hover:bg-orange-50 transition-all group">
                      <input
                        type="radio"
                        name="optInProduct"
                        checked={formData.optedInToRentersKit}
                        onClick={(e) => {
                          // Allow deselection by clicking the same option
                          if (formData.optedInToRentersKit) {
                            setFormData({
                              ...formData,
                              optedInToTenantLiabilityWaiver: false,
                              optedInToRentersKit: false,
                            });
                            (e.target as HTMLInputElement).checked = false;
                          } else {
                            setFormData({
                              ...formData,
                              optedInToTenantLiabilityWaiver: false,
                              optedInToRentersKit: true,
                            });
                          }
                        }}
                        className="w-5 h-5 border-2 border-beagle-orange text-beagle-orange focus:ring-beagle-orange cursor-pointer accent-beagle-orange"
                        disabled={isSubmitting}
                      />
                      <div className="ml-3">
                        <span className="font-semibold text-beagle-dark text-sm group-hover:text-beagle-orange transition-colors">
                          Renters Kit
                        </span>
                        <span className="text-xs text-gray-600 block mt-0.5">
                          Move-in concierge, ID protection & more
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button or Success Message */}
              {success ? (
                <div className="w-full px-4 py-3 bg-green-100 text-green-700 font-semibold text-sm rounded-lg text-center">
                  ✓ Your request to opt in has been received! Thank you!
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-beagle-orange text-white font-semibold text-sm rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}

              {/* Footer Text */}

            </form>
          </div>
        </div>
    </div>
  );
}

