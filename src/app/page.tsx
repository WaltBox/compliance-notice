import Link from 'next/link';
import BeagleLogo from '@/components/BeagleLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-beagle-light font-montserrat">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Logo */}
        <div className="mb-12 text-center">
          <BeagleLogo />
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-beagle-dark mb-4">
            Beagle Program Manager
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create and manage property management program notices and webviews
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Admin Link */}
          <Link
            href="/admin/beagle-programs"
            className="group bg-white border-2 border-beagle-orange rounded-lg p-8 text-center hover:shadow-lg transition-all"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <h2 className="text-2xl font-bold text-beagle-dark mb-2 group-hover:text-beagle-orange">
              Admin Panel
            </h2>
            <p className="text-gray-600">
              Create and edit program notices, manage products, and publish webviews
            </p>
          </Link>

          {/* About Link */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-2xl font-bold text-beagle-dark mb-2">Getting Started</h2>
            <p className="text-gray-600">
              Visit <code className="bg-gray-100 px-2 py-1 rounded">/admin/beagle-programs</code> to
              create your first program
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-beagle-dark mb-4">How it Works</h3>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">1.</span>
              <span>Go to the Admin Panel to create a new program for a property manager</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">2.</span>
              <span>Fill in the program details: title, intro text, verification URL</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">3.</span>
              <span>Add products with descriptions and optional bullet points</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">4.</span>
              <span>See your changes in real-time in the live preview</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">5.</span>
              <span>Publish the program to make it available to tenants</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-beagle-orange">6.</span>
              <span>
                Tenants visit <code className="bg-gray-100 px-2 py-1 rounded text-sm">/programs/[slug]</code> to
                view the program
              </span>
            </li>
          </ol>
        </div>

        {/* API Docs */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">API Endpoints</h3>
          <ul className="space-y-2 text-sm text-blue-800 font-mono">
            <li>• <span className="bg-blue-100 px-2 py-1">GET</span> /api/beagle-programs?slug=...</li>
            <li>• <span className="bg-blue-100 px-2 py-1">GET</span> /api/admin/beagle-programs</li>
            <li>• <span className="bg-blue-100 px-2 py-1">GET</span> /api/admin/beagle-programs/[id]</li>
            <li>• <span className="bg-blue-100 px-2 py-1">POST</span> /api/admin/beagle-programs</li>
            <li>• <span className="bg-blue-100 px-2 py-1">PUT</span> /api/admin/beagle-programs/[id]</li>
            <li>• <span className="bg-blue-100 px-2 py-1">PATCH</span> /api/admin/beagle-programs/[id]/publish</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

