import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Product, ServiceBooking, JobApplication } from '../types';
import {
  User,
  ShoppingBag,
  Calendar,
  Briefcase,
  ShieldCheck,
  Zap,
  Edit3,
  CheckCircle,
  Clock,
  MapPin,
  Trash2,
  Lock,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenPayment: (packageId: string, itemId?: string, title?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPayment,
  onOpenAuth,
  onNavigateTab,
}) => {
  const { user, updateProfile, formatPrice } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'settings'>('listings');

  // Listings
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  // Bookings
  const [myBookings, setMyBookings] = useState<ServiceBooking[]>([]);

  // Settings form
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setState(user.state || 'Lagos');
      setCity(user.city || '');
      setBusinessName(user.businessName || '');

      api.getProducts()
        .then((res) => {
          setMyProducts((res.products || []).filter((p: Product) => p.userId === user.id));
        })
        .catch(() => {});

      api.getMyBookings()
        .then((res) => {
          setMyBookings(res.bookings || []);
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Authentication Required</h3>
        <p className="text-xs text-slate-500">Log in to view your dashboard, manage products, and bookings.</p>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-5 py-2.5 text-xs font-bold text-white bg-[#008751] rounded-xl"
        >
          Log In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({
        fullName,
        bio,
        phone,
        state,
        city,
        businessName,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      setMyBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: status as any } : b))
      );
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.fullName}</h1>
              {user.isVerified && (
                <span className="text-xs font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              @{user.username} · {user.state}, {user.country}
            </p>
            {user.businessName && (
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {user.businessName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user.isVerified && (
            <button
              onClick={() => onOpenPayment('pkg_verified_badge', user.id, 'Verified Business Seal')}
              className="px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#008751]" />
              <span>Get Verified Merchant Badge</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('marketplace')}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-xs transition-colors"
          >
            Go to Marketplace
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'listings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Listings ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'bookings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bookings ({myBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Marketplace Inventory</h3>
            <span className="text-xs text-slate-500">Live products managed by your account</span>
          </div>

          {myProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You haven't listed any items for sale yet.</p>
              <button
                onClick={() => onNavigateTab('marketplace')}
                className="px-4 py-2 text-xs font-semibold text-[#008751] bg-[#008751]/10 rounded-xl"
              >
                Post an Item Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <img src={p.images[0]} alt="" className="w-full h-40 object-cover rounded-2xl" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">{p.category}</span>
                        <span className="text-xs font-bold text-[#008751] tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{p.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.views} views · {p.status}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenPayment('pkg_featured_product', p.id, p.title)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Promote</span>
                    </button>
                    <button
                      onClick={async () => {
                        await api.deleteProduct(p.id);
                        setMyProducts((prev) => prev.filter((item) => item.id !== p.id));
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Service Appointments & Bookings</h3>
            <span className="text-xs text-slate-500">Track and manage customer consultations</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No appointments or service requests yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200 overflow-hidden">
              {myBookings.map((b) => (
                <div key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{b.serviceTitle}</h4>
                      <span className="text-[10px] font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full uppercase">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Customer: <strong className="text-slate-800">{b.customerName}</strong> ({b.customerPhone}) · Scheduled: {b.scheduledDate}
                    </p>
                    {b.notes && <p className="text-xs text-slate-500 mt-1 italic">"{b.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'accepted')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Profile & Account Settings</h3>
            <p className="text-xs text-slate-500">Update your verified public display information.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Locality</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name (Optional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Biography</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
              />
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="py-2.5 px-6 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
