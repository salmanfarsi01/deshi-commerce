import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ShoppingBag,
  ExternalLink,
  MapPin,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Order, OrderStatus } from '../types';
import { formatBDT } from '../data/bangladeshGeo';
import mainLogo from '../images/main_logo.png';

export const OrderDetailView: React.FC = () => {
  const { selectedOrderId, setCurrentView, showToast, t } = useApp();
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
        <div className="w-10 h-10 border-4 border-slate-800 border-t-rose-600 animate-spin mx-auto mb-4 rounded-full" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Order Not Found</h3>
        <button
          type="button"
          onClick={() => setCurrentView('orders')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer uppercase tracking-wider"
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

  const handleDownloadMemo = () => {
    if (!order) return;
    const isDhakaAddress = order.shippingAddress.district.toLowerCase() === 'dhaka';
    const memoContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Cash Memo #${order.orderNumber} - Deshi Commerce</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 16px; }
    .brand-title { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
    .sub { font-size: 11px; color: #64748B; margin: 2px 0; }
    .memo-tag { display: inline-block; background: #0F172A; color: #fff; padding: 4px 10px; font-size: 12px; font-weight: 800; border-radius: 4px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F8FAFC; padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 16px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    th { background: #0F172A; color: white; padding: 8px 12px; text-align: left; }
    td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; }
    .text-right { text-align: right; }
    .totals { width: 280px; margin-left: auto; font-size: 12px; margin-bottom: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { border-top: 2px solid #0F172A; font-weight: 800; font-size: 15px; padding-top: 6px; }
    .footer { border-top: 1px dashed #CBD5E1; padding-top: 12px; font-size: 10px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">DESHI COMMERCE</div>
      <div class="sub">Authentic Quality Delivered Nationwide &bull; Trade Lic: TRAD/DNCC/049210/2024</div>
      <div class="sub">Gulshan-2, Dhaka-1212, Bangladesh &bull; Hotline: 09612-DESHI (33744) &bull; invoice@deshicommerce.com.bd</div>
    </div>
    <div style="text-align: right;">
      <span class="memo-tag">OFFICIAL CASH MEMO</span>
      <div style="margin-top: 6px; font-weight: bold; font-family: monospace;">MEMO #: ${order.orderNumber}</div>
      <div class="sub">DATE: ${new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <strong style="text-transform: uppercase; color: #64748B;">Billed &amp; Shipped To:</strong>
      <div style="font-weight: bold; margin-top: 4px;">${order.shippingAddress.fullName}</div>
      <div>${order.shippingAddress.phone}</div>
      <div>${order.shippingAddress.streetAddress}, ${order.shippingAddress.upazila}, ${order.shippingAddress.district}</div>
    </div>
    <div>
      <strong style="text-transform: uppercase; color: #64748B;">Payment &amp; Courier:</strong>
      <div style="margin-top: 4px;">Method: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'SSLCommerz Digital Gateway'}</strong></div>
      <div>Payment Status: <strong>${order.paymentStatus}</strong></div>
      <div>Zone: <strong>${isDhakaAddress ? 'Inside Dhaka Metropolitan (24-48 hrs)' : 'Outside Dhaka (3-5 days)'}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th class="text-right">Price</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((it) => `
        <tr>
          <td><strong>${it.productName}</strong></td>
          <td class="text-right">৳${it.price.toLocaleString('en-IN')}</td>
          <td class="text-right">${it.quantity}</td>
          <td class="text-right"><strong>৳${it.totalPrice.toLocaleString('en-IN')}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>৳${order.subtotal.toLocaleString('en-IN')}</span>
    </div>
    <div class="totals-row">
      <span>Delivery Fee:</span>
      <span>${order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toLocaleString('en-IN')}`}</span>
    </div>
    <div class="totals-row grand">
      <span>Total Payable:</span>
      <span>৳${order.totalAmount.toLocaleString('en-IN')}</span>
    </div>
  </div>

  <div class="footer">
    Thank you for choosing Deshi Commerce! For questions, courier tracking, or returns, reach us at 09612-DESHI (33744) or support@deshicommerce.com.bd
  </div>
</body>
</html>`;

    const blob = new Blob([memoContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CashMemo_${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Cash Memo #${order.orderNumber} downloaded!`, 'success');
  };

  const isDhaka = order.shippingAddress.district.toLowerCase() === 'dhaka';

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* ======================================================== */}
      {/* 1. SCREEN VIEW (Visible on web, hidden during print)      */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:hidden">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentView('orders')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('header.myorders', 'Back to My Orders')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMemo}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cash Memo</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>{t('order.print', 'Print Memo')}</span>
            </button>

            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                {t('order.cancel', 'Cancel Order')}
              </button>
            )}
          </div>
        </div>

        {/* Celebratory Instant Order Download Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-4 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Order Placed Successfully
              </div>
              <p className="text-xs text-slate-200">
                Your official Cash Memo <strong className="font-mono text-white">#{order.orderNumber}</strong> is generated and ready to download.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadMemo}
              className="px-3.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Memo</span>
            </button>
          </div>
        </div>

        {/* Order Confirmed Banner */}
        <div className="bg-white p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Order Verified
                </span>
                <span className="text-xs text-slate-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                Order #{order.orderNumber}
              </h1>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Payable</span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums">
                {formatBDT(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* Logistics Pipeline */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Logistics Status:
            </div>

            {isCancelled ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">This order was cancelled.</span>
                  {order.cancelReason && <p className="text-rose-700 mt-0.5">Reason: {order.cancelReason}</p>}
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
                      className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : isDone
                          ? 'border-slate-200 bg-slate-50 text-slate-800'
                          : 'border-slate-200 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className="mb-1.5">
                        {isDone ? (
                          <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-slate-800'}`} />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-400" />
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

          {/* Courier Card */}
          {order.courier ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Courier Partner:</div>
                  <div className="text-sm font-bold text-slate-900">
                    {order.courier.courierName} ({order.courier.trackingNumber})
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Estimated Delivery: <strong>{order.courier.estimatedDeliveryDate}</strong>
                  </div>
                </div>
              </div>

              <a
                href={order.courier.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Track on Courier Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-slate-600 shrink-0" />
              <span>
                Courier Dispatch: Our fulfillment team in Dhaka is packaging this order. Consignment tracking number will be assigned shortly.
              </span>
            </div>
          )}

          {/* Items Table */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Order Items ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 bg-white">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-14 object-cover bg-slate-50 shrink-0 rounded-lg border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.productName}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Quantity: <span className="font-bold text-slate-800">{item.quantity}</span> · Unit:{' '}
                      <span className="font-mono">{formatBDT(item.price)}</span>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                    {formatBDT(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                <span>Delivery Address</span>
              </div>
              <div className="text-slate-900 font-bold">{order.shippingAddress.fullName}</div>
              <div className="text-slate-600 font-mono">{order.shippingAddress.phone}</div>
              <div className="text-slate-600">{order.shippingAddress.streetAddress}</div>
              <div className="text-slate-600 font-medium">
                {order.shippingAddress.upazila}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                <span>Payment Summary</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-bold text-slate-900">
                  {order.paymentMethod === 'SSLCOMMERZ' ? 'SSLCOMMERZ Online' : 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <span className="font-bold px-2 py-0.5 rounded text-[10px] uppercase bg-slate-200 text-slate-900">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatBDT(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {order.deliveryCharge === 0 ? 'FREE' : formatBDT(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span className="uppercase tracking-wider">Total</span>
                <span className="font-mono text-base tabular-nums font-black text-slate-900">
                  {formatBDT(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DEDICATED 1-PAGE CASH MEMO (Visible strictly in Print) */}
      {/* ======================================================== */}
      <div id="printable-cash-memo" className="hidden bg-white text-slate-900 font-sans text-xs">
        {/* Memo Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img
                src={mainLogo}
                alt="Deshi Commerce"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Authentic Quality Delivered Nationwide &bull; Trade Lic: TRAD/DNCC/049210/2024
            </p>
            <p className="text-[10px] text-slate-500">
              Gulshan-2, Dhaka-1212, Bangladesh &bull; Hotline: 09612-DESHI (33744) &bull; invoice@deshicommerce.com.bd
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded">
              OFFICIAL CASH MEMO
            </span>
            <div className="mt-2 text-[11px] font-mono">
              <span className="text-slate-500">MEMO #: </span>
              <strong className="text-slate-900 font-bold">{order.orderNumber}</strong>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              DATE: {new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              BILLED &amp; DELIVERED TO:
            </span>
            <div className="font-bold text-slate-900 text-xs">{order.customerName}</div>
            <div className="font-mono text-slate-700 text-[11px]">{order.customerPhone}</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              {order.shippingAddress.streetAddress}, {order.shippingAddress.upazila}, {order.shippingAddress.district}, {order.shippingAddress.division}
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Payment Mode:</span>
              <span className="font-bold text-slate-900">{order.paymentMethod === 'SSLCOMMERZ' ? 'SSLCommerz Online Paid' : 'Cash on Delivery (COD)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Payment Status:</span>
              <span className="font-bold text-slate-900 uppercase">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Delivery Region:</span>
              <span className="font-bold text-slate-900">{isDhaka ? 'Inside Dhaka (৳60 delivery)' : `${order.shippingAddress.district} (Outside Dhaka ৳120 delivery)`}</span>
            </div>
            {order.courier && (
              <div className="flex justify-between">
                <span className="text-slate-500 text-[11px]">Courier Tracking:</span>
                <span className="font-mono font-bold text-slate-900">{order.courier.courierName} ({order.courier.trackingNumber})</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs mb-4 border border-slate-200">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[10px] uppercase">
            <tr>
              <th className="py-2 px-2.5 w-10 text-center">SL</th>
              <th className="py-2 px-3">Item Description</th>
              <th className="py-2 px-3 text-center w-16">Qty</th>
              <th className="py-2 px-3 text-right w-24">Rate (৳)</th>
              <th className="py-2 px-3 text-right w-28">Total (৳)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="py-2 px-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-slate-900 block">{item.productName}</span>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono">{formatBDT(item.price)}</td>
                <td className="py-2 px-3 text-right font-mono font-bold">{formatBDT(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span>{formatBDT(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span>{order.deliveryCharge === 0 ? 'FREE (0.00)' : formatBDT(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT / Tax (Inclusive):</span>
              <span>৳ 0.00</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
              <span className="font-sans uppercase">Total Payable:</span>
              <span>{formatBDT(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Terms Box */}
        <div className="p-3 border border-slate-200 rounded text-[10px] text-slate-600 space-y-1 mb-8">
          <div className="font-bold uppercase tracking-wider text-slate-800">Customer Terms &amp; Warranty Policy:</div>
          <p>1. Please verify all product packaging and physical condition at the time of courier hand-over.</p>
          <p>2. 7-day replacement warranty is valid with this original Cash Memo.</p>
          <p>3. For support, call 09612-DESHI (33744) or email support@deshicommerce.com.bd.</p>
        </div>

        {/* Signature Blocks */}
        <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-300 text-xs">
          <div className="text-center">
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <span className="text-[10px] font-semibold text-slate-600 uppercase">Received By (Customer)</span>
          </div>

          <div className="text-center">
            <div className="text-[9px] font-mono text-slate-400 mb-1 font-bold">DESHI COMMERCE ACCOUNTS</div>
            <div className="w-44 border-b border-slate-400 mb-1"></div>
            <span className="text-[10px] font-semibold text-slate-600 uppercase">Authorized Officer Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};
