'use client';

import { useState } from 'react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-formatter';

export default function UtopiaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    optedOut: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phoneNumber') {
      newValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      optedOut: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.optedOut) {
      setError('Please confirm you want to opt out');
      return;
    }

    setLoading(true);

    try {
      console.log('Opt-out submission:', formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        optedOut: false,
      });

      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (!loading) {
      setIsModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        optedOut: false,
      });
      setError('');
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-bricolage">
      {/* Header */}
      <header className="border-b border-gray-200 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <img src="/images/utopia.webp" alt="Utopia Management" className="h-16 mb-4" />
          <p className="text-gray-600 text-sm">Insurance Requirements Notice</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <section className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-beagle-dark mb-6 sm:mb-8">
              <span style={{ color: '#0d3497' }}>Insurance Verification</span> - Utopia Management
            </h1>

            <div className="mb-8 sm:mb-10">
              <p className="text-beagle-dark text-sm leading-relaxed mb-4 sm:mb-5">
                Your lease requires renters insurance at all times to cover any tenant legal liability. Your policy must include a minimum of <span className="font-semibold">$300,000 in liability coverage</span> and <span className="font-semibold">$50,000 in personal contents coverage</span>, along with any other requirements specified in your lease agreement.
              </p>
            </div>

            {/* Insurance Verification Section */}
            <div className="mb-8 sm:mb-10">
              <p className="text-beagle-dark font-semibold text-sm mb-3">Already have renters insurance?</p>
              <p className="text-beagle-dark text-sm leading-relaxed">
                Submit your policy to our verification system <u><a href="https://verify.beagleforpms.com" target="_blank" rel="noopener noreferrer" className="text-beagle-orange font-semibold hover:opacity-80">here</a></u>.
              </p>
            </div>
          </section>

          {/* Program Details Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl font-bold text-beagle-dark mb-8" style={{ color: '#ff7a00' }}>Program Details</h2>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="p-8 sm:p-12 bg-white">
                <h3 className="text-3xl sm:text-4xl font-bold text-beagle-dark mb-6 text-center">
                  Insurance Requirements
                </h3>
                <h4 className="text-2xl font-bold text-center mb-8" style={{ color: '#ff7a00' }}>
                  Utopia Management
                </h4>

                <p className="text-beagle-dark text-center leading-relaxed mb-8">
                  Understand the tenant liability and content coverage requirements for your lease. Your policy must maintain the minimum required coverage amounts at all times.
                </p>

                <div className="space-y-8 text-left">
                  {/* Tenant Liability */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-semibold text-beagle-dark">Tenant Liability Waiver</p>
                      <p className="font-bold whitespace-nowrap ml-4" style={{ color: '#0d3497' }}>
                        $300,000
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Provides liability protection against accidental damage and covers claims from guests or roommates.</p>
                  </div>

                  {/* Content Coverage */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-semibold text-beagle-dark">Personal Contents Coverage</p>
                      <p className="font-bold whitespace-nowrap ml-4" style={{ color: '#ff7a00' }}>
                        $50,000
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Covers your personal belongings against loss or damage from fire, theft, weather, and other covered perils.</p>
                  </div>

                  {/* Automatic Coverage Highlight */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-beagle-dark mb-2">Automatic Coverage Included</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This program automatically provides you with both the Tenant Liability Waiver and Personal Contents Coverage for just <span className="font-semibold" style={{ color: '#ff7a00' }}>$30 / month</span>. No separate action required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Opt-Out Section */}
          {(
            <section className="mb-8 sm:mb-10">
              <p className="text-gray-600 text-xs leading-relaxed mb-2">
                If you would like to opt out of this program:
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold transition-all hover:opacity-70 underline"
                style={{ color: '#0d3497' }}
              >
                Click here
              </button>
            </section>
          )}

          {/* Footer */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center py-6">
              <p className="text-xs text-gray-500 mr-2">Powered by</p>
              <img 
                src="/images/beagle-logo.png" 
                alt="Beagle" 
                className="h-5 object-contain"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeModal}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-beagle-dark" style={{ color: '#0d3497' }}>
                Opt-Out Form
              </h2>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {success ? (
                <div className="p-8 bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-green-900 font-semibold text-sm mb-1">Success!</p>
                      <p className="text-green-700 text-sm leading-relaxed">
                        Your opt-out request has been submitted successfully. This window will close shortly.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
                      style={{ borderColor: '#ddd' }}
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
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
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
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.optedOut}
                        onChange={handleCheckboxChange}
                        disabled={loading}
                        className="w-4 h-4 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-beagle-dark">
                        I acknowledge that I have read the insurance requirements and am submitting this opt-out request.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-beagle-dark hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-beagle-orange text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

