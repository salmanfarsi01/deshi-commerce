import React, { useState, useEffect } from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
import { Order } from '../../types';
import { formatBDT } from '../../data/bangladeshGeo';

export const OrdersTab: React.FC = () => {
  const { setCurrentView, viewOrderDetail } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    setLoadingOrders(true);
    apiService.orders.getCustomerOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  if (loadingOrders) {
    return <div className="p-12 text-center text-slate-500 text-xs">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-xs">
        <div className="w-14 h-14 bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200 rounded-full">
          <Package className="w-7 h-7 text-slate-700" />
        </div>
        <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">No orders yet</h4>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Browse products and place your first order with doorstep cash on delivery nationwide.
        </p>
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="rounded-xl px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((ord) => (
        <div
          key={ord.id}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900">
                Order #{ord.orderNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  ord.status === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : ord.status === 'SHIPPED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : ord.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {ord.status}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Placed on {new Date(ord.createdAt).toLocaleDateString('en-GB')} &bull; {ord.items.length} item(s)
            </div>

            <div className="text-xs text-slate-700 pt-1">
              Shipping to: <strong className="text-slate-900">{ord.shippingAddress.fullName}</strong> ({ord.shippingAddress.district})
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-base font-black text-slate-900 font-mono">
              {formatBDT(ord.totalAmount)}
            </div>
            <button
              type="button"
              onClick={() => viewOrderDetail(ord.id)}
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Track Order</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
