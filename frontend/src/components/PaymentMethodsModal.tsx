import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  AtSign,
  Info,
  ShieldCheck,
  Trash2,
  Check,
  Loader2,
  MoreHorizontal,
  CheckCircle2,
  Edit3,
  QrCode
} from 'lucide-react';
import {
  useSavedPaymentMethods,
  useSavePaymentMethod,
  useDeletePaymentMethod,
  useUpdatePaymentMethod,
  type SavedPaymentMethod
} from '../hooks/usePayments';
import toast from 'react-hot-toast';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethodId?: string | null;
  onSelectMethod?: (method: SavedPaymentMethod) => void;
  isSelectionMode?: boolean;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  selectedMethodId,
  onSelectMethod,
  isSelectionMode = false,
}) => {
  const [viewStep, setViewStep] = useState<'LIST' | 'FORM'>('LIST');
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Bottom action sheet state (Matches Image 2)
  const [activeActionMethod, setActiveActionMethod] = useState<SavedPaymentMethod | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const { data: savedMethods = [], isLoading } = useSavedPaymentMethods();
  const savePaymentMutation = useSavePaymentMethod();
  const deletePaymentMutation = useDeletePaymentMethod();
  const updatePaymentMutation = useUpdatePaymentMethod();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewStep('LIST');
      setEditingMethodId(null);
      setDisplayName('');
      setUpiId('');
      setIsDefault(false);
      setIsActionMenuOpen(false);
      setActiveActionMethod(null);
    }
  }, [isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingMethodId(null);
    setDisplayName('');
    setUpiId('');
    setIsDefault(savedMethods.length === 0);
    setViewStep('FORM');
  };

  const handleStartEdit = (m: SavedPaymentMethod) => {
    setIsActionMenuOpen(false);
    setEditingMethodId(m._id || m.id || null);
    setDisplayName(m.displayName || '');
    setUpiId(m.upiId || '');
    setIsDefault(!!m.isDefault);
    setViewStep('FORM');
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = upiId.trim();
    if (!cleanUpi) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    try {
      if (editingMethodId) {
        // Edit existing payment method
        await updatePaymentMutation.mutateAsync({
          methodId: editingMethodId,
          payload: {
            displayName: displayName.trim() || 'UPI Account',
            upiId: cleanUpi,
            isDefault,
          },
        });
        toast.success('Payment method updated successfully!');
      } else {
        // Create new payment method
        const saved = await savePaymentMutation.mutateAsync({
          type: 'UPI',
          displayName: displayName.trim() || 'UPI Account',
          upiId: cleanUpi,
          isDefault: isDefault || savedMethods.length === 0,
        });

        toast.success('Payment method saved successfully!');

        if (onSelectMethod) {
          onSelectMethod({
            _id: saved?._id || saved?.id || cleanUpi,
            id: saved?._id || saved?.id || cleanUpi,
            type: 'UPI',
            displayName: displayName.trim() || 'UPI Account',
            upiId: cleanUpi,
            isDefault: isDefault || savedMethods.length === 0,
          });
        }
      }

      setEditingMethodId(null);
      setDisplayName('');
      setUpiId('');
      setIsDefault(false);
      setViewStep('LIST');
    } catch (err: any) {
      console.error('Failed to save payment method:', err);
      toast.error(err?.response?.data?.message || 'Failed to save payment method. Please check your UPI ID.');
    }
  };

  const handleDelete = async (id: string) => {
    setIsActionMenuOpen(false);
    try {
      await deletePaymentMutation.mutateAsync(id);
      toast.success('Payment method removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsActionMenuOpen(false);
    try {
      await updatePaymentMutation.mutateAsync({
        methodId: id,
        payload: { isDefault: true },
      });
      toast.success('Default payment method updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to set as default');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
    >
      {/* Full Size Card View Container (Matches user request for full size) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl md:max-w-2xl bg-[#f4f7f4] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 flex flex-col h-[90vh] max-h-[850px] animate-in zoom-in-95 duration-200 overscroll-contain relative"
      >
        {/* VIEW 1: SAVED METHODS LIST & GREEN CARDS (Matches Image 1) */}
        {viewStep === 'LIST' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar: Back Arrow + Serif Title */}
            <div className="px-6 py-4.5 border-b border-neutral-200/70 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-neutral-900 tracking-tight">
                Payment Methods
              </h2>
              <div className="w-10" />
            </div>

            {/* Scrollable Body: Full Size Layout */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 overscroll-contain flex-1 [scrollbar-width:thin]">
              {/* Sub-header row: Saved Methods & + Add New */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="font-bold text-base md:text-lg text-neutral-900">Saved Methods</h3>
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="text-sm font-bold text-[#0a7a40] hover:text-[#086333] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  + Add New
                </button>
              </div>

              {/* Loader */}
              {isLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a7a40]" />
                </div>
              ) : savedMethods.length === 0 ? (
                /* Empty State (Matches initial state before adding) */
                <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-24 h-16 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col justify-between p-3 mx-auto opacity-75">
                    <div className="w-6 h-3 bg-neutral-300 rounded-sm" />
                    <div className="w-full h-2 bg-neutral-200 rounded-full" />
                  </div>
                  <h4 className="font-bold text-base text-neutral-800 mt-5">
                    No Payment Methods Added
                  </h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    Add a UPI ID to get started
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="mt-5 px-5 py-2.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    + Add New Payment Method
                  </button>
                </div>
              ) : (
                /* Saved Methods: Full Size Emerald Green Cards (Matches Image 1) */
                <div className="space-y-4">
                  {savedMethods.map((m) => {
                    const isSelected = selectedMethodId === (m._id || m.id);
                    return (
                      <div
                        key={m._id || m.id || m.upiId}
                        onClick={() => {
                          if (isSelectionMode && onSelectMethod) {
                            onSelectMethod(m);
                            onClose();
                          }
                        }}
                        className={`relative overflow-hidden rounded-3xl bg-[#0e7440] p-6 text-white shadow-xl transition-all cursor-pointer group ${
                          isSelected ? 'ring-4 ring-[#0a7a40]/30 shadow-2xl scale-[1.01]' : 'hover:shadow-2xl'
                        }`}
                      >
                        {/* Decorative background translucent geometry */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-black/10 pointer-events-none" />

                        {/* Card Top Row: UPI Badge + Three Dots Button */}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold tracking-wide">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>UPI</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMethod(m);
                              setIsActionMenuOpen(true);
                            }}
                            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                            aria-label="Card options"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Card Middle: UPI ID in Large Bold Font */}
                        <div className="relative z-10 my-6">
                          <p className="text-xl md:text-2xl font-bold tracking-wide font-sans text-white select-all break-all">
                            {m.upiId}
                          </p>
                        </div>

                        {/* Card Bottom Row: Display Name & Default/Selected Tag */}
                        <div className="relative z-10 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">
                              DISPLAY NAME
                            </span>
                            <p className="text-sm md:text-base font-bold uppercase tracking-wide text-white">
                              {m.displayName || 'UPI ACCOUNT'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelectionMode && isSelected && (
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0e7440] text-[10px] font-black uppercase tracking-wider shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>SELECTED</span>
                              </div>
                            )}

                            {m.isDefault && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider text-white">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                                <span>DEFAULT</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Security Card (Matches Image 1) */}
              <div className="p-4.5 rounded-2xl bg-[#eef7f0] border border-emerald-100 flex items-center gap-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-[#0a7a40]/10 text-[#0a7a40] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#0a7a40]" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-neutral-900">Secure Payments</h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Your payment details are encrypted and stored securely.
                  </p>
                </div>
              </div>
            </div>

            {/* ACTION SHEET BOTTOM DRAWER (Matches Image 2) */}
            {isActionMenuOpen && activeActionMethod && (
              <div
                onClick={() => setIsActionMenuOpen(false)}
                className="absolute inset-0 z-40 bg-black/40 backdrop-blur-2xs flex items-end justify-center animate-in fade-in duration-150"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#f4f7f4] rounded-t-3xl p-5 shadow-2xl border-t border-neutral-200 animate-in slide-in-from-bottom duration-200 space-y-2"
                >
                  {/* Option 1: Set as Default */}
                  {!activeActionMethod.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(activeActionMethod._id || activeActionMethod.id || '')}
                      className="w-full p-3.5 rounded-2xl bg-white hover:bg-neutral-50 flex items-center gap-3.5 text-neutral-800 font-semibold text-sm transition-colors cursor-pointer text-left shadow-2xs"
                    >
                      <CheckCircle2 className="w-5 h-5 text-neutral-800" />
                      <span>Set as Default</span>
                    </button>
                  )}

                  {/* Option 2: Edit Details */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(activeActionMethod)}
                    className="w-full p-3.5 rounded-2xl bg-white hover:bg-neutral-50 flex items-center gap-3.5 text-neutral-800 font-semibold text-sm transition-colors cursor-pointer text-left shadow-2xs"
                  >
                    <Edit3 className="w-5 h-5 text-neutral-800" />
                    <span>Edit Details</span>
                  </button>

                  {/* Option 3: Remove Method */}
                  <button
                    type="button"
                    onClick={() => handleDelete(activeActionMethod._id || activeActionMethod.id || '')}
                    className="w-full p-3.5 rounded-2xl bg-white hover:bg-red-50/50 flex items-center gap-3.5 text-rose-600 font-semibold text-sm transition-colors cursor-pointer text-left shadow-2xs"
                  >
                    <Trash2 className="w-5 h-5 text-rose-500" />
                    <span>Remove Method</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ADD / EDIT PAYMENT METHOD FORM */}
        {viewStep === 'FORM' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar: Back Arrow + Serif Title */}
            <div className="px-6 py-4.5 border-b border-neutral-200/70 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={() => setViewStep('LIST')}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                aria-label="Back to methods list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-neutral-900 tracking-tight">
                {editingMethodId ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
              <div className="w-10" />
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSaveDetails}
              className="p-6 md:p-8 overflow-y-auto space-y-5 overscroll-contain flex-1 [scrollbar-width:thin]"
            >
              {/* UPI Details Section Header */}
              <h3 className="font-bold text-base text-neutral-900">UPI Details</h3>

              {/* Display Name Input with User Icon */}
              <div className="flex items-center px-4.5 py-3.5 bg-white rounded-2xl border border-neutral-300 focus-within:border-[#0a7a40] focus-within:ring-2 focus-within:ring-[#0a7a40]/10 transition-all gap-3.5 shadow-xs">
                <User className="w-5 h-5 text-[#0a7a40] shrink-0" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
              </div>

              {/* UPI ID Input with @ Icon */}
              <div className="flex items-center px-4.5 py-3.5 bg-white rounded-2xl border border-neutral-300 focus-within:border-[#0a7a40] focus-within:ring-2 focus-within:ring-[#0a7a40]/10 transition-all gap-3.5 shadow-xs">
                <AtSign className="w-5 h-5 text-[#0a7a40] shrink-0" />
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="UPI ID (e.g. name@bank)"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
              </div>

              {/* Amber Warning / Alert Banner */}
              <div className="p-4 rounded-2xl bg-[#fef8e7] border border-[#f5e4b2] flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-[#a16207] font-medium leading-relaxed">
                  Ensure your UPI ID is correct to avoid payment failures.
                </p>
              </div>

              {/* Set as Default Method Toggle Row */}
              <div className="flex items-center justify-between pt-2">
                <span
                  onClick={() => setIsDefault(!isDefault)}
                  className="text-sm md:text-base font-semibold text-neutral-800 cursor-pointer select-none"
                >
                  Set as Default Method
                </span>
                <div
                  onClick={() => setIsDefault(!isDefault)}
                  className={`w-12 h-6.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    isDefault ? 'bg-[#0a7a40]' : 'bg-neutral-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5.5 h-5.5 rounded-full shadow-md transform transition-transform ${
                      isDefault ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Save Details Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savePaymentMutation.isPending || updatePaymentMutation.isPending}
                  className="w-full py-4 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm md:text-base rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savePaymentMutation.isPending || updatePaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <span>Save Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
