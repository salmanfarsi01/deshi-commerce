import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { Truck, X, ExternalLink, Sparkles, Send, Check } from 'lucide-react';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  order: Order | null;
  onClose: () => void;
  onAssign: (orderId: string, courierData: {
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    advanceToShipped?: boolean;
  }) => Promise<void>;
}

const COURIER_PROVIDERS = [
  { name: 'Steadfast Courier', urlPattern: 'https://steadfast.com.bd/t/', prefix: 'ST-' },
  { name: 'Pathao Courier', urlPattern: 'https://pathao.com/tracking/', prefix: 'PTH-' },
  { name: 'RedX Delivery', urlPattern: 'https://redx.com.bd/track/', prefix: 'RDX-' },
  { name: 'Paperfly Private Limited', urlPattern: 'https://paperfly.com.bd/tracking/', prefix: 'PFLY-' },
  { name: 'eCourier Bangladesh', urlPattern: 'https://ecourier.com.bd/tracking/', prefix: 'ECR-' },
  { name: 'In-House Deshi Express', urlPattern: '', prefix: 'DESHI-EXP-' },
];

export const CourierDispatchModal: React.FC<Props> = ({
  order,
  onClose,
  onAssign,
}) => {
  const [selectedCourier, setSelectedCourier] = useState(COURIER_PROVIDERS[0].name);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [customTrackingUrl, setCustomTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [advanceToShipped, setAdvanceToShipped] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      const isDhaka = order.shippingAddress?.district?.toLowerCase() === 'dhaka';
      setEstimatedDelivery(isDhaka ? 'Within 24 Hours (Dhaka Metro)' : '2-3 Business Days (Inter-District)');
      const provider = COURIER_PROVIDERS[0];
      const randomCode = `${provider.prefix}${Math.floor(100000 + Math.random() * 900000)}`;
      setTrackingNumber(randomCode);
      setCustomTrackingUrl(`${provider.urlPattern}${randomCode}`);
    }
  }, [order]);

  if (!order) return null;

  const handleProviderChange = (providerName: string) => {
    setSelectedCourier(providerName);
    const provider = COURIER_PROVIDERS.find((p) => p.name === providerName) || COURIER_PROVIDERS[0];
    const randomCode = `${provider.prefix}${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingNumber(randomCode);
    setCustomTrackingUrl(provider.urlPattern ? `${provider.urlPattern}${randomCode}` : '');
  };

  const handleTrackingNumberChange = (val: string) => {
    setTrackingNumber(val);
    const provider = COURIER_PROVIDERS.find((p) => p.name === selectedCourier);
    if (provider && provider.urlPattern) {
      setCustomTrackingUrl(`${provider.urlPattern}${val}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    try {
      setSubmitting(true);
      await onAssign(order.id, {
        courierName: selectedCourier,
        trackingNumber: trackingNumber.trim(),
        trackingUrl: customTrackingUrl.trim() || undefined,
        estimatedDeliveryDate: estimatedDelivery,
        advanceToShipped,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isDhaka = order.shippingAddress?.district?.toLowerCase() === 'dhaka';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Assign Courier &amp; Dispatch Order
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Order #{order.orderNumber} &bull; {formatBDT(order.totalAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer destination recap */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{order.customerName}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDhaka ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {isDhaka ? 'Inside Dhaka (৳60 delivery)' : `${order.shippingAddress.district} (Outside Dhaka ৳120 delivery)`}
              </span>
            </div>
            <p className="text-slate-600 font-mono">{order.customerPhone}</p>
            <p className="text-slate-500 text-[11px] truncate">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.upazila}, {order.shippingAddress.district}
            </p>
          </div>

          {/* 1. Courier Provider Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Courier Partner *
            </label>
            <select
              value={selectedCourier}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              {COURIER_PROVIDERS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Tracking / Consignment Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Consignment / Tracking Number *</span>
              <button
                type="button"
                onClick={() => {
                  const p = COURIER_PROVIDERS.find((cp) => cp.name === selectedCourier) || COURIER_PROVIDERS[0];
                  const code = `${p.prefix}${Math.floor(100000 + Math.random() * 900000)}`;
                  handleTrackingNumberChange(code);
                }}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-normal"
              >
                <Sparkles className="w-3 h-3" />
                Generate New Code
              </button>
            </label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => handleTrackingNumberChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* 3. Tracking Link Live Preview */}
          {customTrackingUrl && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Live Public Tracking URL
              </label>
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-700 break-all border border-slate-200">
                <span className="flex-1 truncate">{customTrackingUrl}</span>
                <a
                  href={customTrackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 shrink-0"
                  title="Test Tracking Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* 4. Estimated Delivery Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estimated Delivery Window
            </label>
            <input
              type="text"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g. 24-48 Hours / Oct 2, 2026"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* 5. Status Advance Checkbox */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="advanceShipped"
              checked={advanceToShipped}
              onChange={(e) => setAdvanceToShipped(e.target.checked)}
              className="mt-0.5 rounded-xs text-blue-600 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="advanceShipped" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">
                Advance order status to SHIPPED immediately
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically triggers SMS notification to customer (+88{order.customerPhone}) with the tracking link and courier consignment code.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Dispatching...' : 'Confirm Dispatch & Send SMS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
