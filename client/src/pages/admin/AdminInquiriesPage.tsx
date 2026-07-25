import React, { useEffect, useState } from 'react';
import { InquiryService } from '../../services/inquiryService';
import { Inquiry, InquiryStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Send, Search, User, ShieldCheck } from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updateStatusTo, setUpdateStatusTo] = useState<InquiryStatus>('REPLIED');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await InquiryService.getAdminInquiries({ status: statusFilter });
      setInquiries(res.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleOpenDrawer = async (id: string) => {
    try {
      const res = await InquiryService.getInquiryDetailsAdmin(id);
      setSelectedInquiry(res.data);
    } catch (error) {
      showToast('error', 'Error fetching thread details');
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;

    setIsSendingReply(true);
    try {
      await InquiryService.adminReply(selectedInquiry.id, replyMessage.trim(), updateStatusTo);
      showToast('success', 'Reply Sent!', 'Admin reply saved and user thread updated');
      setReplyMessage('');

      // Refresh drawer & master table
      handleOpenDrawer(selectedInquiry.id);
      fetchInquiries();
    } catch (error: any) {
      showToast('error', 'Reply Failed', error.response?.data?.message);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Inquiry Lead Drawer</h1>
          <p className="text-sm text-slate-400 mt-1">Review tenant inquiries and reply directly inside website database</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['', 'NEW', 'REPLIED', 'VIEWING_SCHEDULED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st === '' ? 'ALL INQUIRIES' : st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Inquiries Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Reference Code</th>
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Email / Phone</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-400">{inq.referenceCode}</td>
                    <td className="py-4 px-6 font-bold text-white">{inq.userName}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <div>{inq.userEmail}</div>
                      <div>{inq.userPhone || 'No Phone'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={inq.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleOpenDrawer(inq.id)}>
                        Open Thread
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Thread Modal / Drawer */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry ${selectedInquiry.referenceCode}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* User Meta Card */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 grid grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-500 block">User Name:</span>
                <span className="font-extrabold text-sm text-slate-900">{selectedInquiry.userName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Email Address:</span>
                <span className="font-semibold text-slate-900">{selectedInquiry.userEmail}</span>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
              {selectedInquiry.replies?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-slate-900 text-white ml-auto max-w-md'
                      : 'bg-white text-slate-900 border border-slate-200 mr-auto max-w-md shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold opacity-75 mb-1">
                    <span>{msg.senderName}</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Admin Reply Form */}
            <form onSubmit={handleSendAdminReply} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Type Manager Response:
                </label>
                <select
                  value={updateStatusTo}
                  onChange={(e) => setUpdateStatusTo(e.target.value as InquiryStatus)}
                  className="text-xs font-bold border border-slate-300 rounded-lg p-1.5 bg-white"
                >
                  <option value="REPLIED">Set Status: REPLIED</option>
                  <option value="VIEWING_SCHEDULED">Set Status: VIEWING SCHEDULED</option>
                  <option value="CLOSED">Set Status: CLOSED</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="Write reply message..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-none"
              />

              <Button type="submit" isLoading={isSendingReply} leftIcon={<Send className="w-4 h-4" />}>
                Send Response to User Thread
              </Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
