import React, { useState } from 'react';
import { X, Send, AlertTriangle, FlaskConical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { surveyApi } from '../../services/api';

interface SurveyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SurveyBroadcastModal: React.FC<SurveyBroadcastModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testTelegramId, setTestTelegramId] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!testTelegramId.trim()) {
      setError('Please enter your Telegram ID first.');
      return;
    }
    setIsTesting(true);
    setError(null);
    setSuccess(null);
    try {
      await surveyApi.sendTestBroadcast(testTelegramId.trim());
      setSuccess(`✅ Test sent to Telegram ID ${testTelegramId}! Check your Telegram.`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send test');
    } finally {
      setIsTesting(false);
    }
  };

  const handleBroadcast = async () => {
    setIsSending(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await surveyApi.sendBroadcast();
      setSuccess(`🚀 Survey broadcast queued for ${data.targetCount || 'eligible'} users!`);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while sending the broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between bg-white px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Survey Broadcast</h3>
                <p className="text-sm text-gray-500">Send the Telegram survey to your users</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Test Mode Section */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Step 1 — Test First (Recommended)</h4>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Send the survey to your own Telegram to verify it works before broadcasting to all users.
                Find your Telegram ID using <span className="font-mono font-semibold">@userinfobot</span>.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Your Telegram ID (e.g. 123456789)"
                  value={testTelegramId}
                  onChange={(e) => setTestTelegramId(e.target.value)}
                  className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap",
                    isTesting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FlaskConical className="h-4 w-4" />
                  {isTesting ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Step 2 — Full Broadcast</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    This will send to <span className="font-semibold">all freemium Voice users</span> on Telegram immediately. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Error / Success messages */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              disabled={isSending || !!success}
              className={cn(
                "inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                (isSending || !!success) && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleBroadcast}
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Broadcasting...' : 'Broadcast to All Users'}
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBroadcastModal;

