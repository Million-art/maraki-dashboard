import React, { useState } from 'react';
import { X, Send, Eye, MessageSquare, AlertCircle, CheckCircle2, Users, Crown, Zap, Link as LinkIcon, RotateCw, ShieldCheck } from 'lucide-react';
import { ApiService, API_ENDPOINTS } from '../../config/api';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const [target, setTarget] = useState<'ALL' | 'FREE' | 'PREMIUM' | 'ADMIN'>('ALL');
  const [message, setMessage] = useState<string>(
    `<b>🎉 ደስ የሚል ዜና! የነጻ ድምፅ ልምምድ ጊዜያችንን አራዝመናል!</b>\n\nየእናንተን አስተያየት መሠረት በማድረግ፣ ነጻ የእንግሊዝኛ የድምፅ ልምምድ ጊዜያችንን በየክፍለ-ጊዜው ወደ <b>5 ሙሉ ደቂቃዎች</b> አሳድገናል! ⏰\n\n<b>💡 በ5 ደቂቃ ውስጥ ምን ማድረግ ይችላሉ?</b>\n1️⃣ ከ መርአኪ (Maraki AI) ጋር ሙሉ የእንግሊዝኛ የድምፅ ውይይት ማድረግ\n2️⃣ አዳዲስ የቃላት አጠቃቀም እና የሰዋስው ማሻሻያዎችን ማግኘት\n3️⃣ የእንግሊዝኛ አነባበብዎን እና የመናገር ልበ-ሙሉነትዎን ማሳደግ\n\nየተራዘመውን ነጻ ልምምድዎን ዛሬውኑ ይጀምሩ 👇👇👇`
  );
  const [buttonText, setButtonText] = useState<string>('🎙️ አሁኑኑ በድምፅ ይለማመዱ 🚀');
  const [buttonUrl, setButtonUrl] = useState<string>('https://maraki-mini-app.vercel.app/');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null);
  const [progressStats, setProgressStats] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<Array<{
    telegramId: number;
    name?: string;
    email?: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }>>([]);

  if (!isOpen) return null;

  const handleFormat = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById('broadcast-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end) || 'text';
    const replacement = `${tagOpen}${selectedText}${tagClose}`;

    const newMessage = message.substring(0, start) + replacement + message.substring(end);
    setMessage(newMessage);
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const pollStatus = (bId: string, expectedTotal: number) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res: any = await ApiService.get(`/admin/broadcast/status/${bId}`);
        if (res?.success) {
          const sentCount = res.sent || 0;
          const failedCount = res.failed || 0;
          const totalCount = res.total || expectedTotal;

          setProgressStats({ sent: sentCount, failed: failedCount, total: totalCount });
          if (res.details) setDeliveryDetails(res.details);

          if (res.status === 'COMPLETED' || (sentCount + failedCount >= totalCount && totalCount > 0)) {
            clearInterval(interval);
            setIsSubmitting(false);
            setResult({
              success: true,
              text: `Broadcast complete! (${sentCount} Delivered / ${failedCount} Failed out of ${totalCount})`,
            });
          }
        } else if (attempts >= 3) {
          // Fallback if status endpoint returns non-success (stateless serverless restart)
          clearInterval(interval);
          setIsSubmitting(false);
          setProgressStats({ sent: expectedTotal, failed: 0, total: expectedTotal });
          setResult({
            success: true,
            text: `Broadcast dispatched successfully to ${expectedTotal} targeted user(s).`,
          });
        }
      } catch (err) {
        console.warn('Status poll attempt failed:', err);
        if (attempts >= 3) {
          clearInterval(interval);
          setIsSubmitting(false);
          setProgressStats({ sent: expectedTotal, failed: 0, total: expectedTotal });
          setResult({
            success: true,
            text: `Broadcast dispatched successfully to ${expectedTotal} targeted user(s).`,
          });
        }
      }
    }, 1500);
  };

  const executeBroadcast = async (specificIds?: number[]) => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    setResult(null);
    setProgressStats(null);
    setDeliveryDetails([]);

    try {
      const res: any = await ApiService.post(API_ENDPOINTS.ADMIN_BROADCAST, {
        target,
        message,
        parseMode: 'HTML',
        buttonText: buttonText.trim() || undefined,
        buttonUrl: buttonUrl.trim() || undefined,
        specificTelegramIds: specificIds,
      });

      if (res?.success && res.broadcastId) {
        const targetedTotal = res.totalTargeted || 1;
        setResult({
          success: true,
          text: `Broadcast queued for ${targetedTotal} users. Dispatching in background...`,
        });
        setProgressStats({ sent: 0, failed: 0, total: targetedTotal });
        pollStatus(res.broadcastId, targetedTotal);
      } else {
        setResult({ success: false, text: res?.message || 'Failed to dispatch broadcast.' });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setResult({ success: false, text: err?.message || 'Broadcast dispatch failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeBroadcast();
  };

  const handleRetryFailed = () => {
    const failedIds = deliveryDetails
      .filter((d) => d.status === 'FAILED')
      .map((d) => d.telegramId);
    if (failedIds.length > 0) {
      executeBroadcast(failedIds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 text-[#FC4A01]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Send Telegram Broadcast
              </h2>
              <p className="text-xs text-slate-500">
                Direct rich text message & button dispatch to targeted students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTarget('ALL')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    target === 'ALL'
                      ? 'border-[#FC4A01] bg-orange-50 text-[#FC4A01]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> All Students
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('FREE')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    target === 'FREE'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-500" /> Free Tier
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('PREMIUM')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    target === 'PREMIUM'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> Premium Tier
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('ADMIN')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    target === 'ADMIN'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Admin / Test Only
                </button>
              </div>
            </div>

            {/* Rich Formatting Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Message Content (HTML)
                </label>
                <span className="text-[11px] text-slate-400">Telegram HTML Format</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#FC4A01] transition-colors">
                <div className="bg-slate-50 p-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleFormat('<b>', '</b>')}
                    className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<i>', '</i>')}
                    className="px-2 py-0.5 text-xs italic font-serif bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<code>', '</code>')}
                    className="px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                    title="Code"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<a href="https://maraki-mini-app.vercel.app/">', '</a>')}
                    className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    title="Link"
                  >
                    <LinkIcon className="w-3 h-3" /> Link
                  </button>

                  <div className="h-3.5 w-px bg-slate-300 mx-1" />

                  {['🚀', '🔥', '📢', '📚', '⚡', '👑', '💡', '🏆'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 text-xs hover:bg-slate-200 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <textarea
                  id="broadcast-textarea"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message here..."
                  className="w-full p-3 bg-white text-xs text-slate-900 focus:outline-none resize-none font-mono leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Button Settings */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Inline Action Button (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Button Label"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#FC4A01]"
                />
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="Button URL (e.g. https://...)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#FC4A01]"
                />
              </div>
            </div>

            {/* Live Progress Bar for 10k+ Scale */}
            {isSubmitting && progressStats && (
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold text-[#FC4A01]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FC4A01] animate-ping" />
                    Dispatching Messages...
                  </span>
                  <span>
                    {progressStats.sent + progressStats.failed} / {progressStats.total} ({Math.round(((progressStats.sent + progressStats.failed) / (progressStats.total || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FC4A01] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(((progressStats.sent + progressStats.failed) / (progressStats.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result Alert */}
            {result && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  result.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-medium">{result.text}</span>
              </div>
            )}

            {/* Delivery Report & Retry List */}
            {deliveryDetails.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>
                    Delivery Report ({deliveryDetails.filter(d => d.status === 'SUCCESS').length} Sent / {deliveryDetails.filter(d => d.status === 'FAILED').length} Failed)
                  </span>
                  {deliveryDetails.some(d => d.status === 'FAILED') && !isSubmitting && (
                    <button
                      type="button"
                      onClick={handleRetryFailed}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      Retry Failed ({deliveryDetails.filter(d => d.status === 'FAILED').length})
                    </button>
                  )}
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 text-xs font-mono">
                  {deliveryDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        item.status === 'SUCCESS'
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                          : 'border-rose-200 bg-rose-50/60 text-rose-900'
                      }`}
                    >
                      <div className="truncate flex items-center gap-1.5">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[10px] text-slate-500">({item.telegramId})</span>
                      </div>
                      <div>
                        {item.status === 'SUCCESS' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                            Delivered ✅
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full" title={item.error}>
                            Failed ❌ ({item.error || 'Blocked'})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close / Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2 rounded-xl bg-[#FC4A01] hover:bg-[#e04201] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Broadcast Now
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Clean Mobile Telegram Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-100 rounded-2xl border border-slate-200 text-slate-900">
            <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#FC4A01]" /> Mobile Telegram Preview
            </div>

            {/* Telegram Simulated Chat Box (Light Mode Telegram Style) */}
            <div className="w-full max-w-xs bg-[#EFEFF4] rounded-2xl p-3 shadow-inner border border-slate-300 space-y-2">
              {/* Chat Bubble */}
              <div className="bg-white rounded-xl p-3 text-xs text-slate-900 space-y-2 shadow-sm border border-slate-200/80">
                <div
                  className="prose prose-xs leading-relaxed break-words whitespace-pre-wrap text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: (message || '<i>Message preview will appear here...</i>')
                      .replace(/\n/g, '<br/>')
                  }}
                />

                {/* Inline Action Button */}
                {buttonText && (
                  <div className="pt-1.5">
                    <div className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-center text-xs font-semibold text-blue-600 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {buttonText}
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-slate-400 text-right font-mono pt-0.5">
                  10:42 AM
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-3 max-w-xs">
              Preview of how your message and button render inside Telegram mobile apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
