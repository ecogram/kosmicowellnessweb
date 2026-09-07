import React, { useState } from 'react';
import { Truck, CheckCircle2, AlertCircle, MapPin, ShieldCheck } from 'lucide-react';

export function PincodeEstimator() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    eta?: string;
    city?: string;
    message?: string;
  }>({ status: 'idle' });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();

    if (!/^\d{6}$/.test(cleanPin)) {
      setResult({
        status: 'error',
        message: 'Please enter a valid 6-digit Indian Pincode.'
      });
      return;
    }

    setResult({ status: 'loading' });

    setTimeout(() => {
      // Fast delivery estimation logic based on pincode regions
      const firstDigit = cleanPin[0];
      let days = '2-3';
      let location = 'Metro Zone';

      if (['1', '2', '3', '4'].includes(firstDigit)) {
        days = '2-3';
        location = 'Express Corridor';
      } else if (['5', '6', '7'].includes(firstDigit)) {
        days = '3-4';
        location = 'Standard Region';
      } else {
        days = '4-5';
        location = 'Special Region';
      }

      // Format estimated date
      const today = new Date();
      const etaDateMin = new Date(today);
      etaDateMin.setDate(today.getDate() + parseInt(days[0]));
      const etaDateMax = new Date(today);
      etaDateMax.setDate(today.getDate() + parseInt(days[2]));

      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
      const formattedEta = `${etaDateMin.toLocaleDateString('en-IN', options)} - ${etaDateMax.toLocaleDateString('en-IN', options)}`;

      setResult({
        status: 'success',
        eta: formattedEta,
        city: location,
      });
    }, 600);
  };

  return (
    <div className="bg-surface-secondary/60 border border-border rounded-2xl p-4 my-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-text-main uppercase tracking-wider">
          Delivery & Cash on Delivery Estimator
        </span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Pincode (e.g. 110001)"
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={result.status === 'loading'}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
        >
          {result.status === 'loading' ? 'Checking...' : 'Check ETA'}
        </button>
      </form>

      {result.status === 'error' && (
        <div className="flex items-center gap-1.5 text-xs text-error mt-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{result.message}</span>
        </div>
      )}

      {result.status === 'success' && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-green-800">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Estimated Delivery: {result.eta}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-green-700 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Cash on Delivery (COD) Available
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Free Shipping
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
