import { Check, Sparkles, Flame } from 'lucide-react';

export interface BundleOption {
  id: string;
  name: string;
  quantity: number;
  price: number;
  badge?: string;
  unitPrice: string;
  isPopular?: boolean;
}

const bundles: BundleOption[] = [
  {
    id: 'single',
    name: 'Single Pack (250ml Bottle)',
    quantity: 1,
    price: 387,
    unitPrice: '₹387 / pack'
  },
  {
    id: 'twin',
    name: 'Pack of 2 (500ml Total)',
    quantity: 2,
    price: 699,
    badge: 'TWIN PACK',
    unitPrice: '₹349.5 / pack',
    isPopular: true
  },
  {
    id: 'family',
    name: 'Family 3-Pack (750ml Total)',
    quantity: 3,
    price: 999,
    badge: 'FAMILY PACK',
    unitPrice: '₹333 / pack'
  }
];

interface VisualBundlesProps {
  selectedBundleId: string;
  onSelectBundle: (bundle: BundleOption) => void;
}

export function VisualBundles({ selectedBundleId, onSelectBundle }: VisualBundlesProps) {
  return (
    <div className="space-y-3 my-5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Select Pack Quantity</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bundles.map((bundle) => {
          const isSelected = selectedBundleId === bundle.id;

          return (
            <div
              key={bundle.id}
              onClick={() => onSelectBundle(bundle)}
              className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-border bg-surface hover:border-primary/40'
              }`}
            >
              {bundle.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs flex items-center gap-1 ${
                    bundle.isPopular ? 'bg-accent' : 'bg-primary'
                  }`}
                >
                  {bundle.isPopular && <Flame className="w-3 h-3 fill-white" />}
                  {bundle.badge}
                </span>
              )}

              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-sm text-text-main">
                    {bundle.name}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <p className="text-[11px] text-text-muted font-medium">
                  {bundle.unitPrice}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/60">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-lg font-bold text-primary">
                    ₹{bundle.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
