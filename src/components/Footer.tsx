import React from 'react';
import { ShieldCheck, Globe, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenReport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenReport }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#008751] to-[#006038] flex items-center justify-center text-white font-black text-lg">
                N
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Naija<span className="text-[#008751]">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Buy. Connect. Chat. Do Business. Grow Worldwide. The trusted marketplace, social network, and business connect platform connecting Nigeria with the global diaspora.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span className="flex items-center gap-1.5 text-[#008751]">
                <ShieldCheck className="w-4 h-4" />
                Verified Merchant Standards
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Globe className="w-4 h-4" />
                Nigeria · Global Diaspora
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">NaijaMarket</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab('marketplace')} className="hover:text-[#008751]">
                  Phones & Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('marketplace')} className="hover:text-[#008751]">
                  Fashion & Couture
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('marketplace')} className="hover:text-[#008751]">
                  Home Appliances & Solar
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('marketplace')} className="hover:text-[#008751]">
                  Food & Agricultural Export
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('marketplace')} className="hover:text-[#008751]">
                  Vehicles & Parts
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Services & Connect</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-[#008751]">
                  Find Verified Artisans
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-[#008751]">
                  Career & Job Openings
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('chat')} className="hover:text-[#008751]">
                  Worldwide Business Rooms
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('connect')} className="hover:text-[#008751]">
                  Social Feed & Networking
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-[#008751]">
                  Post a Job Listing
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Safety & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-700">Scam Prevention Handbook</span>
              </li>
              <li>
                <span className="text-slate-700">Buyer Protection Policy</span>
              </li>
              <li>
                <span className="text-slate-700">Community Standards</span>
              </li>
              <li>
                <span className="text-slate-700">Privacy & Data Governance</span>
              </li>
              <li>
                <button
                  onClick={onOpenReport}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Report Suspicious Activity
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NaijaHub Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Security Centre</span>
            <span>Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
