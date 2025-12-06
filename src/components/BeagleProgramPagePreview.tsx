'use client';

import React, { useState } from 'react';
import type { BeagleProgramData } from '@/types';
import { AVAILABLE_UPGRADES } from '@/types';
import BeagleLogo from './BeagleLogo';
import OptOutForm from './OptOutForm';
import OptInForm from './OptInForm';

interface Form {
  id: string;
  tenantLiabilityWaiverCanOptOut: boolean;
  rentersKitCanOptOut: boolean;
  tenantLiabilityWaiverCanOptIn?: boolean;
  rentersKitCanOptIn?: boolean;
}

interface BeagleProgramPagePreviewProps {
  program: BeagleProgramData;
  form?: Form | null;
}

/**
 * Simplified public-facing program page
 */
export default function BeagleProgramPagePreview({
  program,
  form,
}: BeagleProgramPagePreviewProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<'upgrade_5k' | 'upgrade_10k' | 'upgrade_20k' | null>(null);
  const [upgradeFormData, setUpgradeFormData] = useState({ firstName: '', lastName: '' });
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  
  // Check if Tenant Liability product has upgrades enabled
  const liabilityProduct = program.selectedProducts?.find(p => p.id === 'product_100k');
  const upgradesEnabled = liabilityProduct?.upgradesEnabled;
  
  // Check if opt-out is available
  const optOutFormExists = form && (form.tenantLiabilityWaiverCanOptOut || form.rentersKitCanOptOut);
  
  // Check if opt-in is available
  const optInFormExists = form && (form.tenantLiabilityWaiverCanOptIn || form.rentersKitCanOptIn);

  // Helper function to render text with <bold> and <br> support
  const renderFormattedText = (text: string) => {
    return text.split(/(<bold>.*?<\/bold>)/g).map((part, idx) => {
      if (part.startsWith('<bold>') && part.endsWith('</bold>')) {
        // Extract text between <bold> tags
        const boldText = part.replace(/<bold>|<\/bold>/g, '');
        return (
          <React.Fragment key={idx}>
            <span className="font-semibold">{boldText}</span>
          </React.Fragment>
        );
      }
      // Handle line breaks within non-bold text
      return part.split('\n').map((line, lineIdx) => (
        <React.Fragment key={`${idx}-${lineIdx}`}>
          {line}
          {lineIdx < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  // Default notice text (fallback)
  const defaultNoticeTitle = "Insurance Verification";
  const defaultIntroText = "Your lease requires renters insurance. <bold>Let's get you covered.</bold>\n\nYou can either upload your own renters insurance policy or be automatically covered through Beagle — a simple, built-in way to meet your lease requirement.";
  const defaultInsuranceText = "Already have renters insurance?\n\nSubmit your 3rd party policy to our AI verification system here.";

  // Use customized text if available, otherwise use defaults
  const noticeTitle = program.noticeTitle || defaultNoticeTitle;
  // Convert <br> tags to newlines for processing
  const introText = (program.noticeIntroText || defaultIntroText).replace(/<br\s*\/?>/gi, '\n');
  const insuranceText = (program.noticeInsuranceText || defaultInsuranceText).replace(/<br\s*\/?>/gi, '\n');
  const showInsuranceSection = !program.insuranceNotRequired;

  // Helper function to calculate total price
  const calculateTotalPrice = (basePrice: string, upgradeId: string | null) => {
    if (!upgradeId) return basePrice;

    const upgrade = AVAILABLE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return basePrice;

    // Extract base price number
    const baseMatch = basePrice.match(/\d+/);
    if (!baseMatch) return basePrice;
    
    const baseNum = parseInt(baseMatch[0]);

    // Extract upgrade price number
    const upgradeMatch = upgrade.priceAdd.match(/\d+/);
    if (!upgradeMatch) return basePrice;
    
    const upgradeNum = parseInt(upgradeMatch[0]);
    const total = baseNum + upgradeNum;

    // Always return with / month format
    return `$${total} / month`;
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);

    // Validation
    if (!upgradeFormData.firstName.trim() || !upgradeFormData.lastName.trim()) {
      setUpgradeError('Please enter both first and last name');
      return;
    }

    if (!selectedUpgrade) {
      setUpgradeError('Please select an upgrade');
      return;
    }

    setIsSubmittingUpgrade(true);

    try {
      const selectedUpgradeObj = AVAILABLE_UPGRADES.find(u => u.id === selectedUpgrade);
      
      const response = await fetch('/api/upgrade-selections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beagleProgramId: program.id,
          firstName: upgradeFormData.firstName.trim(),
          lastName: upgradeFormData.lastName.trim(),
          phoneNumber: '(555) 000-0000',
          selectedUpgrade,
          selectedUpgradePrice: selectedUpgradeObj?.priceAdd,
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

      setUpgradeSuccess(true);
      setUpgradeFormData({ firstName: '', lastName: '' });

      // Hide success message after 2 seconds
      setTimeout(() => {
        setUpgradeSuccess(false);
      }, 2000);
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : 'Failed to submit upgrade selection');
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-bricolage">
        {/* Header with logo */}
        <header className="border-b border-gray-200 py-6 px-4">
          <div className="max-w-3xl mx-auto">
            <BeagleLogo />
          </div>
        </header>

        {/* Main content */}
        <main className="py-8 px-4 sm:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <section className="mb-8 sm:mb-10">
            {/* Page Title: Insurance Verification - PM Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-beagle-dark mb-6 sm:mb-8">
              <span className="text-beagle-orange">{noticeTitle}</span> - {program.propertyManagerName}
            </h1>

            {/* Intro Message */}
            <div className="mb-8 sm:mb-10">
              {introText.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-beagle-dark text-sm leading-relaxed mb-4 sm:mb-5">
                  {renderFormattedText(paragraph)}
                </p>
              ))}
            </div>
          </section>

          {/* Third Party Insurance CTA */}
          {showInsuranceSection && (
            <section className="mb-8 sm:mb-10">
              {insuranceText.split('\n\n').map((paragraph, idx) => {
                // Check if this paragraph contains a link
                if (paragraph.toLowerCase().includes('policy') || paragraph.toLowerCase().includes('here')) {
                  return (
                    <div key={idx} className="mb-4 sm:mb-5">
                      {paragraph.split('\n').map((line, lineIdx) => (
                        <p key={lineIdx} className="text-beagle-dark text-sm mb-2">
                          {line.includes('here') ? (
                            <>
                              {renderFormattedText(line.substring(0, line.indexOf('here')))}
                              <u><a href={program.insuranceVerificationUrl.startsWith('http') ? program.insuranceVerificationUrl : `https://${program.insuranceVerificationUrl}`} target="_blank" rel="noopener noreferrer" className="text-beagle-orange font-semibold hover:underline">here</a></u>
                              {renderFormattedText(line.substring(line.indexOf('here') + 4))}
                            </>
                          ) : line.startsWith('Already have') ? (
                            <p className="text-beagle-dark font-semibold mb-3 sm:mb-4">{renderFormattedText(line)}</p>
                          ) : (
                            renderFormattedText(line)
                          )}
                        </p>
                      ))}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-beagle-dark font-semibold mb-3 sm:mb-4">
                    {renderFormattedText(paragraph)}
                  </p>
                );
              })}
            </section>
          )}

          {/* Products Section with Header */}
          {program.selectedProducts && program.selectedProducts.length > 0 && (() => {
            // Separate products by type
            const liabilityProducts = program.selectedProducts.filter(p => p.id.startsWith('product_'));
            const rentersKitProducts = program.selectedProducts.filter(p => p.id.startsWith('renters_kit_'));

            return (
              <section className="mb-12 sm:mb-16">
                <h2 className="text-xl font-bold text-beagle-orange mb-8">Beagle Program:</h2>
                
                <div className="space-y-10 sm:space-y-12">
                  {/* Tenant Liability Waiver Section */}
                  {liabilityProducts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-beagle-dark mb-6">Tenant Liability Waiver</h3>
                      <div className="space-y-8 sm:space-y-10">
                        {liabilityProducts.map((product) => (
                          <div
                            key={product.id}
                            className="border-b border-gray-200 pb-6 sm:pb-8"
                          >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-beagle-dark">{product.name}</p>
                                {(form?.tenantLiabilityWaiverCanOptOut || form?.tenantLiabilityWaiverCanOptIn) && (
                                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                    Optional
                                  </span>
                                )}
                              </div>
                              {product.price && (
                                <p className="text-beagle-orange font-bold whitespace-nowrap ml-4">
                                  {product.id === 'product_100k' && selectedUpgrade
                                    ? calculateTotalPrice(product.price, selectedUpgrade)
                                    : product.price.includes('$') ? product.price : `$${product.price} / month`}
                                </p>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                            {/* Optional Upgrades Section */}
                            {upgradesEnabled && product.id === 'product_100k' && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-beagle-dark mb-3">Optional Upgrades:</p>
                                <div className="space-y-3">
                                  {AVAILABLE_UPGRADES.map((upgrade) => (
                                    <label key={upgrade.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50 transition">
                                      <input
                                        type="radio"
                                        name="upgrade"
                                        value={upgrade.id}
                                        checked={selectedUpgrade === upgrade.id}
                                        onClick={(e) => {
                                          // Allow deselection by clicking the same option
                                          if (selectedUpgrade === upgrade.id) {
                                            setSelectedUpgrade(null);
                                            e.currentTarget.checked = false;
                                          } else {
                                            setSelectedUpgrade(upgrade.id);
                                          }
                                        }}
                                        onChange={() => {}}
                                      />
                                      <div className="flex items-center justify-between flex-1">
                                        <span className="text-sm text-beagle-dark">
                                          {upgrade.name}
                                        </span>
                                        <span className="text-sm font-semibold text-beagle-orange">
                                          {upgrade.priceAdd}
                                        </span>
                                      </div>
                                    </label>
                                  ))}
                                </div>

                                {/* Inline Upgrade Form - Always show if upgrade selected */}
                                {selectedUpgrade && (
                                  <form onSubmit={handleUpgradeSubmit} className="mt-4 pt-4 border-t border-gray-200">
                                    {upgradeSuccess && (
                                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-sm font-semibold">✓ Upgrade submitted successfully!</p>
                                      </div>
                                    )}

                                    {upgradeError && (
                                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{upgradeError}</p>
                                      </div>
                                    )}

                                    <p className="text-xs font-semibold text-beagle-dark mb-4 text-center">
                                      Complete your information to confirm this upgrade
                                    </p>

                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-beagle-dark mb-2">
                                          First Name *
                                        </label>
                                        <input
                                          type="text"
                                          value={upgradeFormData.firstName}
                                          onChange={(e) => setUpgradeFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                          placeholder="John"
                                          disabled={isSubmittingUpgrade}
                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-beagle-dark mb-2">
                                          Last Name *
                                        </label>
                                        <input
                                          type="text"
                                          value={upgradeFormData.lastName}
                                          onChange={(e) => setUpgradeFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                          placeholder="Doe"
                                          disabled={isSubmittingUpgrade}
                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition"
                                        />
                                      </div>
                                    </div>

                                    <button
                                      type="submit"
                                      disabled={isSubmittingUpgrade}
                                      className="w-full mt-4 bg-beagle-orange text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50 transition active:scale-95"
                                    >
                                      {isSubmittingUpgrade ? 'Submitting...' : 'Confirm Upgrade'}
                                    </button>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Renters Kit Section */}
                  {rentersKitProducts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-beagle-dark mb-6">Renters Kit</h3>
                        {(form?.rentersKitCanOptOut || form?.rentersKitCanOptIn) && (
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded mb-6">
                            Optional
                          </span>
                        )}
                      </div>
                      <div className="space-y-8 sm:space-y-10">
                        {rentersKitProducts.map((product) => (
                          <div
                            key={product.id}
                            className="border-b border-gray-200 pb-6 sm:pb-8"
                          >
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                              <p className="font-semibold text-beagle-dark">Includes:</p>
                              {product.price && (
                                <p className="text-beagle-orange font-bold whitespace-nowrap ml-4">
                                  {product.price.includes('$') ? product.price : `$${product.price} / month`}
                                </p>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* Embedded Webview (if provided) */}
          {program.webviewUrl && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-beagle-dark mb-4">
                Program Details
              </h3>
              <div className="rounded-lg border border-gray-300 overflow-hidden">
                <iframe
                  src={program.webviewUrl}
                  title="Program Details"
                  width="100%"
                  height="600"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Loading embedded content from external source
              </p>
            </div>
          )}


          {/* Optional Products Opt-Out Section */}
          {form && (form.tenantLiabilityWaiverCanOptOut || form.rentersKitCanOptOut) && (
            <section className="mb-8 sm:mb-10">
              <p className="text-gray-600 text-xs leading-relaxed mb-2">
                If you would like to opt out of the optional Beagle Products:
              </p>
              <OptOutForm
                formId={form.id}
                canOptOutOfTenantLiabilityWaiver={form.tenantLiabilityWaiverCanOptOut}
                canOptOutOfRentersKit={form.rentersKitCanOptOut}
                selectedUpgrade={selectedUpgrade}
              />
            </section>
          )}

          {/* Optional Products Opt-In Section */}
          {form && (form.tenantLiabilityWaiverCanOptIn || form.rentersKitCanOptIn) && (
            <section className="mb-8 sm:mb-10">
              <OptInForm
                formId={form.id}
                canOptInToTenantLiabilityWaiver={form.tenantLiabilityWaiverCanOptIn || false}
                canOptInToRentersKit={form.rentersKitCanOptIn || false}
                optInFormTitle={(form as any).optInFormTitle}
                optInFormSubtitle={(form as any).optInFormSubtitle}
              />
            </section>
          )}

          {/* Footer */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-beagle-dark text-sm leading-relaxed mb-6">
              Thank you! If you wish to be enrolled under Beagle no further action is needed.
            </p>
            
            <div className="border border-gray-200 rounded-lg p-3 py-2">
              <div className="flex items-center gap-3">
                <h3 className="text-beagle-orange font-bold text-base">Questions?</h3>
                <img 
                  src="/images/beagledog.png" 
                  alt="Beagle" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Phone</p>
                  <a href="tel:309-250-4236" className="text-beagle-orange font-semibold text-xs hover:underline leading-tight">
                    309-250-4236
                  </a>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">Email</p>
                  <a href="mailto:jack@beagleforpm.com" className="text-beagle-orange font-semibold text-xs hover:underline break-all leading-tight">
                    jack@beagleforpm.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">
                For more information, visit us at
              </p>
              <a href="https://beagleforpms.com" target="_blank" rel="noopener noreferrer" className="text-beagle-orange font-semibold text-xs hover:underline break-all">
                beagleforpms.com
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

