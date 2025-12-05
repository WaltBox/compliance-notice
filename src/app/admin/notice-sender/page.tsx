'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/auth';
import {
  parseEmailCSV,
  TenantRow,
  InvalidRow,
  ParseResult,
} from '@/lib/email-csv-parser';
import { DEFAULT_MESSAGES } from '@/lib/email-templates';

interface SendResult {
  tenant: string;
  email: string;
  success: boolean;
  error?: string;
}

interface SendResponse {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: SendResult[];
}

export default function NoticeSenderPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [templateType, setTemplateType] = useState<'complianceNotice' | 'optOut' | 'optIn'>('complianceNotice');
  const [subject, setSubject] = useState(
    'Action Required: Renters Insurance Requirement; automatically enrolled in Beagle coverage'
  );
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGES.complianceNotice);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('View Details');
  const [propertyManagementName, setPropertyManagementName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResponse | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = getAdminToken();
    if (!token || isTokenExpired(token)) {
      clearAdminToken();
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `${propertyManagementName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`);

      const response = await fetch('/api/admin/upload-partner-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setPartnerLogoUrl(data.url);
      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };


  const handleTemplateTypeChange = (type: 'complianceNotice' | 'optOut' | 'optIn') => {
    setTemplateType(type);
    const defaultMessage = DEFAULT_MESSAGES[type];
    setCustomMessage(defaultMessage);

    // Update subject based on template type with partner name prefix
    const prefix = propertyManagementName ? `${propertyManagementName}: ` : '';
    switch (type) {
      case 'optOut':
        setSubject(prefix + 'Your Beagle Coverage Enrollment');
        setLinkText('Manage Your Enrollment');
        break;
      case 'optIn':
        setSubject(prefix + 'New: Renters Coverage Opportunity');
        setLinkText('Learn More');
        break;
      case 'complianceNotice':
      default:
        setSubject(prefix + 'Action Required: Renters Insurance Requirement; automatically enrolled in Beagle coverage');
        setLinkText('View Details');
        break;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSendResults(null);
    setCsvFile(file);

    try {
      const content = await file.text();
      const result = parseEmailCSV(content);
      setParseResult(result);

      if (result.invalid.length > 0) {
        console.warn('Invalid rows:', result.invalid);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to parse CSV file'
      );
      setCsvFile(null);
      setParseResult(null);
    }
  };


  const canSend =
    parseResult &&
    parseResult.stats.validCount > 0 &&
    subject.trim() &&
    customMessage.trim() &&
    linkUrl.trim() &&
    propertyManagementName.trim();

  const handleSendClick = () => {
    setError('');

    if (!parseResult?.stats.validCount) {
      setError('No valid email addresses to send to');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter an email subject');
      return;
    }

    if (!customMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!linkUrl.trim()) {
      setError('Please enter a link URL');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSend = async () => {
    if (!parseResult) return;

    setIsSending(true);
    setShowConfirmation(false);
    setError('');
    setSendResults(null);

    try {
      const token = getAdminToken();

      const response = await fetch('/api/admin/send-notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenants: parseResult.valid,
          config: {
            subject,
            customMessage,
            linkUrl,
            linkText,
            propertyManagementName,
            partnerLogoUrl,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send notices');
      }

      const result: SendResponse = await response.json();
      setSendResults(result);
      setSuccess(
        `Campaign sent! ${result.successful} successful, ${result.failed} failed.`
      );

      // Reset form after 3 seconds
      setTimeout(() => {
        setCsvFile(null);
        setParseResult(null);
        setTemplateType('complianceNotice');
        setSubject('Action Required: Renters Insurance Requirement; automatically enrolled in Beagle coverage');
        setCustomMessage(DEFAULT_MESSAGES.complianceNotice);
        setLinkUrl('');
        setLinkText('View Details');
        setPropertyManagementName('');
        setPartnerLogoUrl('');
        setSuccess('');
        setSendResults(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send campaign'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-beagle-light flex items-center justify-center">
        <p className="text-beagle-dark">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beagle-light font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-beagle-dark">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/beagle-programs/new"
                className="bg-beagle-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                + New Notice
              </Link>
              <button
                onClick={handleLogout}
                className="text-beagle-dark px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-8">
            <Link
              href="/admin/beagle-programs"
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 font-semibold hover:text-beagle-dark hover:border-gray-300 transition"
            >
              Notices
            </Link>
            <Link
              href="/admin/notice-sender"
              className="py-4 px-2 border-b-2 border-beagle-orange text-beagle-orange font-semibold"
            >
              Notice Sender
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div>
          {/* Subheader */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-beagle-dark">Send Email Notices</h2>
            <p className="text-gray-600 mt-1">
              Send insurance notices to tenants via email
            </p>
          </div>

          {/* Step 1: Upload CSV */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-beagle-dark mb-4">
              1. Upload Tenant List
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload your tenant list CSV. Must include name and email columns.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supports full property management exports or simple name/email lists.
              Finds columns like: Tenant, Name, Email, Emails, Email Address, etc.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-beagle-orange hover:file:bg-orange-100"
            />

            {csvFile && (
              <p className="text-sm text-gray-600 mt-3">
                Selected: <strong>{csvFile.name}</strong>
              </p>
            )}

            {parseResult && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-xl">✓</span>
                  <span className="font-semibold">
                    {parseResult.stats.validCount} valid email address
                    {parseResult.stats.validCount !== 1 ? 'es' : ''}
                  </span>
                </div>

                {parseResult.stats.invalidCount > 0 && (
                  <div className="text-orange-600 text-sm">
                    ⚠ {parseResult.stats.invalidCount} invalid/missing emails
                    (will be skipped)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Customize Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-beagle-dark mb-4">
              2. Select Template & Customize
            </h3>

            {/* Template Type Selection */}
            <div className="mb-6 p-4 bg-beagle-light rounded-lg border border-orange-200">
              <p className="text-sm font-semibold text-beagle-dark mb-3">Template Type:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition">
                  <input
                    type="radio"
                    name="templateType"
                    value="complianceNotice"
                    checked={templateType === 'complianceNotice'}
                    onChange={() => handleTemplateTypeChange('complianceNotice')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-beagle-dark">Compliance Notice</p>
                    <p className="text-xs text-gray-600">Tenant must have renters insurance (compliance requirement)</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition">
                  <input
                    type="radio"
                    name="templateType"
                    value="optOut"
                    checked={templateType === 'optOut'}
                    onChange={() => handleTemplateTypeChange('optOut')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-beagle-dark">Opt Out</p>
                    <p className="text-xs text-gray-600">They're auto-enrolled in Beagle program, can opt out anytime</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition">
                  <input
                    type="radio"
                    name="templateType"
                    value="optIn"
                    checked={templateType === 'optIn'}
                    onChange={() => handleTemplateTypeChange('optIn')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-beagle-dark">Opt In</p>
                    <p className="text-xs text-gray-600">PM offering convenient insurance coverage option</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Subject */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-beagle-dark mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Action Required: Renters Insurance"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent"
              />
            </div>

            {/* Custom Message */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-semibold text-beagle-dark">
                  Message to Tenants *
                </label>
                <span className="text-xs text-gray-500">
                  {customMessage.length} characters
                </span>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                placeholder="Your lease requires renters insurance..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep it short - users should spend &lt;10 seconds reading and click the link.
              </p>
            </div>

            {/* Link URL */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-beagle-dark mb-2">
                Notice Link *
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.beaglenotice.com/programs/ampere-property-management"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent"
              />
            </div>

            {/* Button Text */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-beagle-dark mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Get Renters Insurance"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent"
              />
            </div>

            {/* Property Management Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-beagle-dark mb-2">
                Property Management Company Name *
              </label>
              <input
                type="text"
                value={propertyManagementName}
                onChange={(e) => setPropertyManagementName(e.target.value)}
                placeholder="e.g., Acme Property Management"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beagle-orange focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed in the email footer.
              </p>
            </div>

            {/* Partner Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-beagle-dark mb-2">
                Partner Logo (Optional)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Upload your company logo to display alongside Beagle logo in emails.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePartnerLogoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-beagle-orange hover:file:bg-orange-100"
              />
              {partnerLogoUrl && (
                <div className="mt-3 p-3 bg-beagle-light rounded border">
                  <p className="text-xs text-gray-600 mb-2 font-semibold">Preview:</p>
                  <img
                    src={partnerLogoUrl}
                    alt="Partner Logo"
                    style={{ maxHeight: '60px', maxWidth: '200px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-green-600 mt-2">✓ Uploaded</p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="p-0 bg-white rounded-lg border border-gray-300 overflow-hidden">
              <p className="text-xs text-gray-600 px-4 pt-4 pb-2 font-semibold">
                EMAIL PREVIEW:
              </p>
              {/* Email Container */}
              <div className="mx-4 mb-4 bg-white border-2 border-beagle-orange rounded-lg overflow-hidden shadow-sm">
                {/* Header with Logos */}
                <div className="bg-beagle-light px-6 py-4 text-center border-b-2 border-beagle-orange">
                  <div className="flex items-center justify-center gap-4">
                    <img 
                      src="/images/beagle-logo.png" 
                      alt="Beagle Logo" 
                      style={{ height: '40px', display: 'inline-block' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {partnerLogoUrl && (
                      <>
                        <div className="text-gray-400">|</div>
                        <img 
                          src={partnerLogoUrl} 
                          alt="Partner Logo" 
                          style={{ height: '40px', display: 'inline-block' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Email Content */}
                <div className="px-6 py-6 space-y-4">
                  <p className="text-sm font-semibold text-beagle-dark">
                    Hi [Tenant Name],
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {customMessage || '[Your message]'}
                  </p>
                  <div className="pt-2">
                    <div className="inline-block bg-beagle-orange text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-opacity-90">
                      {linkText || 'Get Renters Insurance'}
                    </div>
                  </div>
                  {linkUrl && (
                    <p className="text-xs text-gray-500 pt-2">
                      Or visit: <span className="text-beagle-orange font-medium break-all">{linkUrl}</span>
                    </p>
                  )}

                  {/* Email Signature */}
                  <p className="text-sm text-beagle-dark pt-6 text-left">
                    Sincerely,<br/>
                    <span className="font-semibold">{propertyManagementName || 'Your Property Manager'}</span>
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-6 text-center bg-beagle-light">
                  <img 
                    src="/images/beagledog.png" 
                    alt="Beagle Dog" 
                    style={{ height: '36px', display: 'inline-block', marginBottom: '12px' }}
                  />
                  <p className="text-xs font-semibold text-beagle-dark">
                    Beagle Labs, LLC
                  </p>
                  {propertyManagementName && (
                    <p className="text-xs text-beagle-orange font-semibold mt-2">
                      {propertyManagementName}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Questions? Reach out to Beagle customer support at jack@beagleforpm.com.
                  </p>
                </div>
              </div>

              {/* Subject Line */}
              <div className="px-4 pb-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Subject:</p>
                <p className="text-sm font-medium text-beagle-dark bg-beagle-light px-3 py-2 rounded">
                  {subject || '[Enter subject]'}
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Send */}
          {parseResult && parseResult.stats.validCount > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-semibold text-beagle-dark mb-4">
                3. Send Notice
              </h3>

              <button
                onClick={handleSendClick}
                disabled={!canSend || isSending}
                className="w-full bg-beagle-orange hover:bg-opacity-90 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                {isSending
                  ? 'Sending...'
                  : `Send to ${parseResult.stats.validCount} Tenant${
                      parseResult.stats.validCount !== 1 ? 's' : ''
                    }`}
              </button>

              {/* Results */}
              {sendResults && (
                <div className="mt-6 p-4 bg-beagle-light rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✓</span>
                    <span className="font-semibold text-lg text-beagle-dark">
                      Sent to {sendResults.successful} tenant
                      {sendResults.successful !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {sendResults.failed > 0 && (
                    <div className="text-red-600 text-sm">
                      {sendResults.failed} failed
                      <button
                        onClick={() => setShowErrors(!showErrors)}
                        className="ml-2 underline hover:no-underline"
                      >
                        {showErrors ? 'Hide' : 'Show'} errors
                      </button>

                      {showErrors && (
                        <div className="mt-2 text-xs bg-red-50 p-3 rounded max-h-48 overflow-y-auto space-y-1">
                          {sendResults.results
                            .filter((r) => !r.success)
                            .map((result, idx) => (
                              <div key={idx} className="text-red-700">
                                <strong>{result.tenant}</strong> ({result.email}):
                                {result.error}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && parseResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-beagle-dark mb-4">
                Confirm Campaign
              </h2>
              <div className="space-y-3 mb-6 text-sm text-beagle-dark">
                <p>
                  <span className="font-semibold">Recipients:</span>{' '}
                  {parseResult.stats.validCount}
                </p>
                <p>
                  <span className="font-semibold">Subject:</span> {subject}
                </p>
                <p className="mt-4 text-red-600 font-semibold">
                  This action cannot be undone. Proceed?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-beagle-dark font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedSend}
                  disabled={isSending}
                  className="flex-1 px-4 py-2 bg-beagle-orange text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
