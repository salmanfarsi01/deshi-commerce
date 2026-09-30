import React from 'react';
import { Customer360Profile } from '../../../types';
import { X, UserCheck, ShieldAlert, ShieldCheck, ShoppingBag, Phone, Mail, DollarSign } from 'lucide-react';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  profile: Customer360Profile | null;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const Customer360Modal: React.FC<Props> = ({
  profile,
  onClose,
  onSelectOrder,
}) => {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm">{profile.name}</h3>
                {profile.verifiedPhone && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <UserCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {profile.phone} {profile.email ? `&bull; ${profile.email}` : ''}
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

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Lifetime Spend
              </span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                {formatBDT(profile.lifetimeSpent)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Completed Orders
              </span>
              <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                {profile.completedOrdersCount} / {profile.totalOrdersCount}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Return Risk Score
              </span>
              <span className={`text-xs font-black uppercase mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                profile.riskScore === 'LOW'
                  ? 'bg-emerald-100 text-emerald-800'
                  : profile.riskScore === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {profile.riskScore === 'LOW' ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <ShieldAlert className="w-3 h-3" />
                )}
                {profile.riskScore} ({profile.returnRate}% cancel)
              </span>
            </div>
          </div>

          {/* Past Orders List */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Order History ({profile.orders.length})</span>
            </h4>

            {profile.orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No orders recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {profile.orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          #{o.orderNumber}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {o.items.length} item(s) &bull; {o.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatBDT(o.totalAmount)}
                      </span>
                      {o.courier && (
                        <span className="text-[10px] text-slate-500">
                          {o.courier.courierName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
