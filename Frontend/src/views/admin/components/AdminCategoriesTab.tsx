import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { Category, Product } from '../../../types';

interface Props {
  categories: Category[];
  products: Product[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
}

export const AdminCategoriesTab: React.FC<Props> = ({
  categories,
  products,
  onAddCategory,
  onEditCategory,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Store Product Categories</h3>
          <p className="text-xs text-slate-500">
            Organize catalog inventory by assigning products to structured retail categories
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCategory}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {count} Products
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-3">{c.name}</h4>
                {c.nameBn && <p className="text-xs text-slate-500">{c.nameBn}</p>}
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">/{c.slug}</span>
                <button
                  type="button"
                  onClick={() => onEditCategory(c)}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
