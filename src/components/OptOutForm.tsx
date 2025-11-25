'use client';

import React, { useState } from 'react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';
import { AVAILABLE_UPGRADES } from '@/types';

interface OptOutFormProps {
  formId: string;
  canOptOutOfTenantLiabilityWaiver: boolean;
  canOptOutOfRentersKit: boolean;
  selectedUpgrade?: 'upgrade_5k' | 'upgrade_10k' | 'upgrade_20k' | null; // Selected upgrade from main page
  onSuccess?: () => void;
}

/**
 * Opt-out form for tenants to submit their opt-out preferences
 */
export default function OptOutForm({
  formId,
  canOptOutOfTenantLiabilityWaiver,
  canOptOutOfRentersKit,
  selectedUpgrade,
  onSuccess,
}: OptOutFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    optedOutOfTenantLiabilityWaiver: false,
    optedOutOfRentersKit: false,
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
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Check that at least one product is selected for opt-out
    if (!formData.optedOutOfTenantLiabilityWaiver && !formData.optedOutOfRentersKit) {
      setError('Please select at least one product to opt out of');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/opt-out-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          optedOutOfTenantLiabilityWaiver: formData.optedOutOfTenantLiabilityWaiver,
          optedOutOfRentersKit: formData.optedOutOfRentersKit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit opt-out');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        optedOutOfTenantLiabilityWaiver: false,
        optedOutOfRentersKit: false,
      });

      if (onSuccess) {
        onSuccess();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit opt-out');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if no opt-out options are available
  if (!canOptOutOfTenantLiabilityWaiver && !canOptOutOfRentersKit) {
    return null;
  }

  return (
    <>
      {/* Opt-Out Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-beagle-orange underline text-xs font-semibold hover:opacity-70 transition-all"
      >
        Click here
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-beagle-dark">Opt-Out Form</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-8 bg-green-50">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-green-900 font-semibold text-sm mb-1">
                      Success!
                    </p>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Your opt-out request has been submitted successfully. This window will close shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            {!success && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-beagle-dark mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beagle-orange disabled:opacity-50"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-beagle-dark mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beagle-orange disabled:opacity-50"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-beagle-dark mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beagle-orange disabled:opacity-50"
                  />
                </div>

                {/* Opt-Out Options */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-semibold text-beagle-dark mb-3">
                    Select what you'd like to opt out of:
                  </p>

                  {canOptOutOfTenantLiabilityWaiver && (
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.optedOutOfTenantLiabilityWaiver}
                        onChange={() => handleCheckboxChange('optedOutOfTenantLiabilityWaiver')}
                        disabled={isSubmitting}
                        className="w-4 h-4 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-beagle-dark">
                        Tenant Liability Waiver
                      </span>
                    </label>
                  )}

                  {canOptOutOfRentersKit && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.optedOutOfRentersKit}
                        onChange={() => handleCheckboxChange('optedOutOfRentersKit')}
                        disabled={isSubmitting}
                        className="w-4 h-4 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-beagle-dark">
                        Renters Kit
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-beagle-dark hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-beagle-orange text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

