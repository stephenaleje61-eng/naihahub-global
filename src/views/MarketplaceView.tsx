import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Product } from '../types';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Heart,
  Share2,
  AlertTriangle,
  MessageSquare,
  MapPin,
  CheckCircle,
  Tag,
  Sparkles,
  Zap,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

interface MarketplaceViewProps {
  onOpenProductDetail: (product: Product) => void;
  onStartChatWithSeller: (sellerId: string, product: Product) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenReport: (targetType: string, targetId: string, title: string) => void;
  onOpenPayment: (packageId: string, itemId: string, title: string) => void;
}

const CATEGORIES = [
  'All',
  'Phones & Tablets',
  'Fashion & Clothing',
  'Home Appliances',
  'Computers & Accessories',
  'Beauty & Personal Care',
  'Food & Groceries',
  'Vehicles & Auto Parts',
  'Solar & Clean Energy',
  'Books & Education',
  'Other Permitted Goods',
];

const NIGERIAN_STATES = [
  'All', 'Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Enugu', 'Anambra',
  'Delta', 'Kaduna', 'Ogun', 'Edo', 'Imo', 'Diaspora / International'
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onStartChatWithSeller,
  onOpenAuth,
  onOpenReport,
  onOpenPayment,
}) => {
  const { user, formatPrice } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'my_listings'>('all');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  // Create Listing Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Phones & Tablets');
  const [newPrice, setNewPrice] = useState('');
  const [newNegotiable, setNewNegotiable] = useState(true);
  const [newCondition, setNewCondition] = useState<'Brand New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair'>('Brand New');
  const [newState, setNewState] = useState('Lagos');
  const [newCity, setNewCity] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('/src/assets/images/market_gadgets_phones_1791791824779.jpg');

  const fetchProducts = () => {
    setLoading(true);
    const params: any = {
      q: searchQuery || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      state: selectedState !== 'All' ? selectedState : undefined,
      condition: selectedCondition !== 'All' ? selectedCondition : undefined,
      sort: sortBy,
    };
    api.getProducts(params)
      .then((res) => {
        let list: Product[] = res.products || [];
        if (activeTab === 'favorites') {
          list = list.filter((p) => p.isFavorited);
        } else if (activeTab === 'my_listings' && user) {
          list = list.filter((p) => p.userId === user.id);
        }
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedState, selectedCondition, sortBy, activeTab]);

  const handleToggleFavorite = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    try {
      const res = await api.toggleFavorite(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFavorited: res.favorited } : p))
      );
      if (selectedProduct && selectedProduct.id === product.id) {
        setSelectedProduct({ ...selectedProduct, isFavorited: res.favorited });
      }
    } catch (e) {}
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setIsSubmittingListing(true);
    try {
      await api.createProduct({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        price: Number(newPrice),
        isNegotiable: newNegotiable,
        condition: newCondition,
        state: newState,
        city: newCity || 'Lagos City',
        images: [newImageUrl],
      });
      setIsSellModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const handleDeleteListing = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteProduct(productId);
      setSelectedProduct(null);
      fetchProducts();
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Sell Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008751]">
              NaijaMarket
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Real Verified Buying & Selling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Browse Nigerian & Worldwide Products
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Prices in Naira (₦) with instant international currency conversions. Safe direct seller messaging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!user) onOpenAuth('login');
              else setIsSellModalOpen(true);
            }}
            className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-all hover:translate-y-[-1px] flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Listing</span>
          </button>
        </div>
      </div>

      {/* Tabs: All / Favourites / My Listings */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'all'
                ? 'text-[#008751] border-b-2 border-[#008751]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Products
          </button>

          {user && (
            <>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'favorites'
                    ? 'text-[#008751] border-b-2 border-[#008751]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Saved Favourites
              </button>
              <button
                onClick={() => setActiveTab('my_listings')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'my_listings'
                    ? 'text-[#008751] border-b-2 border-[#008751]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Listings
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search products, phones, fashion, inverters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
            />
          </div>

          {/* State Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white text-slate-700 font-medium"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  Location: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white text-slate-700 font-medium"
            >
              <option value="All">Condition: All</option>
              <option value="Brand New">Brand New</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used - Like New">Used - Like New</option>
              <option value="Used - Good">Used - Good</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white text-slate-700 font-medium"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Scroll Bar (Anti-Pill: Clean segmented buttons with active state) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isCatActive
                    ? 'bg-[#008751] text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#008751] animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading marketplace inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No products match the selected filters. Try clearing your search keyword or switching categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedState('All');
              setSelectedCondition('All');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#008751] bg-[#008751]/10 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="cursor-pointer bg-white rounded-3xl border border-slate-200 hover:border-[#008751]/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, prod)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors ${
                    prod.isFavorited
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-white/80 text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${prod.isFavorited ? 'fill-rose-600' : ''}`} />
                </button>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-md">
                  {prod.condition}
                </div>
                {prod.isFeatured && (
                  <div className="absolute bottom-3 left-3 bg-[#008751] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    {prod.category}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#008751] transition-colors line-clamp-2 mt-1">
                    {prod.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-base font-extrabold text-[#008751] tabular-nums">
                      {formatPrice(prod.price)}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{prod.city}, {prod.state}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-[#008751]">
                    View →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="relative h-72 sm:h-80 bg-slate-100">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {selectedProduct.condition}
                </span>
                <span className="bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {selectedProduct.isNegotiable ? 'Price Negotiable' : 'Fixed Price'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#008751]">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    {selectedProduct.title}
                  </h2>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedProduct.city}, {selectedProduct.state}, {selectedProduct.country}
                    </span>
                    <span>·</span>
                    <span>{selectedProduct.views} views</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#008751] tabular-nums">
                  {formatPrice(selectedProduct.price)}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Seller Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.sellerAvatar}
                    alt={selectedProduct.sellerName}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">
                        {selectedProduct.sellerName}
                      </h4>
                      <CheckCircle className="w-3.5 h-3.5 text-[#008751]" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Seller in {selectedProduct.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!user) {
                        onOpenAuth('login');
                      } else {
                        onStartChatWithSeller(selectedProduct.userId, selectedProduct);
                        setSelectedProduct(null);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Seller</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleFavorite(e, selectedProduct)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                  >
                    <Heart className={`w-3.5 h-3.5 ${selectedProduct.isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{selectedProduct.isFavorited ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Listing link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenReport('product', selectedProduct.id, selectedProduct.title);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-rose-600 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>

                {user && (user.id === selectedProduct.userId || user.role === 'admin') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPayment('pkg_featured_product', selectedProduct.id, selectedProduct.title)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Promote</span>
                    </button>
                    <button
                      onClick={() => handleDeleteListing(selectedProduct.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post a Listing Modal */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#008751]" />
                <h3 className="text-base font-bold text-slate-900">Post a Listing on NaijaMarket</h3>
              </div>
              <button
                onClick={() => setIsSellModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung Galaxy S24 Ultra 512GB Grey"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price in Naira (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 250000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNegotiable}
                      onChange={(e) => setNewNegotiable(e.target.checked)}
                      className="rounded text-[#008751] focus:ring-[#008751]"
                    />
                    <span>Negotiable Price</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white"
                  >
                    {NIGERIAN_STATES.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yaba, Alaba, Wuse"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Image Asset
                </label>
                <select
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751] bg-white"
                >
                  <option value="/src/assets/images/market_gadgets_phones_1791791824779.jpg">Electronics & Smartphones</option>
                  <option value="/src/assets/images/market_fashion_wear_1791791836844.jpg">Fashion & Tailored Couture</option>
                  <option value="/src/assets/images/service_pro_tech_1791791847514.jpg">Solar & Hardware Tech</option>
                  <option value="/src/assets/images/hero_naijahub_hub_1791791813531.jpg">General Commerce & Agro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the specifications, condition, warranty, and pickup/delivery options..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#008751]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingListing}
                className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmittingListing ? 'Publishing to NaijaMarket...' : 'Publish Product Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
