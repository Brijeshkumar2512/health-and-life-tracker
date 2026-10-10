import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Plus,
  Check,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import HabitModal from '../components/HabitModal';
import { useLanguage } from '../context/LanguageContext';

const Habits = () => {
  const { lang, t } = useLanguage();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const formatDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: formatDateStr(d),
      dayName: d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }

  const todayStr = formatDateStr(new Date());

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (habitId, dateStr) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`, { date: dateStr });
      setHabits((prev) => prev.map((h) => (h._id === habitId ? res.data : h)));
    } catch (err) {
      alert('Failed to toggle habit: ' + err.message);
    }
  };

  const handleDelete = async (habitId) => {
    if (confirm('Delete this habit?')) {
      try {
        await api.delete(`/habits/${habitId}`);
        setHabits((prev) => prev.filter((h) => h._id !== habitId));
      } catch (err) {
        alert('Failed to delete habit: ' + err.message);
      }
    }
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const activeStreaksCount = habits.filter((h) => h.currentStreak > 0).length;
  const highestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{t('habitTrackerHeading')}</h2>
          <p className="text-sm text-slate-500">
            {t('habitTrackerSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedHabit(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newHabit')}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">
            {t('completedTodayCount')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">
              {completedToday} / {totalHabits}
            </span>
          </div>
          <span className="text-xs text-emerald-600 font-semibold block mt-1">
            {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}% {t('doneToday')}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">
            {t('activeStreaks')}
          </span>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold text-slate-800">{activeStreaksCount}</span>
          </div>
          <span className="text-xs text-slate-400 block mt-1">{t('activeRoutines')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">
            {t('recordStreak')}
          </span>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            <span className="text-2xl font-bold text-slate-800">{highestStreak}</span>
            <span className="text-xs text-slate-500">days</span>
          </div>
          <span className="text-xs text-indigo-600 font-semibold block mt-1">{t('allTimeRecord')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">
            {t('habitFrequency')}
          </span>
          <span className="text-2xl font-bold text-slate-800">Daily</span>
          <span className="text-xs text-slate-400 block mt-1">{t('streakUpdatesInstantly')}</span>
        </div>
      </div>

      {/* Main Habits List with 7-Day Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 text-base">{t('weeklyHabitTracker')}</h3>
          <p className="text-xs text-slate-400">
            {t('weeklyHabitHint')}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : habits.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 mb-1">{t('noHabitsYet')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {t('startSmall')}
            </p>
            <button
              onClick={() => {
                setSelectedHabit(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              {t('createFirstHabit')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {habits.map((habit) => {
              return (
                <div
                  key={habit._id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0 max-w-md">
                    <div
                      className="w-4 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color || '#10b981' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base truncate">{habit.title}</h4>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {habit.category}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{habit.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{habit.currentStreak || 0} {t('dayStreak')}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
                          <Award className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{t('bestStreak')}: {habit.longestStreak || 0}d</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-6 self-stretch lg:self-auto">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {last7Days.map((day) => {
                        const isDone = (habit.completedDates || []).includes(day.dateStr);
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center">
                            <span className="text-2xs font-medium text-slate-400 mb-1">
                              {day.dayName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggle(habit._id, day.dateStr)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all active:scale-90 ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                                  : day.isToday
                                  ? 'border-2 border-dashed border-emerald-400 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                              title={`${day.dateStr}: ${isDone ? 'Completed' : 'Click to complete'}`}
                            >
                              {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : day.dayNumber}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => {
                          setSelectedHabit(habit);
                          setModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Habit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedHabit(null);
        }}
        habit={selectedHabit}
        onSaved={fetchHabits}
      />
    </div>
  );
};

export default Habits;
