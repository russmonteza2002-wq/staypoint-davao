import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, User, ShieldCheck } from 'lucide-react';
import { InquiryService } from '../../services/inquiryService';
import { Inquiry } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const TrackInquiryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Only reference code is needed — no access token required
  const [refCodeInput, setRefCodeInput] = useState(searchParams.get('code') || '');
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchThread = async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await InquiryService.trackInquiry(code);
      setInquiry(res.data);
    } catch (error: any) {
      showToast('error', 'Not Found', error.response?.data?.message || 'Invalid reference code');
      setInquiry(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load when arriving from Gmail email link
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) fetchThread(code);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCodeInput) return;
    fetchThread(refCodeInput.trim().toUpperCase());
  };

  const handleSendUserReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      await InquiryService.addUserReply(inquiry.referenceCode, replyMessage.trim());
      showToast('success', 'Reply Sent!', 'Your follow-up message has been posted to the manager.');
      setReplyMessage('');
      fetchThread(inquiry.referenceCode);
    } catch (error: any) {
      showToast('error', 'Reply Failed', error.response?.data?.message || 'Could not send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
          Inquiry Thread
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">Track Your Inquiry</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Enter your unique reference code (e.g. INQ-98A2F) to view manager replies and send a follow-up message.
        </p>
      </div>

      {/* Code Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <Input
            label="Your Inquiry Reference Code"
            placeholder="e.g. INQ-98A2F"
            value={refCodeInput}
            onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Find My Inquiry Thread
          </Button>
        </form>
      </div>

      {/* Inquiry Thread */}
      {inquiry && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xl font-extrabold text-brand-600">
                  {inquiry.referenceCode}
                </span>
                <Badge status={inquiry.status} />
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {new Date(inquiry.createdAt).toLocaleDateString()} by{' '}
                <strong className="text-slate-800">{inquiry.userName}</strong>
              </p>
            </div>
            {inquiry.room && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-slate-500 block font-semibold">Related Room:</span>
                <span className="font-bold text-slate-900">{inquiry.room.title}</span>
              </div>
            )}
          </div>

          {/* Conversation Messages */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            {inquiry.replies?.map((msg) => {
              const isAdmin = msg.senderType === 'ADMIN';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="font-bold text-slate-800">{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <div
                    className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
                        ? 'bg-slate-900 text-white rounded-tl-none shadow-md'
                        : 'bg-brand-600 text-white rounded-tr-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Follow-up Reply Form — no token needed */}
          <form onSubmit={handleSendUserReply} className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              Send a Follow-Up Message
            </label>
            <textarea
              rows={3}
              placeholder="Type your follow-up message here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm text-slate-900 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Button
              type="submit"
              isLoading={isSendingReply}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Post Follow-Up Reply
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
