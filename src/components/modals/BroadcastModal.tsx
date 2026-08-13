import React, { useState } from 'react';
import { X, Send, Eye, MessageSquare, Sparkles, AlertCircle, CheckCircle2, Users, Crown, Zap, Link as LinkIcon } from 'lucide-react';
import { ApiService, API_ENDPOINTS } from '../../config/api';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const [target, setTarget] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');
  const [message, setMessage] = useState<string>(
    `<b>🚀 New Lesson Alert!</b>\n\nHi there! We just published a new interactive practice lesson on <i>Professional English</i>.\n\nPractice now to boost your fluency score today! 💡`
  );
  const [buttonText, setButtonText] = useState<string>('Start Practice 🗣️');
  const [buttonUrl, setButtonUrl] = useState<string>('https://t.me/maraki_ai_bot/app');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res: any = await ApiService.post(API_ENDPOINTS.ADMIN_BROADCAST, {
        target,
        message,
        parseMode: 'HTML',
        buttonText: buttonText.trim() || undefined,
        buttonUrl: buttonUrl.trim() || undefined,
      });

      if (res?.success) {
        setResult({
          success: true,
          text: `Broadcast sent successfully! (Sent: ${res.sent || 0}, Target: ${res.totalTargeted || 0})`,
        });
        setTimeout(() => {
          setResult(null);
          onClose();
        }, 3000);
      } else {
        setResult({ success: false, text: res?.message || 'Failed to dispatch broadcast.' });
      }
    } catch (err: any) {
      setResult({ success: false, text: err?.message || 'Broadcast dispatch failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-[#FC4A01]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Telegram Rich Text Broadcast
                <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#FC4A01]/10 text-[#FC4A01] rounded-full">
                  Live Engine
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compose HTML formatted messages & interactive buttons for your students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTarget('ALL')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    target === 'ALL'
                      ? 'border-[#FC4A01] bg-[#FC4A01]/10 text-[#FC4A01] shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" /> All Students
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('FREE')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    target === 'FREE'
                      ? 'border-lime-500 bg-lime-500/10 text-lime-700 dark:text-lime-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Zap className="w-4 h-4 text-lime-500" /> Free Tier
                </button>
                <button
                  type="button"
                  onClick={() => setTarget('PREMIUM')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    target === 'PREMIUM'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-500" /> Premium Tier
                </button>
              </div>
            </div>

            {/* Rich Formatting Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Message Content (HTML Allowed)
                </label>
                <span className="text-[11px] text-gray-400">Telegram HTML Mode</span>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden focus-within:border-[#FC4A01] transition-colors">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-2 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFormat('<b>', '</b>')}
                    className="px-2.5 py-1 text-xs font-black bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<i>', '</i>')}
                    className="px-2.5 py-1 text-xs italic font-serif bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<code>', '</code>')}
                    className="px-2.5 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100"
                    title="Code snippet"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat('<a href="https://t.me/maraki_ai_bot">', '</a>')}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 flex items-center gap-1"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-3 h-3" /> Link
                  </button>

                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

                  {['🚀', '🔥', '📢', '📚', '⚡', '👑', '💡', '🏆'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
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
                  placeholder="Type your formatted message here..."
                  className="w-full p-3.5 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none resize-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Optional Button Settings */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FC4A01]" />
                Inline Action Button (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Button Text (e.g. Start Practice)"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#FC4A01]"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="URL (e.g. https://t.me/...)"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#FC4A01]"
                  />
                </div>
              </div>
            </div>

            {/* Result Alert */}
            {result && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-fadeIn ${
                  result.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                <span>{result.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-6 py-2.5 rounded-2xl bg-[#FC4A01] hover:bg-[#e04201] text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Broadcast...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Broadcast Now
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Mobile Preview Side */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 text-white relative">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#FC4A01]" /> Telegram Live Preview
            </div>

            {/* Simulated Phone Container */}
            <div className="w-full max-w-xs bg-[#0e1621] rounded-3xl p-4 shadow-2xl border border-slate-700/60 space-y-3 relative overflow-hidden">
              {/* Telegram App Header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-xs font-black text-white shadow-md">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">Maraki AI Bot</h4>
                  <span className="text-[10px] text-emerald-400">bot</span>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#182533] rounded-2xl p-3.5 text-xs text-slate-100 space-y-2 border border-slate-700/50 shadow-md">
                <div
                  className="prose prose-invert prose-xs leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: message || '<i>Message preview will appear here...</i>' }}
                />

                {/* Inline Action Button Preview */}
                {buttonText && (
                  <div className="pt-2">
                    <div className="w-full py-2 bg-[#2b5278] hover:bg-[#346290] text-center text-xs font-semibold text-sky-200 rounded-xl shadow-inner border border-sky-400/20 cursor-pointer flex items-center justify-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      {buttonText}
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-slate-400 text-right font-mono pt-1">
                  10:42 AM
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-4 max-w-xs">
              This preview simulates how your rich HTML text and inline action button will render on Telegram mobile clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
