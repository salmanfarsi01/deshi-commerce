import React, { useMemo } from 'react';
import { Search, ExternalLink, Truck, Eye } from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  orders: Order[];
  orderSearch: string;
  onOrderSearchChange: (val: string) => void;
  orderStatusFilter: string;
  onOrderStatusFilterChange: (status: string) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOpenCustomer360: (userId: string) => void;
  onSelectCourier: (order: Order) => void;
  onInspectOrder: (order: Order) => void;
}

export const AdminOrdersTab: React.FC<Props> = ({
  orders,
  orderSearch,
  onOrderSearchChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  onStatusChange,
  onOpenCustomer360,
  onSelectCourier,
  onInspectOrder,
}) => {
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.shippingAddress?.district && o.shippingAddress.district.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  return (
    <div className="space-y-4">
      {/* Search and Slicer Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={orderSearch}
            onChange={(e) => onOrderSearchChange(e.target.value)}
            placeholder="Search by order #, customer, phone, district..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Status Slicer Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onOrderStatusFilterChange(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                orderStatusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer &amp; Phone</th>
                <th className="py-3 px-4">Delivery Region</th>
                <th className="py-3 px-4">Items / Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Courier Tracking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No customer orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isDhaka = o.shippingAddress?.district?.toLowerCase() === 'dhaka';
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          #{o.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onOpenCustomer360(o.userId)}
                          className="font-semibold text-blue-600 hover:underline block text-left cursor-pointer"
                          title="Click to view Customer 360 profile"
                        >
                          {o.customerName}
                        </button>
                        <span className="text-[10px] font-mono text-slate-500">
                          {o.customerPhone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDhaka ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {isDhaka ? 'Inside Dhaka (৳60)' : `${o.shippingAddress?.district || 'Outside'} (৳120)`}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[140px] mt-0.5">
                          {o.shippingAddress?.streetAddress}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatBDT(o.totalAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {o.items.length} item(s)
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.paymentMethod} &bull; {o.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        {o.courier ? (
                          <div>
                            <span className="font-semibold text-slate-800 block text-[11px]">
                              {o.courier.courierName}
                            </span>
                            <a
                              href={o.courier.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>{o.courier.trackingNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectCourier(o)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Assign Courier</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectOrder(o)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
                            title="View invoice details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectCourier(o)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            title="Update courier tracking"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
