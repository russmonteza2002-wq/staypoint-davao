import React, { useEffect, useState } from 'react';
import { RoomService } from '../../services/roomService';
import { Room, Amenity } from '../../types';
import { RoomCard } from '../../components/rooms/RoomCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Filter, SlidersHorizontal, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selectedAmenity) params.amenityId = selectedAmenity;

      const res = await RoomService.getRooms(params);
      setRooms(res.data);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter, selectedAmenity]);

  useEffect(() => {
    const fetchAmenityList = async () => {
      try {
        const res = await RoomService.getAmenities();
        setAmenities(res.data);
      } catch (error) {}
    };
    fetchAmenityList();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenity('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header Title */}
      <div className="space-y-3 border-b border-slate-200 pb-6 sm:pb-8">
        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
          Apartment Inventory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Available Room Units</h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Browse our selection of fully-furnished studio units, executive suites, and standard rooms in Staypoint Davao.
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm font-bold text-slate-900 text-sm"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter & Sort Options
          </span>
          {isMobileFilterOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar / Mobile Collapsible Container */}
        <div
          className={`lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit ${
            isMobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-600" /> Filter Rooms
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Availability Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Monthly Price Range (₱)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min ₱"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                placeholder="Max ₱"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Amenity Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Feature & Amenity
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Any Amenity</option>
              {amenities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => {
              fetchRooms();
              setIsMobileFilterOpen(false);
            }}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>

        {/* Right Room Grid & Search */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search room title, unit number, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
              Search
            </Button>
          </form>

          {/* Rooms Grid Result */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((i) => (
                <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <Filter className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800">No Rooms Found</h3>
              <p className="text-sm text-slate-500">
                No apartment rooms match your current search and filter criteria. Try adjusting the price range or status.
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
