import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  MapPin,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Order, OrderStatus } from '../types';
import { formatBDT } from '../data/bangladeshGeo';

export const OrderDetailView: React.FC = () => {
  const { selectedOrderId, setCurrentView, showToast } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered wrong item / size');

  useEffect(() => {
    if (!selectedOrderId) return;
    setLoading(true);
    apiService.orders
      .getById(selectedOrderId)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedOrderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#2B2B2B] border-t-[#E11D48] animate-spin mx-auto mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-stone-600">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="text-lg font-bold text-[#2B2B2B] mb-2 font-serif uppercase">Order Not Found</h3>
        <button
          type="button"
          onClick={() => setCurrentView('orders')}
          className="rounded-none px-4 py-2 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold cursor-pointer uppercase tracking-wider"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const pipelineStages: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStageIndex = pipelineStages.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const handleCancelOrder = async () => {
    try {
      const res = await apiService.orders.cancel(order.id, cancelReason);
      setOrder(res.data);
      setIsCancelModalOpen(false);
      showToast('Order has been cancelled.', 'info');
    } catch {
      showToast('Could not cancel order.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setCurrentView('orders')}
            className="rounded-none flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#E11D48] font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-none flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D4D4] text-xs font-bold uppercase tracking-wider text-[#2B2B2B] hover:bg-[#F8F9FA] shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Print Invoice</span>
            </button>

            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="rounded-none px-3 py-1.5 bg-rose-50 text-[#E11D48] border border-rose-200 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Confirmed Banner */}
        <div className="bg-white p-6 sm:p-8 border border-[#D4D4D4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4D4D4]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                  Order Verified
                </span>
                <span className="text-xs text-stone-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2B2B] mt-1 font-mono">
                Order #{order.orderNumber}
              </h1>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 uppercase tracking-wider">Total Payable</span>
              <div className="text-2xl font-mono font-extrabold text-[#E11D48] tabular-nums">
                {formatBDT(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* ORDER STATUS TRACKER PIPELINE */}
          <div>
            <div className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider mb-4">
              Logistics Status:
            </div>

            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold">This order was cancelled.</span>
                  {order.cancelReason && <p className="text-red-700 mt-0.5">Reason: {order.cancelReason}</p>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {pipelineStages.map((stage, idx) => {
                  const isDone = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div
                      key={stage}
                      className={`p-3 border flex flex-col items-center text-center transition-all ${
                        isCurrent
                          ? 'border-[#2B2B2B] bg-[#2B2B2B] text-white'
                          : isDone
                          ? 'border-[#D4D4D4] bg-[#F8F9FA] text-[#2B2B2B]'
                          : 'border-[#D4D4D4] bg-stone-50 text-stone-400'
                      }`}
                    >
                      <div className="mb-1.5">
                        {isDone ? (
                          <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-[#E11D48]'}`} />
                        ) : (
                          <Clock className="w-5 h-5 text-stone-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {stage.toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Courier Dispatch Card */}
          {order.courier ? (
            <div className="p-5 bg-[#F8F9FA] border border-[#D4D4D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#2B2B2B] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#E11D48]" />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Courier Partner:</div>
                  <div className="text-sm font-bold text-[#2B2B2B]">
                    {order.courier.courierName} ({order.courier.trackingNumber})
                  </div>
                  <div className="text-[11px] text-stone-700 mt-0.5">
                    Estimated Delivery: <strong>{order.courier.estimatedDeliveryDate}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCourierModalOpen(true)}
                className="rounded-none px-4 py-2 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                <span>Track on Steadfast Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#F8F9FA] border border-[#D4D4D4] flex items-center gap-3 text-xs text-stone-800">
              <Clock className="w-4 h-4 text-[#E11D48] shrink-0" />
              <span>
                Courier Dispatch: Our fulfillment team in Dhaka is packaging this order. Steadfast tracking number will be assigned shortly.
              </span>
            </div>
          )}

          {/* Items Table */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider mb-3">
              Order Items ({order.items.length})
            </h3>
            <div className="divide-y divide-[#D4D4D4] border border-[#D4D4D4] overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 bg-white">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-14 object-cover bg-stone-100 shrink-0 border border-[#D4D4D4]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B2B2B] truncate">{item.productName}</h4>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Quantity: <span className="font-bold text-stone-800">{item.quantity}</span> · Unit:{' '}
                      <span className="font-mono">{formatBDT(item.price)}</span>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-[#2B2B2B] tabular-nums">
                    {formatBDT(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Payment Summary Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#D4D4D4] text-xs">
            {/* Delivery Address */}
            <div className="space-y-1.5 p-4 bg-[#F8F9FA] border border-[#D4D4D4]">
              <div className="font-bold text-[#2B2B2B] flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Delivery Address</span>
              </div>
              <div className="text-[#2B2B2B] font-bold">{order.shippingAddress.fullName}</div>
              <div className="text-stone-600 font-mono">{order.shippingAddress.phone}</div>
              <div className="text-stone-600">{order.shippingAddress.streetAddress}</div>
              <div className="text-stone-600 font-medium">
                {order.shippingAddress.upazila}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </div>
              {order.customerNote && (
                <div className="pt-2 text-stone-800 font-medium text-[11px]">
                  Note: "{order.customerNote}"
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 p-4 bg-[#F8F9FA] border border-[#D4D4D4]">
              <div className="font-bold text-[#2B2B2B] flex items-center gap-1.5 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Payment Summary</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Method</span>
                <span className="font-bold text-[#2B2B2B]">
                  {order.paymentMethod === 'SSLCOMMERZ' ? 'SSLCOMMERZ Online' : 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Status</span>
                <span
                  className={`font-bold px-2 py-0.5 text-[10px] uppercase ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentTxnId && (
                <div className="flex justify-between text-stone-600">
                  <span>Txn ID</span>
                  <span className="font-mono text-[11px] text-stone-800 font-bold">
                    {order.paymentTxnId}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 pt-1 border-t border-[#D4D4D4]">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                  {formatBDT(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                  {order.deliveryCharge === 0 ? 'FREE' : formatBDT(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#2B2B2B] pt-1 border-t border-[#D4D4D4]">
                <span className="uppercase tracking-wider">Total</span>
                <span className="font-mono text-[#E11D48] text-sm tabular-nums font-extrabold">
                  {formatBDT(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Modal */}
      {isCourierModalOpen && order.courier && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsCourierModalOpen(false)}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white shadow-2xl border border-[#D4D4D4] overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-5 bg-[#2B2B2B] text-white flex items-center justify-between border-b border-[#3D3D3D]">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#E11D48]" />
                    <span>{order.courier.courierName} Portal Simulator</span>
                  </h3>
                  <p className="text-xs text-[#D4D4D4] font-mono mt-0.5">
                    Consignment #{order.courier.trackingNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="rounded-none p-1 text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-[#F8F9FA] border border-[#D4D4D4] text-xs text-[#2B2B2B]">
                  <div className="font-bold mb-1 uppercase tracking-wider">Status: In Transit</div>
                  <div>Current Hub: <strong>{order.courier.lastLocation}</strong></div>
                  <div>Expected Arrival: <strong>{order.courier.estimatedDeliveryDate}</strong></div>
                </div>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D4D4D4]">
                  <div className="relative text-xs">
                    <div className="absolute -left-6 top-0.5 w-3 h-3 bg-[#E11D48] ring-4 ring-white" />
                    <div className="font-bold text-[#2B2B2B]">Arrived at Tejgaon Central Sorting Hub</div>
                    <div className="text-[11px] text-stone-500">Dhaka · Today, 11:45 AM</div>
                  </div>
                  <div className="relative text-xs">
                    <div className="absolute -left-6 top-0.5 w-3 h-3 bg-[#E11D48] ring-4 ring-white" />
                    <div className="font-bold text-[#2B2B2B]">Dispatched from Deshi commerce Hub</div>
                    <div className="text-[11px] text-stone-500">Dhanmondi, Dhaka · Yesterday, 04:30 PM</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="rounded-none w-full py-2.5 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsCancelModalOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white p-6 shadow-2xl border border-[#D4D4D4] space-y-4 animate-in zoom-in-95">
              <h3 className="font-bold text-[#2B2B2B] text-base font-serif uppercase">Cancel Order #{order.orderNumber}</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to cancel this order?
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reason:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="rounded-none w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4]"
                >
                  <option value="Ordered wrong item / size">Ordered wrong item / size</option>
                  <option value="Changed delivery address">Changed delivery address</option>
                  <option value="Found alternative / delayed delivery">Found alternative</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="rounded-none flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="rounded-none flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
