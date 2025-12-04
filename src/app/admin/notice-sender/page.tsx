'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAdminToken, clearAdminToken, isTokenExpired } from '@/lib/auth';
import { validateMessageLength } from '@/lib/sms-parser';

interface DailyCountResponse {
  success: boolean;
  totalMessagesSentToday?: number;
  successfulToday?: number;
  failedToday?: number;
  dailyLimit?: number;
  remainingQuota?: number;
  error?: string;
}

interface SendResult {
  phoneNumber: string;
  success: boolean;
  error?: string;
  sid?: string;
}

interface CsvRow {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export default function NoticeSenderPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [dailyCount, setDailyCount] = useState<DailyCountResponse | null>(null);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  // Fetch daily count on mount
  useEffect(() => {
    if (authenticated) {
      fetchDailyCount();
    }
  }, [authenticated]);

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login');
  };

  const fetchDailyCount = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('/api/admin/sms-campaigns/daily-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data: DailyCountResponse = await response.json();
      setDailyCount(data);
    } catch (err) {
      console.error('Failed to fetch daily count:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setCsvFile(file);

    try {
      const content = await file.text();
      // Simple CSV preview parsing
      const lines = content.split('\n').slice(0, 6); // First 5 rows + header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const preview: CsvRow[] = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        return {
          firstName: values[0] || '',
          lastName: values[1] || '',
          phoneNumber: values[2] || '',
        };
      });

      setCsvPreview(preview.filter((row) => row.firstName || row.lastName));
    } catch (err) {
      setError('Failed to read CSV file');
      setCsvFile(null);
    }
  };

  const handleSendClick = () => {
    setError('');

    // Validate inputs
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    if (!messageTemplate.trim()) {
      setError('Please enter a message');
      return;
    }

    // Check daily limit
    if (dailyCount && dailyCount.remainingQuota !== undefined) {
      if (csvPreview.length > dailyCount.remainingQuota) {
        setError(
          `Insufficient quota. You have ${dailyCount.remainingQuota} remaining today, but are trying to send to ${csvPreview.length} recipients.`
        );
        return;
      }
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSend = async () => {
    if (!csvFile) return;

    setSending(true);
    setShowConfirmation(false);
    setError('');

    try {
      const csvContent = await csvFile.text();
      const token = getAdminToken();

      const response = await fetch('/api/admin/sms-campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          csvContent,
          messageTemplate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to send campaign');
        return;
      }

      // Display results
      setSendResults(result.details || []);
      setShowResults(true);
      setSuccess(
        `Campaign sent! ${result.successful} successful, ${result.failed} failed.`
      );

      // Reset form
      setTimeout(() => {
        setCsvFile(null);
        setCsvPreview([]);
        setMessageTemplate('');
        setShowResults(false);
        setSuccess('');
        fetchDailyCount(); // Refresh quota
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const messageLength = validateMessageLength(messageTemplate);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex gap-8">
            <Link
              href="/admin/beagle-programs"
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 font-semibold hover:text-gray-900 hover:border-gray-300 transition"
            >
              Notices
            </Link>
            <Link
              href="/admin/notice-sender"
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-semibold"
            >
              Notice Sender
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Subheader */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Send SMS Campaign</h2>
            <p className="text-gray-600 mt-1">
              Send SMS messages to tenants via CSV upload
            </p>
          </div>

        {/* Daily Quota */}
        {dailyCount?.success && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-blue-900">Daily Quota</p>
                <p className="text-sm text-blue-700">
                  {dailyCount.totalMessagesSentToday} of {dailyCount.dailyLimit} sent
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {dailyCount.remainingQuota}
                </p>
                <p className="text-sm text-blue-700">remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Results Modal */}
        {showResults && sendResults.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Send Results</h3>
            <div className="space-y-2">
              {sendResults.map((result, idx) => (
                <div key={idx} className="text-sm p-3 bg-white rounded border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700 font-medium">{result.phoneNumber}</span>
                    {result.success ? (
                      <span className="text-green-600 font-semibold">✓ Sent (SID: {result.sid})</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Failed</span>
                    )}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* CSV Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CSV File
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Required columns: First Name, Last Name, Phone Number
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={sending}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {csvFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </div>

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Preview ({csvPreview.length} recipients)
                </p>
                <div className="overflow-x-auto">
                  <table className="text-sm w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-2 font-semibold text-gray-600">
                          First Name
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-600">
                          Last Name
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-600">
                          Phone Number
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-white">
                          <td className="py-2 px-2 text-gray-700">{row.firstName}</td>
                          <td className="py-2 px-2 text-gray-700">{row.lastName}</td>
                          <td className="py-2 px-2 text-gray-700">{row.phoneNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... and {csvPreview.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Message Template */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Message Template
                </label>
                <span className={`text-xs ${messageLength.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {messageLength.charCount} / 160 ({messageLength.segmentCount} SMS)
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Use {"{{firstName}}"}, {"{{lastName}}"}, or {"{{fullName}}"} to personalize
              </p>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                disabled={sending}
                placeholder="Hi {{firstName}}, please verify your renters insurance..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendClick}
              disabled={sending || !csvFile || !messageTemplate.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Campaign
              </h2>
              <div className="space-y-3 mb-6 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Recipients:</span> {csvPreview.length}
                </p>
                <p>
                  <span className="font-semibold">Message:</span> {messageLength.charCount} characters
                </p>
                <p className="mt-4 text-red-600 font-semibold">
                  This action cannot be undone. Proceed?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedSend}
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

