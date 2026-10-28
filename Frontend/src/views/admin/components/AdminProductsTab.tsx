import React, { useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Product, Category } from '../../../types';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  products: Product[];
  categories: Category[];
  productSearch: string;
  onProductSearchChange: (val: string) => void;
  productCategoryFilter: string;
  onProductCategoryFilterChange: (catId: string) => void;
  productStockFilter: string;
  onProductStockFilterChange: (stock: string) => void;
  onUploadClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
  onStockQuickAdjust: (productId: string, delta: number) => void;
}

export const AdminProductsTab: React.FC<Props> = ({
  products,
  categories,
  productSearch,
  onProductSearchChange,
  productCategoryFilter,
  onProductCategoryFilterChange,
  productStockFilter,
  onProductStockFilterChange,
  onUploadClick,
  onEditProduct,
  onDeleteProduct,
  onStockQuickAdjust,
}) => {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== 'ALL' && p.categoryId !== productCategoryFilter) return false;
      if (productStockFilter === 'LOW_STOCK' && p.stock > 5) return false;
      if (productStockFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;
      if (productStockFilter === 'IN_STOCK' && p.stock <= 0) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productCategoryFilter, productStockFilter, productSearch]);

  return (
    <div className="space-y-4">
      {/* Search and Slicer Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => onProductSearchChange(e.target.value)}
            placeholder="Search products by title, SKU, brand..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Slicers: Category & Stock status */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Category Slicer */}
          <select
            value={productCategoryFilter}
            onChange={(e) => onProductCategoryFilterChange(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-700"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Level Slicer */}
          <select
            value={productStockFilter}
            onChange={(e) => onProductStockFilterChange(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-700"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt; 0)</option>
            <option value="LOW_STOCK">Low Stock Alert (&le; 5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>

          <button
            type="button"
            onClick={onUploadClick}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item &amp; Image</th>
                <th className="py-3 px-4">Category &amp; Brand</th>
                <th className="py-3 px-4">Buying Cost</th>
                <th className="py-3 px-4">Selling / Offer Price</th>
                <th className="py-3 px-4">Profit / Unit (Margin)</th>
                <th className="py-3 px-4">Stock Level (Quick Adjust)</th>
                <th className="py-3 px-4">Status &amp; Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const effectiveSellingPrice = p.discountPrice || p.price;
                  const buyingCost = p.buyingPrice || 0;
                  const unitProfit = buyingCost > 0 ? effectiveSellingPrice - buyingCost : 0;
                  const profitMargin = buyingCost > 0 ? Math.round((unitProfit / effectiveSellingPrice) * 100) : null;
                  const isLoss = unitProfit < 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              SKU: {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {p.categoryName || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.brand}
                        </span>
                      </td>

                      {/* Buying Cost Column */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {buyingCost > 0 ? (
                          formatBDT(buyingCost)
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px] font-normal italic">
                            Not set
                          </span>
                        )}
                      </td>

                      {/* Selling / Offer Price */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">
                          {formatBDT(effectiveSellingPrice)}
                        </span>
                        {p.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatBDT(p.price)}
                          </span>
                        )}
                      </td>

                      {/* Profit / Unit (Margin %) */}
                      <td className="py-3 px-4">
                        {buyingCost > 0 ? (
                          <div>
                            <span className={`font-mono font-bold block ${isLoss ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {isLoss ? '-' : '+'}{formatBDT(Math.abs(unitProfit))}
                            </span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                              isLoss ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {profitMargin !== null ? `${profitMargin}% margin` : '0%'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStockQuickAdjust(p.id, -1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            p.stock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-900'
                          }`}>
                            {p.stock} units
                          </span>
                          <button
                            type="button"
                            onClick={() => onStockQuickAdjust(p.id, +1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {p.isAvailable ? 'Active In Store' : 'Draft / Hidden'}
                        </span>
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                          &#9733; {p.rating || 4.8} ({p.reviewCount || 12})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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
