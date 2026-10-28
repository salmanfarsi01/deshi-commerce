import React, { useMemo } from 'react';
import { HelpCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { FAQItem } from '../../../types';

interface Props {
  faqsList: FAQItem[];
  faqCategoryFilter: string;
  onFaqCategoryFilterChange: (cat: string) => void;
  onAddFaq: () => void;
  onEditFaq: (faq: FAQItem) => void;
  onDeleteFaq: (id: string, question: string) => void;
}

export const AdminFaqsTab: React.FC<Props> = ({
  faqsList,
  faqCategoryFilter,
  onFaqCategoryFilterChange,
  onAddFaq,
  onEditFaq,
  onDeleteFaq,
}) => {
  const filteredFaqs = useMemo(() => {
    return faqsList.filter((f) => {
      if (faqCategoryFilter !== 'ALL' && f.category !== faqCategoryFilter) return false;
      return true;
    });
  }, [faqsList, faqCategoryFilter]);

  const categoryBadgeColor: Record<string, string> = {
    delivery: 'bg-blue-100 text-blue-800',
    payment: 'bg-emerald-100 text-emerald-800',
    returns: 'bg-amber-100 text-amber-800',
    warranty: 'bg-purple-100 text-purple-800',
    general: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Store FAQs &amp; Help Center</h3>
              <p className="text-xs text-slate-500">
                Add, update, or delete FAQ questions. Any change saved here immediately updates on the customer storefront.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddFaq}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add FAQ Question</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `All FAQs (${faqsList.length})` },
          { key: 'delivery', label: 'Delivery & Shipping' },
          { key: 'payment', label: 'Payment & COD' },
          { key: 'returns', label: 'Returns & Replacement' },
          { key: 'warranty', label: 'Warranty & Guarantee' },
          { key: 'general', label: 'General' },
        ].map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => onFaqCategoryFilterChange(pill.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              faqCategoryFilter === pill.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* FAQs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaqs.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
            No FAQ questions found in this category. Click "+ Add FAQ Question" to create one.
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      categoryBadgeColor[faq.category] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {faq.category}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Active on storefront
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                {faq.questionBn && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{faq.questionBn}</p>
                )}

                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
                {faq.answerBn && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-1.5">
                    {faq.answerBn}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400">ID: {faq.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditFaq(faq)}
                    className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-md font-semibold text-xs cursor-pointer flex items-center gap-1 border border-blue-200"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFaq(faq.id, faq.question)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer border border-rose-200"
                    title="Delete FAQ question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
