import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Utensils,
  Dumbbell,
  Droplet,
  Moon,
  Scale,
} from 'lucide-react';
import api from '../services/api';
import MealModal from '../components/MealModal';
import WorkoutModal from '../components/WorkoutModal';
import QuickAddWaterModal from '../components/QuickAddWaterModal';
import SleepMoodModal from '../components/SleepMoodModal';
import { useLanguage } from '../context/LanguageContext';

const DailyLog = () => {
  const { lang, t } = useLanguage();

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(getTodayStr());
  const [log, setLog] = useState(null);
  const [userGoals, setUserGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [mealTypeToLog, setMealTypeToLog] = useState('Breakfast');
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [sleepMoodModalOpen, setSleepMoodModalOpen] = useState(false);

  const fetchLogForDate = async (dateStr) => {
    try {
      setLoading(true);
      const [logRes, userRes] = await Promise.all([
        api.get(`/logs/${dateStr}`),
        api.get('/auth/me'),
      ]);
      setLog(logRes.data);
      setUserGoals(userRes.data?.goals || {});
    } catch (err) {
      console.error('Failed to fetch daily log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogForDate(currentDate);
  }, [currentDate]);

  const changeDateByOffset = (offset) => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offset);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setCurrentDate(`${newY}-${newM}-${newD}`);
  };

  const handleDeleteMeal = async (mealId) => {
    if (confirm('Delete meal?')) {
      try {
        const res = await api.delete(`/logs/${currentDate}/meals/${mealId}`);
        setLog(res.data);
      } catch (err) {
        alert('Failed to delete meal: ' + err.message);
      }
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (confirm('Delete workout?')) {
      try {
        const res = await api.delete(`/logs/${currentDate}/workouts/${workoutId}`);
        setLog(res.data);
      } catch (err) {
        alert('Failed to delete workout: ' + err.message);
      }
    }
  };

  // Calculations
  const totalCaloriesConsumed = (log?.meals || []).reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalCaloriesBurned = (log?.workouts || []).reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
  const totalProtein = (log?.meals || []).reduce((acc, m) => acc + (m.protein || 0), 0);
  const totalCarbs = (log?.meals || []).reduce((acc, m) => acc + (m.carbs || 0), 0);
  const totalFat = (log?.meals || []).reduce((acc, m) => acc + (m.fat || 0), 0);

  const calorieGoal = userGoals?.dailyCalories || 2000;
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const caloriesRemaining = Math.max(0, calorieGoal - totalCaloriesConsumed + totalCaloriesBurned);

  const mealCategories = [
    { type: 'Breakfast', label: t('breakfast') },
    { type: 'Lunch', label: t('lunch') },
    { type: 'Dinner', label: t('dinner') },
    { type: 'Snacks', label: t('snacks') },
  ];

  const formattedDateString = new Date(currentDate + 'T00:00:00').toLocaleDateString(
    lang === 'hi' ? 'hi-IN' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="space-y-6">
      {/* Date Navigation Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-2xl p-1">
            <button
              onClick={() => changeDateByOffset(-1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(getTodayStr())}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
            >
              {t('today')}
            </button>
            <button
              onClick={() => changeDateByOffset(1)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">{formattedDateString}</h2>
            <p className="text-xs text-slate-400">{t('dayOverview')}</p>
          </div>
        </div>

        {/* Date input picker */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Day Overview Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">{t('caloriesIn')}</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">{totalCaloriesConsumed} kcal</span>
          <span className="text-xs text-slate-400 block mt-0.5">Goal: {calorieGoal} kcal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">{t('caloriesOut')}</span>
          <span className="text-xl sm:text-2xl font-bold text-rose-500">{totalCaloriesBurned} kcal</span>
          <span className="text-xs text-slate-400 block mt-0.5">{t('workouts')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">{t('caloriesLeft')}</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-500">{caloriesRemaining} kcal</span>
          <span className="text-xs text-slate-400 block mt-0.5">Net: {netCalories} kcal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">{t('macrosPCF')}</span>
          <span className="text-sm sm:text-base font-bold text-slate-700">
            {totalProtein}g / {totalCarbs}g / {totalFat}g
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">P / C / F</span>
        </div>
      </div>

      {/* Hydration Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('waterHydration')}</h3>
              <p className="text-xs text-slate-500">
                {t('drankToday')}: {log?.water?.totalMl || 0} / {userGoals?.dailyWaterMl || 2500} ml
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const res = await api.post(`/logs/${currentDate}/water`, { amountMl: 250 });
                setLog(res.data);
              }}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition border border-sky-200"
            >
              +250 ml
            </button>
            <button
              onClick={async () => {
                const res = await api.post(`/logs/${currentDate}/water`, { amountMl: 500 });
                setLog(res.data);
              }}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition border border-sky-200"
            >
              +500 ml
            </button>
            <button
              onClick={() => setWaterModalOpen(true)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              {t('waterOptions')}
            </button>
          </div>
        </div>

        {/* Hydration progress bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.round(((log?.water?.totalMl || 0) / (userGoals?.dailyWaterMl || 2500)) * 100)
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Nutrition & Meals Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('mealsNutrition')}</h3>
              <p className="text-xs text-slate-500">{t('mealsSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setMealTypeToLog('Breakfast');
              setMealModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add')} {t('breakfast')}</span>
          </button>
        </div>

        {/* 4 Categorized Meal Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealCategories.map(({ type, label }) => {
            const mealsInType = (log?.meals || []).filter((m) => m.mealType === type);
            const categoryCalories = mealsInType.reduce((sum, m) => sum + (m.calories || 0), 0);

            return (
              <div key={type} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      {categoryCalories} kcal
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMealTypeToLog(type);
                      setMealModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title={`Add food`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {mealsInType.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">{t('noMealsLogged')}</p>
                ) : (
                  <div className="space-y-2">
                    {mealsInType.map((meal) => (
                      <div
                        key={meal._id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-center justify-between text-xs group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-800 truncate">{meal.foodName}</p>
                          <p className="text-slate-400 text-2xs mt-0.5">
                            P: {meal.protein || 0}g | C: {meal.carbs || 0}g | F: {meal.fat || 0}g
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-700">{meal.calories} kcal</span>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded transition opacity-0 group-hover:opacity-100"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workouts Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('physicalWorkouts')}</h3>
              <p className="text-xs text-slate-500">{t('workoutsSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={() => setWorkoutModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add')} {t('workouts')}</span>
          </button>
        </div>

        {(!log?.workouts || log.workouts.length === 0) ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            {t('noWorkoutsDay')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {log.workouts.map((w) => (
              <div
                key={w._id}
                className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/40 flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{w.exerciseName}</span>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {w.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {w.durationMinutes} min {w.notes ? `• ${w.notes}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-extrabold text-rose-600 text-sm">-{w.caloriesBurned} kcal</span>
                  <button
                    onClick={() => handleDeleteWorkout(w._id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition opacity-0 group-hover:opacity-100"
                    title="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sleep, Mood & Daily Reflection Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('sleepMoodReflection')}</h3>
              <p className="text-xs text-slate-500">{t('recoverySubtitle')}</p>
            </div>
          </div>

          <button
            onClick={() => setSleepMoodModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {t('editRecoveryLog')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              {t('sleepDuration')}
            </span>
            <p className="text-xl font-bold text-slate-800">
              {log?.sleep?.durationHours || 0} Hours
            </p>
            <p className="text-xs text-amber-500 font-medium mt-1">
              {log?.sleep?.qualityRating ? '⭐'.repeat(log.sleep.qualityRating) : t('notRated')}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              {t('moodStatus')}
            </span>
            <p className="text-xl font-bold text-slate-800">
              {log?.mood?.status || 'Good'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('currentWeight')}: {log?.weight ? `${log.weight} kg` : t('notRecorded')}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
              {t('journalNote')}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
              "{log?.mood?.journalNotes || t('noJournalNote')}"
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MealModal
        isOpen={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        dateStr={currentDate}
        defaultMealType={mealTypeToLog}
        onLogged={(updatedLog) => setLog(updatedLog)}
      />

      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        dateStr={currentDate}
        onLogged={(updatedLog) => setLog(updatedLog)}
      />

      <QuickAddWaterModal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        dateStr={currentDate}
        currentWater={log?.water?.totalMl || 0}
        goalWater={userGoals?.dailyWaterMl || 2500}
        onLogged={(updatedLog) => setLog(updatedLog)}
      />

      <SleepMoodModal
        isOpen={sleepMoodModalOpen}
        onClose={() => setSleepMoodModalOpen(false)}
        dateStr={currentDate}
        currentSleep={log?.sleep}
        currentMood={log?.mood}
        currentWeight={log?.weight}
        onLogged={(updatedLog) => setLog(updatedLog)}
      />
    </div>
  );
};

export default DailyLog;
