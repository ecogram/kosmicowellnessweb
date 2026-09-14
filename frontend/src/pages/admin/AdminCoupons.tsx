import { useState } from 'react';
import { 
  useAdminCoupons, 
  useAdminCreateCoupon, 
  useAdminUpdateCoupon, 
  useAdminDeleteCoupon,
} from '../../hooks/useAdmin';
import type { AdminCoupon } from '../../hooks/useAdmin';
import { Tag, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AdminCoupons() {
  const { data: coupons, isLoading, error } = useAdminCoupons();
  const createMutation = useAdminCreateCoupon();
  const updateMutation = useAdminUpdateCoupon();
  const deleteMutation = useAdminDeleteCoupon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  
  // Form State matching the Mobile App design
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiryDate(d.toISOString().split('T')[0]);
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: AdminCoupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount || '');
    setExpiryDate(c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '');
    setDescription(c.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim()) {
      setFormError('Please enter a valid coupon code');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setFormError('Please enter a valid discount value');
      return;
    }

    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({
          id: editingCoupon._id,
          data: {
            code: code.trim().toUpperCase(),
            discountType,
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            expiresAt: expiryDate,
            description,
          },
        });
      } else {
        await createMutation.mutateAsync({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount) || 0,
          expiresAt: expiryDate,
          description,
          isActive: true,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save coupon. Please try again.');
    }
  };

  const handleToggleActive = async (coupon: AdminCoupon) => {
    try {
      await updateMutation.mutateAsync({
        id: coupon._id,
        data: { isActive: !coupon.isActive },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0a7a40] flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-neutral-900">Coupon Management</h1>
            <p className="text-sm text-neutral-500">Create, configure, and monitor discount codes for customers</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-[#0a7a40] rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load coupons. Please ensure the backend is running.</span>
        </div>
      ) : coupons?.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
          <Tag className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
          <h3 className="text-lg font-bold text-neutral-800">No coupons found</h3>
          <p className="text-sm text-neutral-500 mb-6">Create your first promotion code to boost store orders.</p>
          <Button onClick={openCreateModal} variant="solid">Create First Coupon</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons?.map((coupon) => (
            <div 
              key={coupon._id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                coupon.isActive ? 'border-emerald-200' : 'border-neutral-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 bg-emerald-50 text-[#0a7a40] font-mono font-black text-base rounded-xl border border-emerald-200">
                      {coupon.code}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    coupon.isActive ? 'bg-emerald-100 text-[#0a7a40]' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-2xl font-black text-neutral-900 mb-2 flex items-center gap-1">
                  {coupon.discountType === 'percentage' ? (
                    <>
                      <span>{coupon.discountValue}%</span>
                      <span className="text-xs font-bold text-neutral-500 uppercase">OFF</span>
                    </>
                  ) : (
                    <>
                      <span>₹{coupon.discountValue}</span>
                      <span className="text-xs font-bold text-neutral-500 uppercase">FLAT OFF</span>
                    </>
                  )}
                </div>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {coupon.description || 'Valid on all eligible cart items'}
                </p>

                <div className="space-y-1.5 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <strong className="text-neutral-700">₹{coupon.minOrderAmount || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <strong className="text-neutral-700">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(coupon)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    coupon.isActive 
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' 
                      : 'text-[#0a7a40] bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(coupon)}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW / EDIT COUPON MODAL (EXACT SPEC MATCH FROM SCREENSHOT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#f4f7f4] w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-neutral-200/80 relative text-neutral-900">
            
            {/* Modal Title */}
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 font-sans">
              {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Coupon Code Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Coupon Code (e.g. WELCOME...)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors"
                  required
                />
              </div>

              {/* 2. Discount Type Select */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* 3. Percentage or Discount Amount */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  {discountType === 'percentage' ? 'Percentage' : 'Discount Amount (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors"
                  required
                />
              </div>

              {/* 4. Min Order Amount */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 299"
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors"
                />
              </div>

              {/* 5. Expiry Date */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Expiry Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* 6. Description (Internal / Customer-facing) */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Description (Internal)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Get 10% Instant discount on your order"
                  className="w-full bg-transparent border-b border-neutral-400 focus:border-[#0a7a40] py-2 text-base font-semibold text-neutral-900 outline-none transition-colors"
                />
              </div>

              {formError && (
                <p className="text-red-600 text-xs font-medium pt-1">{formError}</p>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-neutral-600 hover:text-neutral-900 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 bg-[#eaf4eb] hover:bg-[#d8eed9] text-[#0a7a40] border border-emerald-300 font-bold text-sm rounded-full shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
