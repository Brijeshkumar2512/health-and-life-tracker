import React, { useState } from 'react';
import { X, Moon, Smile, Star, Scale } from 'lucide-react';
import api from '../services/api';

const SleepMoodModal = ({
  isOpen,
  onClose,
  dateStr,
  currentSleep = { durationHours: 7, qualityRating: 3, notes: '' },
  currentMood = { status: 'Good', journalNotes: '' },
  currentWeight = '',
  onLogged,
}) => {
  const [durationHours, setDurationHours] = useState(currentSleep?.durationHours || '');
  const [qualityRating, setQualityRating] = useState(currentSleep?.qualityRating || 3);
  const [sleepNotes, setSleepNotes] = useState(currentSleep?.notes || '');
  const [moodStatus, setMoodStatus] = useState(currentMood?.status || 'Good');
  const [journalNotes, setJournalNotes] = useState(currentMood?.journalNotes || '');
  const [weight, setWeight] = useState(currentWeight || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const moodOptions = [
    { label: 'Great', emoji: '😄', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
    { label: 'Good', emoji: '🙂', color: 'border-teal-500 bg-teal-50 text-teal-800' },
    { label: 'Neutral', emoji: '😐', color: 'border-amber-500 bg-amber-50 text-amber-800' },
    { label: 'Tired', emoji: '🥱', color: 'border-indigo-500 bg-indigo-50 text-indigo-800' },
    { label: 'Stressed', emoji: '😰', color: 'border-rose-500 bg-rose-50 text-rose-800' },
    { label: 'Bad', emoji: '😞', color: 'border-slate-500 bg-slate-100 text-slate-800' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.put(`/logs/${dateStr}/sleep-mood`, {
        sleep: {
          durationHours: Number(durationHours) || 0,
          qualityRating: Number(qualityRating) || 3,
          notes: sleepNotes,
        },
        mood: {
          status: moodStatus,
          journalNotes,
        },
        weight: weight ? Number(weight) : undefined,
      });

      onLogged(res.data);
      onClose();
    } catch (err) {
      alert('Failed to update sleep & mood: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Sleep, Recovery & Mood</h3>
              <p className="text-xs text-indigo-100">Log sleep duration, feelings & reflections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Sleep duration & quality */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  placeholder="e.g. 7.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Current Weight (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    placeholder="e.g. 71.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-9 focus:outline-none focus:border-indigo-500"
                  />
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Quality Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Sleep Quality Rating ({qualityRating} / 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setQualityRating(star)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= qualityRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mood Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Overall Mood Today
            </label>
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => setMoodStatus(opt.label)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    moodStatus === opt.label ? opt.color + ' ring-2 ring-indigo-500/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Journal Reflection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Daily Journal Reflection / Notes
            </label>
            <textarea
              rows="3"
              placeholder="What went well today? How did your energy levels and routine feel?"
              value={journalNotes}
              onChange={(e) => setJournalNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              {loading ? 'Saving...' : 'Save Recovery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SleepMoodModal;
