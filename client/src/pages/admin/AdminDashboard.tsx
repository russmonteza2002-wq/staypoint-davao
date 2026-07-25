import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { SiteService } from '../../services/siteService';
import { InquiryService } from '../../services/inquiryService';
import { DashboardStats, Inquiry } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, inqRes] = await Promise.all([
          SiteService.getDashboardStats(),
          InquiryService.getAdminInquiries({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentInquiries(inqRes.data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time status of rooms and inquiry leads</p>
        </div>
        <Link to="/admin/rooms/new">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/20">
            <PlusCircle className="w-4 h-4" /> Add New Room Listing
          </button>
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Rooms</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white block">{stats?.totalRooms || 0}</span>
        </div>

        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 block">{stats?.availableRooms || 0}</span>
        </div>

        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Reserved</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-400 block">{stats?.reservedRooms || 0}</span>
        </div>

        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">New Inquiries</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-sky-400 block">{stats?.newInquiries || 0}</span>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-extrabold text-white text-lg">Recent User Inquiries</h3>
          <Link to="/admin/inquiries" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View All Inquiries <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No recent inquiries.</p>
          ) : (
            recentInquiries.map((inq) => (
              <div key={inq.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-sm text-brand-400">{inq.referenceCode}</span>
                    <Badge status={inq.status} />
                  </div>
                  <p className="text-xs text-slate-300">
                    From <strong>{inq.userName}</strong> ({inq.userEmail})
                  </p>
                </div>
                <Link to="/admin/inquiries">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors">
                    Reply Thread
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
