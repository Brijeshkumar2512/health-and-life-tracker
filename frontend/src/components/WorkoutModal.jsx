import React, { useState } from 'react';
import { X, Dumbbell, Flame, Clock } from 'lucide-react';
import api from '../services/api';

const WorkoutModal = ({ isOpen, onClose, dateStr, onLogged }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = ['Cardio', 'Strength', 'HIIT', 'Yoga', 'Walking', 'Sports', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseName || !durationMinutes) return;

    try {
      setLoading(true);
      const res = await api.post(`/logs/${dateStr}/workouts`, {
        exerciseName,
        category,
        durationMinutes: Number(durationMinutes),
        caloriesBurned: Number(caloriesBurned) || 0,
        notes,
      });

      onLogged(res.data);
      setExerciseName('');
      setDurationMinutes('');
      setCaloriesBurned('');
      setNotes('');
      onClose();
    } catch (err) {
      alert('Failed to log workout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Physical Workout</h3>
              <p className="text-xs text-rose-100">Record training session and calories burned</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Exercise Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Exercise / Activity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Upper Body Hypertrophy / Morning 5km Run"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    category === cat
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Calories Burned */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Duration (minutes) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 45"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:border-rose-500"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Calories Burned (kcal)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 350"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:border-rose-500"
                />
                <Flame className="w-4 h-4 text-orange-500 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Workout Reflection / Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Felt high energy, increased bench press by 5kg."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !exerciseName || !durationMinutes}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              {loading ? 'Logging...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutModal;
