import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Search, Eye } from 'lucide-react';
import { RoomService } from '../../services/roomService';
import { Room, RoomStatus } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';

export const AdminRoomsPage: React.FC = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await RoomService.getRooms({ search: searchQuery });
      setRooms(res.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchQuery]);

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await RoomService.updateRoomStatus(roomId, newStatus);
      showToast('success', 'Status Updated', `Room status changed to ${newStatus}`);
      fetchRooms();
    } catch (error: any) {
      showToast('error', 'Update Failed', error.response?.data?.message);
    }
  };

  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete ${title}? This action cannot be undone.`)) return;
    try {
      await RoomService.deleteRoom(roomId);
      showToast('success', 'Room Deleted', `${title} has been deleted`);
      fetchRooms();
    } catch (error: any) {
      showToast('error', 'Deletion Failed', error.response?.data?.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage Room Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Add, edit, upload photos, and update room availability</p>
        </div>
        <Link to="/admin/rooms/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Add New Room
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-3 max-w-md">
        <Input
          placeholder="Search room title or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          className="bg-white border-slate-300 text-slate-900 font-semibold placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
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
                  <th className="py-4 px-6">Unit #</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Monthly Rate</th>
                  <th className="py-4 px-6">Status Toggle</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-400">#{room.roomNumber}</td>
                    <td className="py-4 px-6 font-bold text-white">{room.title}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-400">
                      ₱{Number(room.pricePerMonth).toLocaleString()} / mo
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                        className="bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="OCCUPIED">OCCUPIED</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link to={`/rooms/${room.slug}`} target="_blank">
                        <button title="View Live Page" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteRoom(room.id, room.title)}
                        title="Delete Room"
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
