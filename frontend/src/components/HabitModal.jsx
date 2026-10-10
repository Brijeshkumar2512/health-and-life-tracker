import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Sparkles } from 'lucide-react';
import api from '../services/api';

const HabitModal = ({ isOpen, onClose, habit = null, onSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('#10b981');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      setCategory(habit.category || 'General');
      setFrequency(habit.frequency || 'daily');
      setColor(habit.color || '#10b981');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Mindfulness');
      setFrequency('daily');
      setColor('#10b981');
    }
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const categories = ['Mindfulness', 'Fitness', 'Productivity', 'Nutrition', 'Sleep', 'Health', 'General'];
  const colors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Sky', hex: '#0284c7' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Indigo', hex: '#6366f1' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      let res;
      if (habit) {
        res = await api.put(`/habits/${habit._id}`, {
          title,
          description,
          category,
          frequency,
          color,
        });
      } else {
        res = await api.post('/habits', {
          title,
          description,
          category,
          frequency,
          color,
        });
      }

      onSaved(res.data);
      onClose();
    } catch (err) {
      alert('Failed to save habit: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {habit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <p className="text-xs text-emerald-100">Build consistency and track streaks</p>
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Habit Name / Routine *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 pages of a book"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Why / How (Description)
            </label>
            <input
              type="text"
              placeholder="e.g. Expand mindset before bedtime without screen time"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Category */}
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
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Card Color Accent
            </label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
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
              disabled={loading || !title.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              {loading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
