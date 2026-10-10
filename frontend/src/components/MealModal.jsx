import React, { useState } from 'react';
import { X, Utensils, Flame } from 'lucide-react';
import api from '../services/api';

const MealModal = ({ isOpen, onClose, dateStr, defaultMealType = 'Breakfast', onLogged }) => {
  const [mealType, setMealType] = useState(defaultMealType);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName || calories === '') return;

    try {
      setLoading(true);
      const res = await api.post(`/logs/${dateStr}/meals`, {
        mealType,
        foodName,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      onLogged(res.data);
      // Reset form
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      onClose();
    } catch (err) {
      alert('Failed to log meal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Nutrition & Meal</h3>
              <p className="text-xs text-emerald-100">Record food items, calories, and macronutrients</p>
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
          {/* Meal Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    mealType === type
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Food or Recipe Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Avocado Toast with Poached Egg"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Calories */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Calories (kcal) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 380"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm pl-10"
              />
              <Flame className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Macronutrients (Optional, grams)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="block text-xs font-medium text-emerald-700 mb-1">Protein (g)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="block text-xs font-medium text-sky-700 mb-1">Carbs (g)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <span className="block text-xs font-medium text-amber-700 mb-1">Fat (g)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
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
              disabled={loading || !foodName || calories === ''}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium text-sm rounded-xl shadow-sm transition"
            >
              {loading ? 'Adding...' : 'Log Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealModal;
