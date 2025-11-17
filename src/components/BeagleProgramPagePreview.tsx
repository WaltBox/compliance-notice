'use client';

import React from 'react';
import type { BeagleProgramData } from '@/types';
import BeagleLogo from './BeagleLogo';

interface BeagleProgramPagePreviewProps {
  program: BeagleProgramData;
}

/**
 * Simplified public-facing program page
 */
export default function BeagleProgramPagePreview({
  program,
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
              Submit your 3rd party policy to our AI verification system <u><a href={program.insuranceVerificationUrl} target="_blank" rel="noopener noreferrer" className="text-beagle-orange font-semibold hover:underline">here</a></u>.
            </p>
          </section>

          {/* Products Section with Header */}
          {program.selectedProducts && program.selectedProducts.length > 0 && (
            <section className="mb-12 sm:mb-16">
              <h2 className="text-xl font-bold text-beagle-orange mb-6">Beagle Program:</h2>
              <div className="space-y-8 sm:space-y-10">
                {program.selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-b border-gray-200 pb-6 sm:pb-8"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <p className="font-semibold text-beagle-dark">{product.name}</p>
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
            </section>
          )}

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

          {/* Footer */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-beagle-dark text-sm leading-relaxed mb-6">
              Thank you! If you wish to be enrolled under Beagle no further action is needed.
            </p>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-beagle-orange font-bold text-lg">Questions?</h3>
                <img 
                  src="/images/beagledog.png" 
                  alt="Beagle" 
                  className="w-20 h-20 object-contain"
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
                  <a href="mailto:jack@beagleforpms.com" className="text-beagle-orange font-semibold text-xs hover:underline break-all leading-tight">
                    jack@beagleforpms.com
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

