import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  X,
  Lock,
} from 'lucide-react';
import { Order } from '../types';
import { apiService } from '../services/apiClient';
import { formatBDT } from '../data/bangladeshGeo';

interface SSLCommerzModalProps {
  order: Order;
  isOpen: boolean;
  onSuccess: (order: Order) => void;
  onCancel: () => void;
}

export const SSLCommerzModal: React.FC<SSLCommerzModalProps> = ({
  order,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'card' | 'net'>('mobile');
  const [selectedGateway, setSelectedGateway] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [mobileNumber, setMobileNumber] = useState(order.customerPhone || '01722222222');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'otp' | 'processing'>('select');

  if (!isOpen) return null;

  const handleSimulateOneClick = async () => {
    setLoading(true);
    try {
      const res = await apiService.sslcommerz.simulateSuccess(order.id);
      onSuccess(res.data);
    } catch (e) {
      console.error(e);
      alert('Simulation error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      alert('Please enter your simulation PIN (e.g. 12345)');
      return;
    }
    setStep('processing');
    setTimeout(async () => {
      try {
        const res = await apiService.sslcommerz.simulateSuccess(order.id);
        onSuccess(res.data);
      } catch (err) {
        console.error(err);
        setStep('select');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity" />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white shadow-2xl border border-[#D4D4D4] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 bg-[#2B2B2B] text-white flex items-center justify-between border-b border-[#3D3D3D]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs">
                SSL
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 text-white">
                  <span>SSLCOMMERZ Gateway</span>
                  <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
                </h3>
                <span className="text-[11px] text-[#B3B3B3]">
                  Order #{order.orderNumber} · 256-Bit Escrow
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-none p-1 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Due Banner */}
          <div className="bg-[#F8F9FA] px-6 py-3 border-b border-[#D4D4D4] flex items-center justify-between">
            <span className="text-xs text-stone-700 font-bold uppercase tracking-wider">Payable:</span>
            <span className="text-lg font-mono font-bold text-[#E11D48] tabular-nums">
              {formatBDT(order.totalAmount)}
            </span>
          </div>

          {/* 1-Click Sandbox Test Banner */}
          <div className="p-3 bg-rose-50/60 border-b border-rose-200 flex items-center justify-between text-xs px-6">
            <div className="flex items-center gap-2 text-stone-800 font-medium">
              <span className="w-2 h-2 bg-[#E11D48] animate-pulse" />
              <span>Sandbox Testing Mode</span>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSimulateOneClick}
              className="rounded-none px-3 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors uppercase tracking-wider"
            >
              {loading ? 'Processing...' : '⚡ 1-Click Success'}
            </button>
          </div>

          {step === 'processing' ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2B2B2B] border-t-[#E11D48] animate-spin mx-auto" />
              <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">Contacting SSLCommerz Gateway...</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Verifying debit authorization with Bangladesh Bank clearing.
              </p>
            </div>
          ) : (
            <div>
              {/* Payment Category Tabs */}
              <div className="flex border-b border-[#D4D4D4] text-xs font-bold bg-[#F8F9FA]">
                <button
                  type="button"
                  onClick={() => setActiveTab('mobile')}
                  className={`rounded-none flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors uppercase tracking-wider ${
                    activeTab === 'mobile'
                      ? 'border-[#E11D48] text-[#E11D48] bg-white font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`rounded-none flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors uppercase tracking-wider ${
                    activeTab === 'card'
                      ? 'border-[#E11D48] text-[#E11D48] bg-white font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('net')}
                  className={`rounded-none flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors uppercase tracking-wider ${
                    activeTab === 'net'
                      ? 'border-[#E11D48] text-[#E11D48] bg-white font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {activeTab === 'mobile' && (
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGateway('bKash')}
                        className={`rounded-none p-3 border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          selectedGateway === 'bKash'
                            ? 'border-[#E11D48] bg-rose-50 text-[#E11D48]'
                            : 'border-[#D4D4D4] hover:bg-stone-50'
                        }`}
                      >
                        <span className="font-bold text-sm">bKash</span>
                        <span className="text-[10px] text-stone-500">বিকাশ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGateway('Nagad')}
                        className={`rounded-none p-3 border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          selectedGateway === 'Nagad'
                            ? 'border-[#E11D48] bg-rose-50 text-[#E11D48]'
                            : 'border-[#D4D4D4] hover:bg-stone-50'
                        }`}
                      >
                        <span className="font-bold text-sm">Nagad</span>
                        <span className="text-[10px] text-stone-500">নগদ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGateway('Rocket')}
                        className={`rounded-none p-3 border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          selectedGateway === 'Rocket'
                            ? 'border-[#E11D48] bg-rose-50 text-[#E11D48]'
                            : 'border-[#D4D4D4] hover:bg-stone-50'
                        }`}
                      >
                        <span className="font-bold text-sm">Rocket</span>
                        <span className="text-[10px] text-stone-500">রকেট DBBL</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {selectedGateway} Account Number
                      </label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        required
                        className="rounded-none w-full px-3.5 py-2.5 bg-stone-50 border border-[#D4D4D4] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Enter Simulation PIN (e.g. 12345)
                      </label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="•••••"
                        required
                        className="rounded-none w-full px-3.5 py-2.5 bg-stone-50 border border-[#D4D4D4] text-xs tracking-widest font-mono"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-none w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Pay {formatBDT(order.totalAmount)}</span>
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="4111 2222 3333 4242"
                        className="rounded-none w-full px-3.5 py-2.5 bg-stone-50 border border-[#D4D4D4] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Expiry</label>
                        <input
                          type="text"
                          defaultValue="08/28"
                          className="rounded-none w-full px-3.5 py-2.5 bg-stone-50 border border-[#D4D4D4] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">CVV</label>
                        <input
                          type="password"
                          defaultValue="789"
                          className="rounded-none w-full px-3.5 py-2.5 bg-stone-50 border border-[#D4D4D4] font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateOneClick}
                      className="rounded-none w-full py-3 bg-[#2B2B2B] hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                      <span>Pay with Visa / Mastercard</span>
                    </button>
                  </div>
                )}

                {activeTab === 'net' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-stone-600">Select your internet banking portal:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['City Touch', 'Islami Bank CellFin', 'EBL Skybanking', 'BRAC Bank Astha'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={handleSimulateOneClick}
                          className="rounded-none p-3 border border-[#D4D4D4] hover:border-[#E11D48] hover:bg-rose-50/50 text-left font-bold text-[#2B2B2B] transition-colors cursor-pointer"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-3 bg-[#F8F9FA] border-t border-[#D4D4D4] text-center text-[10px] text-stone-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#B3B3B3]" />
            <span>PCI-DSS Certified Gateway · Verified by Bangladesh Bank</span>
          </div>
        </div>
      </div>
    </div>
  );
};
