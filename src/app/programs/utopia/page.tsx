'use client';

export default function UtopiaPage() {

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
                Your lease requires renters insurance at all times to cover any tenant legal liability. Your policy must include a minimum of <u><span className="font-semibold" style={{ color: '#0d3497' }}>$300,000 in liability coverage</span></u> and <u><span className="font-semibold" style={{ color: '#0d3497' }}>$50,000 in personal contents coverage</span></u>, along with any other requirements specified in your lease agreement.
              </p>
            </div>

            {/* Insurance Verification Section */}
            <div className="mb-8 sm:mb-10">
              <p className="text-beagle-dark font-semibold text-sm mb-3">Already have renters insurance?</p>
              <p className="text-beagle-dark text-sm leading-relaxed">
                Submit your policy to our verification system <u><a href="https://verify.beagleforpms.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-80" style={{ color: '#0d3497' }}>here</a></u>.
              </p>
            </div>
          </section>

          {/* Program Details Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl font-bold text-beagle-dark mb-8" style={{ color: '#0d3497' }}>Program Details</h2>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="p-8 sm:p-12 bg-white">
                <h3 className="text-3xl sm:text-4xl font-bold text-beagle-dark mb-6 text-center">
                  Insurance Requirements
                </h3>
                <h4 className="text-2xl font-bold text-center mb-8 text-beagle-dark">
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
                      <p className="font-bold whitespace-nowrap ml-4" style={{ color: '#0d3497' }}>
                        $50,000
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">Covers your personal belongings against loss or damage from fire, theft, weather, and other covered perils.</p>
                  </div>

                  {/* Automatic Coverage Highlight */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-beagle-dark mb-2">Automatic Coverage Included</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This program automatically provides you with both the Tenant Liability Waiver and Personal Contents Coverage for just <span className="font-semibold" style={{ color: '#0d3497' }}>$30 / month</span>. No separate action required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>


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

    </div>
  );
}

