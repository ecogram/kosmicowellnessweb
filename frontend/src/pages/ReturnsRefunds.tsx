import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Clock } from 'lucide-react';
import { useMyRefunds, useMyReturns, type RefundItem, type ReturnItem } from '../hooks/useRefunds';
import { formatINR } from '../utils/currency';

export function ReturnsRefunds() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'refunds' | 'replacements'>('refunds');

  const { data: refunds = [], isLoading: isRefundsLoading } = useMyRefunds();
  const { data: replacements = [], isLoading: isReturnsLoading } = useMyReturns();

  const isLoading = activeTab === 'refunds' ? isRefundsLoading : isReturnsLoading;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('PROCESSED') || s.includes('COMPLETED') || s.includes('SUCCESS')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Completed
        </span>
      );
    }
    if (s.includes('REJECT') || s.includes('CANCEL')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          Declined
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
        Initiated
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f7f3] flex flex-col">
      {/* Top Header matching Mobile Screenshot */}
      <div className="bg-[#f1f7f3] border-b border-neutral-200/60 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="p-2 -ml-2 rounded-full text-neutral-800 hover:bg-black/5 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-900" />
          </button>

          <h1 className="font-serif font-bold text-lg md:text-xl text-neutral-900 absolute left-1/2 -translate-x-1/2">
            Returns &amp; Refunds
          </h1>

          <div className="w-9" /> {/* balance spacing */}
        </div>

        {/* Two Tabs: Refunds | Replacements */}
        <div className="max-w-2xl mx-auto px-4 flex">
          <button
            type="button"
            onClick={() => setActiveTab('refunds')}
            className={`flex-1 py-3 text-sm font-semibold transition-all text-center relative cursor-pointer ${
              activeTab === 'refunds'
                ? 'text-[#0a7a40] font-bold'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Refunds
            {activeTab === 'refunds' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.75 bg-[#0a7a40] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('replacements')}
            className={`flex-1 py-3 text-sm font-semibold transition-all text-center relative cursor-pointer ${
              activeTab === 'replacements'
                ? 'text-[#0a7a40] font-bold'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Replacements
            {activeTab === 'replacements' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.75 bg-[#0a7a40] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col justify-start">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            <span className="text-xs font-medium">Checking {activeTab}...</span>
          </div>
        ) : activeTab === 'refunds' ? (
          /* REFUNDS TAB */
          refunds.length === 0 ? (
            /* EXACT EMPTY STATE MATCHING SCREENSHOT */
            <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center p-6 select-none">
              {/* Custom SVG Icon matching the exact empty icon in the screenshot */}
              <div className="w-14 h-18 rounded-md border-2 border-neutral-300/80 bg-white/40 flex flex-col items-center justify-center relative mb-4 shadow-2xs">
                {/* Top notch */}
                <div className="w-5 h-1 bg-neutral-300 rounded-b-sm absolute top-0" />
                {/* Exclamation Mark [ ! ] */}
                <div className="flex flex-col items-center justify-center gap-1 mt-1">
                  <div className="w-1 h-4 bg-neutral-300 rounded-full" />
                  <div className="w-1 h-1 bg-neutral-300 rounded-full" />
                </div>
              </div>

              <p className="text-sm font-normal text-neutral-500">
                No active refunds found
              </p>
            </div>
          ) : (
            /* REFUNDS LIST FROM API */
            <div className="space-y-3.5 py-3">
              {refunds.map((ref: RefundItem) => (
                <div
                  key={ref.refundId || ref.orderNumber}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs space-y-3 transition-all hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">
                        {ref.refundId || 'Refund Request'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Order #{ref.orderNumber}
                      </span>
                    </div>
                    {getStatusBadge(ref.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Refund Amount
                      </span>
                      <span className="text-base font-bold text-neutral-900">
                        {formatINR(ref.amount || 0)}
                      </span>
                    </div>

                    {ref.date && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                          Requested On
                        </span>
                        <span className="text-xs text-neutral-600 font-medium flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {formatDate(ref.date)}
                        </span>
                      </div>
                    )}
                  </div>

                  {ref.reason && (
                    <div className="p-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-700">Reason: </span>
                      {ref.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* REPLACEMENTS TAB */
          replacements.length === 0 ? (
            /* EXACT EMPTY STATE MATCHING SCREENSHOT */
            <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="w-14 h-18 rounded-md border-2 border-neutral-300/80 bg-white/40 flex flex-col items-center justify-center relative mb-4 shadow-2xs">
                <div className="w-5 h-1 bg-neutral-300 rounded-b-sm absolute top-0" />
                <div className="flex flex-col items-center justify-center gap-1 mt-1">
                  <div className="w-1 h-4 bg-neutral-300 rounded-full" />
                  <div className="w-1 h-1 bg-neutral-300 rounded-full" />
                </div>
              </div>

              <p className="text-sm font-normal text-neutral-500">
                No active replacements found
              </p>
            </div>
          ) : (
            /* REPLACEMENTS LIST FROM API */
            <div className="space-y-3.5 py-3">
              {replacements.map((ret: ReturnItem) => (
                <div
                  key={ret.returnId || ret.orderNumber}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs space-y-3 transition-all hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">
                        {ret.returnId || 'Replacement Request'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Order #{ret.orderNumber}
                      </span>
                    </div>
                    {getStatusBadge(ret.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                        Type
                      </span>
                      <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-800" />
                        Replacement / Return
                      </span>
                    </div>

                    {ret.date && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                          Requested On
                        </span>
                        <span className="text-xs text-neutral-600 font-medium flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {formatDate(ret.date)}
                        </span>
                      </div>
                    )}
                  </div>

                  {ret.reason && (
                    <div className="p-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-700">Reason: </span>
                      {ret.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
