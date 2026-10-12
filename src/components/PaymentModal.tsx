import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Zap, CreditCard, Lock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPackageId?: string;
  itemId?: string;
  itemTitle?: string;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  targetPackageId = 'pkg_featured_product',
  itemId,
  itemTitle,
  onSuccess,
}) => {
  const { user, formatPrice } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState(targetPackageId);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successTxn, setSuccessTxn] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPkgId(targetPackageId);
      setSuccessTxn(null);
      setError(null);
      api.getPackages()
        .then((res) => setPackages(res.packages || []))
        .catch(() => {});
    }
  }, [isOpen, targetPackageId]);

  if (!isOpen) return null;

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handlePay = async () => {
    if (!user) {
      setError('Please log in to upgrade and promote.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 1. Initialize server-side transaction reference
      const initRes = await api.initializePayment({
        packageId: selectedPkgId,
        itemId,
      });

      // 2. Simulate user confirming on Paystack / Flutterwave secure gateway
      setIsVerifying(true);
      await new Promise((r) => setTimeout(r, 1200));

      // 3. Server-side verification and activation
      const verifyRes = await api.verifyPayment(initRes.reference);
      setSuccessTxn(verifyRes.transaction);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#008751]/10 text-[#008751] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Promote & Grow on NaijaHub</h3>
              <p className="text-[11px] text-slate-500">Transparent business promotion options</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successTxn ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-[#008751] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Promotion Activated!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your payment of <strong className="text-slate-900">₦{successTxn.amount.toLocaleString()}</strong> has been verified server-side.
              Your reference <span className="font-mono text-[11px]">{successTxn.reference}</span> is saved in audit records.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {itemTitle && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Promoting:</span> {itemTitle}
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Package selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select Package</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {packages.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#008751] bg-[#008751]/5 ring-1 ring-[#008751]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{pkg.name}</div>
                      <div className="text-xs font-extrabold text-[#008751] mt-1 tabular-nums">
                        {formatPrice(pkg.price)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{pkg.duration}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPkg && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">Included Features:</div>
                {selectedPkg.features?.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5" />
                Paystack / Flutterwave Secured
              </span>
              <span className="font-bold tabular-nums">
                {selectedPkg ? formatPrice(selectedPkg.price) : '₦0'}
              </span>
            </div>

            <button
              onClick={handlePay}
              disabled={isLoading || isVerifying}
              className="w-full py-3 text-xs font-bold text-white bg-[#008751] hover:bg-[#007042] rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>Verifying Transaction Server-Side...</span>
              ) : isLoading ? (
                <span>Connecting Gateway...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment ({selectedPkg ? formatPrice(selectedPkg.price) : ''})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
