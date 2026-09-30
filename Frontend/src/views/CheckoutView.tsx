import React, { useState, useEffect } from 'react';
import {
  Plus,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Address, Order } from '../types';
import {
  BANGLADESH_DIVISIONS,
  calculateDeliveryFee,
  formatBDT,
  isValidBDPhone,
} from '../data/bangladeshGeo';
import { SSLCommerzModal } from './SSLCommerzModal';

export const CheckoutView: React.FC = () => {
  const { cart, user, setCurrentView, showToast, viewOrderDetail, refreshCart, openAuthModal } = useApp();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'SSLCOMMERZ'>('COD');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);

  // SSLCommerz Modal State
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isSSLModalOpen, setIsSSLModalOpen] = useState(false);

  // New Address Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Dhanmondi');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [addressError, setAddressError] = useState('');

  // Load saved addresses
  useEffect(() => {
    apiService.addresses.getAll().then((res) => {
      setAddresses(res.data);
      if (res.data.length > 0) {
        const def = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddressId(def.id);
      } else {
        setIsNewAddressOpen(true);
      }
    });
  }, []);

  const activeDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === division) || BANGLADESH_DIVISIONS[0];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === newDiv);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const effectiveDistrict = selectedAddress ? selectedAddress.district : district;
  const deliveryCharge = calculateDeliveryFee(effectiveDistrict, cart.subtotal);
  const grandTotal = cart.subtotal + deliveryCharge;

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    if (!fullName.trim()) {
      setAddressError('Please provide recipient full name');
      return;
    }
    if (!isValidBDPhone(phone)) {
      setAddressError('Please enter a valid 11-digit Bangladeshi mobile number (017XXXXXXXX)');
      return;
    }
    if (!streetAddress.trim()) {
      setAddressError('Please provide detailed street, house or road address');
      return;
    }

    try {
      const res = await apiService.addresses.create({
        fullName,
        phone,
        division,
        district,
        upazila,
        streetAddress,
        isDefault,
      });
      setAddresses((prev) => [res.data, ...prev]);
      setSelectedAddressId(res.data.id);
      setIsNewAddressOpen(false);
      showToast('Address saved successfully', 'success');
    } catch {
      setAddressError('Failed to save address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await apiService.orders.create({
        addressId: selectedAddressId,
        paymentMethod,
        customerNote: customerNote.trim() || undefined,
      });

      const newOrder = orderRes.data;

      if (paymentMethod === 'SSLCOMMERZ') {
        // Trigger simulated SSLCommerz Gateway Modal
        setPendingOrder(newOrder);
        setIsSSLModalOpen(true);
        setLoading(false);
      } else {
        // Cash on delivery
        await refreshCart();
        showToast(`Order #${newOrder.orderNumber} placed successfully!`, 'success');
        viewOrderDetail(newOrder.id);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || 'Failed to place order. Try again.', 'error');
      setLoading(false);
    }
  };

  const handleSSLSuccess = async (updatedOrder: Order) => {
    setIsSSLModalOpen(false);
    await refreshCart();
    showToast(`Payment verified! Transaction: ${updatedOrder.paymentTxnId || 'TXN-SUCCESS'}`, 'success');
    viewOrderDetail(updatedOrder.id);
  };

  if (cart.items.length === 0 && !pendingOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h3 className="text-xl font-bold text-[#2B2B2B] mb-2 font-serif uppercase">Your Shopping Bag is Empty</h3>
        <p className="text-xs text-stone-500 mb-6">Add items before proceeding to checkout.</p>
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="rounded-none px-6 py-3 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
        >
          Return to Store Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="rounded-none flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#E11D48] font-bold uppercase tracking-wider mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2B2B] tracking-tight mb-6 font-serif uppercase">
          Checkout &amp; Bangladesh Delivery
        </h1>

        {!user && (
          <div className="mb-8 p-4 bg-white border border-[#D4D4D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                G
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#2B2B2B]">Have a Google Mail account? </span>
                <span className="text-stone-600">Sign in for saved shipping destinations and instant order tracking.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="rounded-none px-3.5 py-1.5 border border-[#2B2B2B] text-xs font-bold text-[#2B2B2B] hover:bg-[#2B2B2B] hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="rounded-none px-3.5 py-1.5 bg-[#E11D48] text-white hover:bg-[#BE123C] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white p-6 border border-[#D4D4D4] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D4]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[#2B2B2B] text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-bold text-[#2B2B2B] text-sm uppercase tracking-wider">
                    Delivery Address
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewAddressOpen(!isNewAddressOpen)}
                  className="rounded-none text-xs text-[#E11D48] hover:text-[#2B2B2B] font-bold flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isNewAddressOpen ? 'Close Form' : 'Add New Address'}</span>
                </button>
              </div>

              {/* Saved Address Radios */}
              {!isNewAddressOpen && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const isInsideDhaka = addr.district.toLowerCase() === 'dhaka';
                    return (
                      <label
                        key={addr.id}
                        className={`p-4 border-2 block cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2B2B2B] bg-[#F8F9FA]'
                            : 'border-[#D4D4D4] hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="addressSelection"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 w-4 h-4 rounded-none accent-[#E11D48]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#2B2B2B]">{addr.fullName}</span>
                                <span className="text-[11px] font-mono text-stone-500">({addr.phone})</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold text-white bg-[#2B2B2B] px-1.5 py-0.5 uppercase">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-1">{addr.streetAddress}</p>
                              <div className="text-[11px] text-stone-500 mt-0.5 font-medium">
                                {addr.upazila}, {addr.district}, {addr.division}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                                isInsideDhaka
                                  ? 'bg-rose-50 text-[#E11D48] border border-rose-200'
                                  : 'bg-stone-100 text-[#2B2B2B] border border-[#D4D4D4]'
                              }`}
                            >
                              {isInsideDhaka ? 'Dhaka (৳60)' : 'Outside Dhaka (৳120)'}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Add New Address Form */}
              {isNewAddressOpen && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="bg-[#F8F9FA] p-5 border border-[#D4D4D4] space-y-4"
                >
                  <h3 className="font-bold text-xs text-[#2B2B2B] uppercase tracking-wider">
                    New Delivery Destination
                  </h3>

                  {addressError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Recipient Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Karim Ahmed"
                        required
                        className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Contact Mobile (11 Digits)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        required
                        className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Division
                      </label>
                      <select
                        value={division}
                        onChange={(e) => handleDivisionChange(e.target.value)}
                        className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] cursor-pointer"
                      >
                        {BANGLADESH_DIVISIONS.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        District
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4] cursor-pointer"
                      >
                        {activeDivisionObj.districts.map((dst) => (
                          <option key={dst} value={dst}>
                            {dst}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Upazila / Area
                      </label>
                      <input
                        type="text"
                        value={upazila}
                        onChange={(e) => setUpazila(e.target.value)}
                        placeholder="e.g. Dhanmondi"
                        required
                        className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Street Address (House, Road, Area)
                    </label>
                    <textarea
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. House 12, Road 5, Apt 4B, Dhanmondi R/A"
                      rows={2}
                      required
                      className="rounded-none w-full px-3 py-2 text-xs bg-white border border-[#D4D4D4]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded-none accent-[#E11D48]"
                      />
                      <span>Save as default shipping address</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsNewAddressOpen(false)}
                        className="rounded-none px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer uppercase font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-none px-4 py-2 bg-[#2B2B2B] text-white text-xs font-bold hover:bg-[#E11D48] cursor-pointer uppercase tracking-wider"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="bg-white p-6 border border-[#D4D4D4] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#D4D4D4]">
                <span className="w-6 h-6 bg-[#2B2B2B] text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-[#2B2B2B] text-sm uppercase tracking-wider">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash on Delivery */}
                <label
                  className={`p-4 border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#2B2B2B] bg-[#F8F9FA]'
                      : 'border-[#D4D4D4] hover:border-stone-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 w-4 h-4 rounded-none accent-[#E11D48]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#E11D48]" />
                      <span className="font-bold text-xs text-[#2B2B2B] uppercase">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Pay cash upon doorstep delivery inspection anywhere in Bangladesh.
                    </p>
                  </div>
                </label>

                {/* SSLCommerz Online */}
                <label
                  className={`p-4 border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'SSLCOMMERZ'
                      ? 'border-[#2B2B2B] bg-[#F8F9FA]'
                      : 'border-[#D4D4D4] hover:border-stone-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="SSLCOMMERZ"
                    checked={paymentMethod === 'SSLCOMMERZ'}
                    onChange={() => setPaymentMethod('SSLCOMMERZ')}
                    className="mt-1 w-4 h-4 rounded-none accent-[#E11D48]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#E11D48]" />
                      <span className="font-bold text-xs text-[#2B2B2B] uppercase">SSLCOMMERZ Gateway</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Instant payment via <strong>bKash, Nagad, Rocket</strong>, or Visa/Mastercard.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Customer Delivery Note */}
            <div className="bg-white p-6 border border-[#D4D4D4] shadow-xs space-y-2">
              <label className="block text-xs font-bold text-[#2B2B2B] uppercase tracking-wider">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Please call before delivery, deliver after 5 PM"
                className="rounded-none w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] border border-[#D4D4D4] focus:outline-none focus:border-[#2B2B2B]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            <div className="bg-white p-6 border border-[#D4D4D4] shadow-xs space-y-5">
              <h3 className="font-bold text-[#2B2B2B] text-sm uppercase tracking-wider pb-3 border-b border-[#D4D4D4]">
                Order Summary ({cart.itemCount} items)
              </h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover bg-stone-100 shrink-0 border border-[#D4D4D4]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#2B2B2B] truncate">{item.product.name}</h4>
                      <div className="text-[11px] text-stone-500">
                        Qty: {item.quantity} · {formatBDT(item.price)}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                      {formatBDT(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs pt-3 border-t border-[#D4D4D4]">
                <div className="flex justify-between text-stone-600">
                  <span>Bag Subtotal</span>
                  <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                    {formatBDT(cart.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery Charge</span>
                    <span className="text-[11px] text-stone-400">({effectiveDistrict})</span>
                  </div>
                  {deliveryCharge === 0 ? (
                    <span className="font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 border border-rose-200 text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                      {formatBDT(deliveryCharge)}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D4D4D4] flex justify-between items-baseline font-bold text-[#2B2B2B]">
                  <span className="text-sm uppercase tracking-wider">Grand Total</span>
                  <span className="text-xl font-mono text-[#E11D48] tabular-nums font-extrabold">
                    {formatBDT(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Order CTA (Strictly zero radius) */}
              <button
                type="button"
                disabled={loading || !selectedAddressId}
                onClick={handlePlaceOrder}
                className="rounded-none w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>
                  {loading
                    ? 'Creating Order...'
                    : paymentMethod === 'SSLCOMMERZ'
                    ? `Pay with SSLCOMMERZ • ${formatBDT(grandTotal)}`
                    : `Place Order • ${formatBDT(grandTotal)}`}
                </span>
              </button>

              <div className="pt-2 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Deshi commerce Escrow Protection Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SSLCommerz Modal for Online Payment */}
      {pendingOrder && (
        <SSLCommerzModal
          order={pendingOrder}
          isOpen={isSSLModalOpen}
          onSuccess={handleSSLSuccess}
          onCancel={() => {
            setIsSSLModalOpen(false);
            showToast('Payment cancelled. Order remains pending in My Orders.', 'info');
            viewOrderDetail(pendingOrder.id);
          }}
        />
      )}
    </div>
  );
};
