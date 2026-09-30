import React from 'react';
import { formatBDT } from '../../../data/bangladeshGeo';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Truck,
  Users,
} from 'lucide-react';

interface Props {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyGrowthRate: number;
  ordersFulfilledRate: number;
  onFilterPendingOrders?: () => void;
  onFilterLowStock?: () => void;
}

export const AdminKpiCards: React.FC<Props> = ({
  totalRevenue,
  totalOrders,
  totalUnitsSold,
  averageOrderValue,
  pendingOrders,
  lowStockProducts,
  monthlyGrowthRate,
  ordersFulfilledRate,
  onFilterPendingOrders,
  onFilterLowStock,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
          {formatBDT(totalRevenue)}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+{monthlyGrowthRate}% vs prev period</span>
        </div>
      </div>

      {/* 2. Total Sales / Units */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Units Sold
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
          {totalUnitsSold.toLocaleString()} Units
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium">
          Across {totalOrders} customer checkouts
        </div>
      </div>

      {/* 3. Total Orders */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Orders
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
          {totalOrders} Orders
        </div>
        <div className="text-[11px] text-indigo-700 font-semibold mt-2">
          {ordersFulfilledRate}% fulfillment rate
        </div>
      </div>

      {/* 4. Average Order Value (AOV) */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Avg Order Value
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-slate-900 mt-2 tabular-nums">
          {formatBDT(averageOrderValue)}
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium">
          Per customer transaction
        </div>
      </div>

      {/* 5. Pending Dispatch */}
      <div
        onClick={onFilterPendingOrders}
        className={`bg-white p-4 rounded-xl border transition-all ${
          pendingOrders > 0
            ? 'border-rose-200 hover:border-rose-300 cursor-pointer bg-rose-50/20'
            : 'border-[#E2E8F0]'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Pending Dispatch
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-rose-600 mt-2 tabular-nums">
          {pendingOrders} Orders
        </div>
        <div className="text-[11px] text-rose-600 font-semibold mt-2 underline flex items-center gap-1">
          {pendingOrders > 0 ? 'Click to assign couriers' : 'All dispatched'}
        </div>
      </div>

      {/* 6. Low Stock Alert */}
      <div
        onClick={onFilterLowStock}
        className={`bg-white p-4 rounded-xl border transition-all ${
          lowStockProducts > 0
            ? 'border-amber-200 hover:border-amber-300 cursor-pointer bg-amber-50/20'
            : 'border-[#E2E8F0]'
        } shadow-xs`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Low Stock Alert
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black font-mono text-amber-700 mt-2 tabular-nums">
          {lowStockProducts} Products
        </div>
        <div className="text-[11px] text-amber-700 font-semibold mt-2 underline">
          {lowStockProducts > 0 ? 'Restock needed (<= 5 units)' : 'Inventory optimal'}
        </div>
      </div>
    </div>
  );
};
