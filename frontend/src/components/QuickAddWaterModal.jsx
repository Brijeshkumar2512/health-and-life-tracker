import React, { useState } from 'react';
import { X, Droplet, RotateCcw } from 'lucide-react';
import api from '../services/api';

const QuickAddWaterModal = ({ isOpen, onClose, dateStr, currentWater, goalWater, onLogged }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddWater = async (amountMl) => {
    try {
      setSubmitting(true);
      const res = await api.post(`/logs/${dateStr}/water`, { amountMl });
      onLogged(res.data);
      onClose();
    } catch (err) {
      alert('Failed to log water: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetWater = async () => {
    if (confirm('Reset hydration log for this date to 0 ml?')) {
      try {
        setSubmitting(true);
        const res = await api.post(`/logs/${dateStr}/water`, { isReset: true });
        onLogged(res.data);
        onClose();
      } catch (err) {
        alert('Failed to reset water: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Water Intake</h3>
              <p className="text-xs text-sky-100">
                Current: {currentWater} / {goalWater} ml ({Math.min(100, Math.round((currentWater / goalWater) * 100))}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Add Increments
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[250, 500, 750].map((amt) => (
                <button
                  key={amt}
                  disabled={submitting}
                  onClick={() => handleAddWater(amt)}
                  className="py-3 px-4 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 hover:border-sky-300 text-sky-800 font-bold text-sm transition flex flex-col items-center gap-1 active:scale-95"
                >
                  <Droplet className="w-4 h-4 text-sky-500" />
                  <span>+{amt} ml</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (Number(customAmount) > 0) handleAddWater(Number(customAmount));
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Or Custom Milliliters
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="e.g. 350"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
              />
              <button
                type="submit"
                disabled={submitting || !customAmount}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white font-medium text-sm rounded-xl transition"
              >
                Add
              </button>
            </div>
          </form>

          {/* Reset Action */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleResetWater}
              disabled={submitting || currentWater === 0}
              className="text-xs text-rose-500 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset today's water
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddWaterModal;
