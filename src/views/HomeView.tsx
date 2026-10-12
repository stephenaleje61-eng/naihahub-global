import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Product, Job, LocalService, ChatRoom, Post } from '../types';
import {
  ShoppingBag,
  Users,
  Briefcase,
  Wrench,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface HomeViewProps {
  onSelectTab: (tab: string) => void;
  onOpenProduct: (product: Product) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenChatRoom: (room: ChatRoom) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onOpenProduct,
  onOpenAuth,
  onOpenChatRoom,
}) => {
  const { user, formatPrice } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [serviceProviders, setServiceProviders] = useState<LocalService[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Fetch home data from persistent backend
    api.getProducts({ featured: 'true' })
      .then((res) => setFeaturedProducts((res.products || []).slice(0, 4)))
      .catch(() => {});

    api.getJobs()
      .then((res) => setRecentJobs((res.jobs || []).slice(0, 3)))
      .catch(() => {});

    api.getProviders()
      .then((res) => setServiceProviders((res.services || []).slice(0, 3)))
      .catch(() => {});

    api.getRooms()
      .then((res) => setChatRooms((res.rooms || []).slice(0, 4)))
      .catch(() => {});

    api.getPosts()
      .then((res) => setRecentPosts((res.posts || []).slice(0, 2)))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#008751] bg-[#008751]/10 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#008751]" />
                <span>The Nigerian & Worldwide Commerce Ecosystem</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Everything Nigeria Needs, <span className="text-[#008751]">All in One Place.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Buy and sell products, meet people, find opportunities, chat in global business rooms, and connect with trusted local service providers worldwide.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTab('marketplace')}
                  className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-all hover:translate-y-[-1px] flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Marketplace</span>
                </button>

                <button
                  onClick={() => onSelectTab('chat')}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition-all hover:translate-y-[-1px] flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#008751]" />
                  <span>Business Chat Rooms</span>
                </button>

                <button
                  onClick={() => onSelectTab('services')}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition-all hover:translate-y-[-1px] flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-[#008751]" />
                  <span>Jobs & Services</span>
                </button>

                {!user && (
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-5 py-3 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all"
                  >
                    Join NaijaHub
                  </button>
                )}
              </div>

              {/* Trust markers */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-slate-500 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#008751]" />
                  <span>Verified Nigerian Merchants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#008751]" />
                  <span>Protected Direct Messaging</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#008751]" />
                  <span>Real Local & Diaspora Commerce</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_naijahub_hub_1791791813531.jpg"
                  alt="Modern African commerce and tech collaboration"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Lagos · Abuja · London · Worldwide
                  </span>
                  <h3 className="text-xl font-bold mt-1 text-white">
                    Uniting Nigerian Commerce & Innovation
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    Connecting local artisans, traders, developers, and global diaspora networks under one trusted platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS MODULE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onSelectTab('marketplace')}
            className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#008751]/50 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#008751] transition-colors">
              NaijaMarket
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Buy and sell electronics, fashion, solar power equipment, food export items, and vehicles. Connect securely with Nigerian sellers.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#008751]">
              <span>Browse Products</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectTab('connect')}
            className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#008751]/50 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#008751] transition-colors">
              NaijaConnect
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Meet Nigerians across all 36 states and the global diaspora. Share posts, expand your business network, and send friend requests.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#008751]">
              <span>Join Community</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectTab('services')}
            className="cursor-pointer bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#008751]/50 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#008751] transition-colors">
              NaijaServices & Jobs
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Find verified jobs with disclosed salaries or hire skilled artisans like solar technicians, electricians, tailors, and caterers.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#008751]">
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. NAIJAHUB BUSINESS CONNECT: PUBLIC ROOMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>NaijaHub Business Connect</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Global Public Discussion Rooms
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                Join live business rooms to discuss trade, jobs, investments, and technology in real time with Nigerian and international participants.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('chat')}
              className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap self-start md:self-auto"
            >
              Enter Business Chat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onOpenChatRoom(room)}
                className="cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 p-4 rounded-2xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {room.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {room.memberCount} members
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {room.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                  <span className="text-[11px] font-medium">Join Discussion</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED MARKETPLACE DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#008751]">
              Verified Listings
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <button
            onClick={() => onSelectTab('marketplace')}
            className="text-xs font-semibold text-[#008751] hover:text-[#006038] flex items-center gap-1"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onOpenProduct(prod)}
              className="cursor-pointer bg-white rounded-3xl border border-slate-200 hover:border-[#008751]/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-md">
                  {prod.condition}
                </div>
                {prod.isFeatured && (
                  <div className="absolute top-3 right-3 bg-[#008751] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
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
                    Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. JOBS & SERVICE PROVIDERS SPLIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#008751]">
                    NaijaServices
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Career & Job Openings</h3>
                </div>
                <button
                  onClick={() => onSelectTab('services')}
                  className="text-xs font-semibold text-[#008751]"
                >
                  View All Jobs
                </button>
              </div>

              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectTab('services')}
                    className="cursor-pointer p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {job.employerName} · {job.location}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {job.employmentType}
                      </span>
                    </div>
                    {job.salaryMin && (
                      <div className="text-xs font-bold text-slate-800 mt-2 tabular-nums">
                        ₦{job.salaryMin.toLocaleString()} - ₦{job.salaryMax?.toLocaleString()} / month
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Employers post jobs directly</span>
              <button
                onClick={() => onSelectTab('services')}
                className="text-xs font-bold text-[#008751] hover:underline"
              >
                Apply or Post a Role →
              </button>
            </div>
          </div>

          {/* Local Service Providers */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#008751]">
                    Verified Artisans
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Local Service Providers</h3>
                </div>
                <button
                  onClick={() => onSelectTab('services')}
                  className="text-xs font-semibold text-[#008751]"
                >
                  Find Artisans
                </button>
              </div>

              <div className="space-y-3">
                {serviceProviders.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => onSelectTab('services')}
                    className="cursor-pointer p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors flex items-center gap-3"
                  >
                    <img
                      src={srv.providerAvatar}
                      alt={srv.providerName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {srv.title}
                        </h4>
                        {srv.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {srv.providerName} · {srv.serviceArea}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#008751] tabular-nums">
                        From {formatPrice(srv.startingPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ★ {srv.rating} ({srv.reviewCount})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Solar, Tailoring, Repairs & Electrical</span>
              <button
                onClick={() => onSelectTab('services')}
                className="text-xs font-bold text-[#008751] hover:underline"
              >
                Hire Trusted Artisan →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
