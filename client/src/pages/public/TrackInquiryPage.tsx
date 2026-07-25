import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MessageSquare, Send, Clock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { InquiryService } from '../../services/inquiryService';
import { Inquiry } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const TrackInquiryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [refCodeInput, setRefCodeInput] = useState(searchParams.get('code') || '');
  const [accessTokenInput, setAccessTokenInput] = useState(searchParams.get('token') || '');

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchThread = async (code: string, token?: string) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await InquiryService.trackInquiry(code, token);
      setInquiry(res.data);
    } catch (error: any) {
      showToast('error', 'Lookup Error', error.response?.data?.message || 'Invalid tracking code');
      setInquiry(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    if (code) {
      fetchThread(code, token || undefined);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCodeInput) return;
    fetchThread(refCodeInput.trim(), accessTokenInput.trim() || undefined);
  };

  const handleSendUserReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry || !replyMessage.trim()) return;

    if (!accessTokenInput) {
      showToast('warning', 'Access Token Required', 'Please enter your inquiry access token to post a reply.');
      return;
    }

    setIsSendingReply(true);
    try {
      await InquiryService.addUserReply(
        inquiry.referenceCode,
        accessTokenInput.trim(),
        replyMessage.trim()
      );

      showToast('success', 'Reply Sent!', 'Your message has been posted to the manager.');
      setReplyMessage('');
      fetchThread(inquiry.referenceCode, accessTokenInput.trim());
    } catch (error: any) {
      showToast('error', 'Reply Failed', error.response?.data?.message || 'Unauthorized reply attempt');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
          In-App Communication
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900">Track Inquiry & Replies</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Enter your unique reference code (e.g. INQ-98A2F) to view manager replies and continue messaging.
        </p>
      </div>

      {/* Code Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Reference Code"
              placeholder="e.g. INQ-98A2F"
              value={refCodeInput}
              onChange={(e) => setRefCodeInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Input
              label="Access Token (Optional for user reply)"
              type="password"
              placeholder="Paste access key..."
              value={accessTokenInput}
              onChange={(e) => setAccessTokenInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Find Inquiry Thread
          </Button>
        </form>
      </div>

      {/* Inquiry Thread Timeline Display */}
      {inquiry && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Header Summary */}
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
                <span className="text-slate-500 block font-semibold">Related Room Listing:</span>
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

          {/* Reply Form Box */}
          <form onSubmit={handleSendUserReply} className="space-y-3 pt-4 border-t border-slate-100">
            <textarea
              rows={3}
              placeholder="Type your reply message here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
