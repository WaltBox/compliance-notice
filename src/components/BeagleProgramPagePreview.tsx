'use client';

import React from 'react';
import type { BeagleProgramData } from '@/types';
import BeagleLogo from './BeagleLogo';
import OptOutForm from './OptOutForm';

interface Form {
  id: string;
  tenantLiabilityWaiverCanOptOut: boolean;
  rentersKitCanOptOut: boolean;
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
              <span className="text-beagle-orange">Insurance Verification</span> - {program.propertyManagerName}
            </h1>

            {/* Intro Message */}
            <div className="mb-8 sm:mb-10">
              <p className="text-beagle-dark text-base leading-relaxed mb-4 sm:mb-5">
                Your lease requires renters insurance. <span className="font-semibold">Let's get you covered.</span>
              </p>
              <p className="text-beagle-dark text-sm leading-relaxed">
                You can either upload your own renters insurance policy or be automatically covered through Beagle — a simple, built-in way to meet your lease requirement.
              </p>
            </div>
          </section>

          {/* Third Party Insurance CTA */}
          <section className="mb-8 sm:mb-10">
            <p className="text-beagle-dark font-semibold mb-3 sm:mb-4">
              Already have renters insurance?
            </p>
            <p className="text-beagle-dark text-sm mb-4 sm:mb-5">
              Submit your 3rd party policy to our AI verification system <u><a href={program.insuranceVerificationUrl.startsWith('http') ? program.insuranceVerificationUrl : `https://${program.insuranceVerificationUrl}`} target="_blank" rel="noopener noreferrer" className="text-beagle-orange font-semibold hover:underline">here</a></u>.
            </p>
          </section>

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
                                {form?.tenantLiabilityWaiverCanOptOut && (
                                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                    Optional
                                  </span>
                                )}
                              </div>
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

                  {/* Renters Kit Section */}
                  {rentersKitProducts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-beagle-dark mb-6">Renters Kit</h3>
                        {form?.rentersKitCanOptOut && (
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

