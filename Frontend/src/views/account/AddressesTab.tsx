import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit3, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
import { Address } from '../../types';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshGeo';

export const AddressesTab: React.FC = () => {
  const { user, showToast } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: '',
    streetAddress: '',
    type: 'HOME' as 'HOME' | 'OFFICE',
    isDefault: false,
  });

  useEffect(() => {
    apiService.addresses.getAll().then((res) => {
      setAddresses(res.data);
    });
  }, []);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: '',
      streetAddress: '',
      type: 'HOME',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      division: addr.division || 'Dhaka',
      district: addr.district || 'Dhaka',
      upazila: addr.upazila || '',
      streetAddress: addr.streetAddress || '',
      type: addr.type || 'HOME',
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim()) {
      showToast('Recipient full name is required', 'error');
      return;
    }
    if (!addressForm.phone.trim() || addressForm.phone.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please enter a valid Bangladesh contact mobile number', 'error');
      return;
    }
    if (!addressForm.streetAddress.trim()) {
      showToast('Street address / House / Road details are required', 'error');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await apiService.addresses.update(editingAddress.id, addressForm);
        showToast('Delivery address updated successfully!', 'success');
      } else {
        await apiService.addresses.create(addressForm);
        showToast('New delivery address added successfully!', 'success');
      }
      const res = await apiService.addresses.getAll();
      setAddresses(res.data);
      setIsAddressModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await apiService.addresses.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Address deleted successfully', 'info');
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      await apiService.addresses.update(addr.id, { isDefault: true });
      const res = await apiService.addresses.getAll();
      setAddresses(res.data);
      showToast('Default delivery address updated', 'success');
    } catch {
      showToast('Failed to set default address', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Your Delivery Addresses</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage shipping addresses across all 64 districts in Bangladesh for one-click checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddAddress}
          className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
            <MapPin className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">No Delivery Address Saved Yet</h4>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Add your home or office address to ensure quick and smooth doorstep parcel delivery.
          </p>
          <button
            type="button"
            onClick={handleOpenAddAddress}
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + Add First Delivery Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                addr.isDefault ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                    <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-md uppercase tracking-wider border border-slate-200">
                      {addr.type || 'HOME'}
                    </span>
                  </div>
                  {addr.isDefault ? (
                    <span className="text-[10px] font-bold text-white bg-[#0F172A] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                      Default Address
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline font-semibold cursor-pointer uppercase tracking-wider"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600 mt-1">{addr.phone}</div>
                <div className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">{addr.streetAddress}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  {addr.upazila ? `${addr.upazila}, ` : ''}{addr.district}, {addr.division}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditAddress(addr)}
                  className="text-xs font-bold text-slate-700 hover:text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Update / Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELIVERY ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {editingAddress ? 'Update Delivery Address' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 01700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Division *
                  </label>
                  <select
                    value={addressForm.division}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === newDiv);
                      const firstDist = divObj?.districts[0] || 'Dhaka';
                      setAddressForm({
                        ...addressForm,
                        division: newDiv,
                        district: firstDist,
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none cursor-pointer"
                  >
                    {(
                      BANGLADESH_DIVISIONS.find((d) => d.name === addressForm.division)?.districts || [
                        'Dhaka',
                      ]
                    ).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thana / Upazila / Area *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.upazila}
                  onChange={(e) => setAddressForm({ ...addressForm, upazila: e.target.value })}
                  placeholder="e.g. Dhanmondi, Gulshan, Uttara, Sadar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address / House / Road Details *
                </label>
                <textarea
                  rows={2}
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  placeholder="House #, Road #, Sector/Block, Flat/Floor details"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Address Type & Default */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Type:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type: 'HOME' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        addressForm.type === 'HOME'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type: 'OFFICE' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        addressForm.type === 'OFFICE'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Office
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#0F172A]"
                  />
                  <span className="text-xs text-slate-700 font-semibold">Set as default</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  {isSavingAddress ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
