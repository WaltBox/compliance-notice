'use client';

import React from 'react';
import type { BeagleProgramData, BeagleProgramPageMode } from '@/types';
import BeagleLogo from './BeagleLogo';
import ProgramProductCard from './ProgramProductCard';

interface BeagleProgramPageProps {
  program: BeagleProgramData;
  mode?: BeagleProgramPageMode;
  children?: React.ReactNode; // for future form mode footer content
}

/**
 * Reusable BeagleProgramPage component
 * Renders both the public notice view and can be used in preview mode
 * Extensible for future "form" mode with additional content
 */
export default function BeagleProgramPage({
  program,
  mode = 'notice',
  children,
}: BeagleProgramPageProps) {
  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Header with logo */}
      <header className="border-b border-gray-200 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <BeagleLogo />
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-4 sm:py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Insurance Verification Section */}
          <section className="mb-12 sm:mb-16 lg:mb-20">
            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-beagle-dark mb-6 text-center">
              {program.pageTitle}
            </h1>

            {/* Intro Text */}
            <p className="text-base sm:text-lg text-beagle-dark leading-relaxed text-center mb-8">
              {program.introText}
            </p>

            {/* Insurance Verification Call-to-Action */}
            <div className="text-center">
              <p className="text-beagle-dark mb-3">
                Already have renters insurance?{' '}
                <a
                  href={program.insuranceVerificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-beagle-orange font-semibold underline hover:no-underline transition-all"
                >
                  Submit your 3rd party policy here
                </a>
                .
              </p>
            </div>
          </section>

          {/* Program Products Section */}
          <section className="mb-12 sm:mb-16">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold text-beagle-dark text-center mb-4">
              {program.programHeading}
            </h2>

            {/* Property Manager Name (Orange, Bold) */}
            <h3 className="text-2xl font-bold text-beagle-orange text-center mb-6">
              {program.propertyManagerName}
            </h3>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-beagle-dark text-center mb-10 leading-relaxed">
              {program.programSubheading}
            </p>

            {/* Products Grid */}
            {program.products && program.products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {program.products.map((product) => (
                  <ProgramProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No products available for this program.</p>
              </div>
            )}
          </section>

          {/* Footer content for future form mode */}
          {children && (
            <section className="mt-12 sm:mt-16 border-t border-gray-200 pt-8">
              {children}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

