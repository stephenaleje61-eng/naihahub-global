import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { PaymentModal } from './components/PaymentModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './views/HomeView';
import { MarketplaceView } from './views/MarketplaceView';
import { ConnectView } from './views/ConnectView';
import { ServicesView } from './views/ServicesView';
import { ChatView } from './views/ChatView';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { Product, ChatRoom } from './types';
import {
  Home,
  ShoppingBag,
  Users,
  Briefcase,
  MessageSquare,
  User as UserIcon,
  WifiOff,
} from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<{ type: string; id: string; title: string }>({
    type: 'product',
    id: '',
    title: '',
  });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    packageId: string;
    itemId?: string;
    title?: string;
  }>({
    packageId: 'pkg_featured_product',
  });

  // Chat targets
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | undefined>(undefined);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  // Offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenReport = (type: string, id: string, title: string) => {
    setReportData({ type, id, title });
    setIsReportOpen(true);
  };

  const handleOpenPayment = (packageId: string, itemId?: string, title?: string) => {
    setPaymentData({ packageId, itemId, title });
    setIsPaymentOpen(true);
  };

  const handleStartChatWithSeller = async (sellerId: string, product: Product) => {
    try {
      const { api } = await import('./lib/api');
      const res = await api.startConversation({
        recipientId: sellerId,
        relatedItemId: product.id,
        relatedItemType: 'product',
        relatedItemTitle: product.title,
        initialMessage: `Hi, I am interested in purchasing your listing "${product.title}". Is it still available?`,
      });
      setActiveConversationId(res.conversation.id);
      setCurrentTab('chat');
    } catch (e) {
      setCurrentTab('chat');
    }
  };

  const handleStartDirectMessage = async (targetUserId: string) => {
    try {
      const { api } = await import('./lib/api');
      const res = await api.startConversation({
        recipientId: targetUserId,
        initialMessage: 'Hello, let us connect on NaijaHub!',
      });
      setActiveConversationId(res.conversation.id);
      setCurrentTab('chat');
    } catch (e) {
      setCurrentTab('chat');
    }
  };

  const handleSelectSearchResult = (type: string, id: string) => {
    if (type === 'product') {
      setCurrentTab('marketplace');
    } else if (type === 'user') {
      setCurrentTab('connect');
    } else if (type === 'job' || type === 'service') {
      setCurrentTab('services');
    } else if (type === 'room') {
      setActiveChatRoomId(id);
      setCurrentTab('chat');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F6]">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. NaijaHub cached content is active.</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentTab === 'home' && (
          <HomeView
            onSelectTab={setCurrentTab}
            onOpenProduct={(prod) => {
              setCurrentTab('marketplace');
            }}
            onOpenAuth={handleOpenAuth}
            onOpenChatRoom={(room) => {
              setActiveChatRoomId(room.id);
              setCurrentTab('chat');
            }}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplaceView
            onOpenProductDetail={(prod) => {}}
            onStartChatWithSeller={handleStartChatWithSeller}
            onOpenAuth={handleOpenAuth}
            onOpenReport={(type, id, title) => handleOpenReport(type, id, title)}
            onOpenPayment={handleOpenPayment}
          />
        )}

        {currentTab === 'connect' && (
          <ConnectView
            onOpenAuth={handleOpenAuth}
            onStartDirectMessage={handleStartDirectMessage}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView
            onOpenAuth={handleOpenAuth}
            onOpenReport={(type, id, title) => handleOpenReport(type, id, title)}
            onOpenPayment={handleOpenPayment}
          />
        )}

        {currentTab === 'chat' && (
          <ChatView
            initialRoomId={activeChatRoomId}
            initialConversationId={activeConversationId}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenPayment={handleOpenPayment}
            onOpenAuth={handleOpenAuth}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'home' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('marketplace')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'marketplace' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Market</span>
        </button>

        <button
          onClick={() => setCurrentTab('connect')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'connect' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Connect</span>
        </button>

        <button
          onClick={() => setCurrentTab('services')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'services' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Services</span>
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'chat' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => {
            if (!user) handleOpenAuth('login');
            else setCurrentTab('dashboard');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition-colors ${
            currentTab === 'dashboard' ? 'text-[#008751]' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        onOpenReport={() => handleOpenReport('general', 'general', 'General Safety Inquiry')}
      />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType={reportData.type as any}
        targetId={reportData.id}
        targetTitle={reportData.title}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        targetPackageId={paymentData.packageId}
        itemId={paymentData.itemId}
        itemTitle={paymentData.title}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <MainApp />
      </WebSocketProvider>
    </AuthProvider>
  );
}
