import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Droplet,
  Moon,
  Sparkles,
  Utensils,
  Dumbbell,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import QuickAddWaterModal from '../components/QuickAddWaterModal';
import MealModal from '../components/MealModal';
import WorkoutModal from '../components/WorkoutModal';
import SleepMoodModal from '../components/SleepMoodModal';
import AICoachWidget from '../components/AICoachWidget';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [dailyLog, setDailyLog] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [sleepMoodModalOpen, setSleepMoodModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, logRes, habitsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/logs'),
        api.get('/habits'),
      ]);
      setSummary(summaryRes.data);
      setDailyLog(logRes.data);
      setHabits(habitsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      const todayStr = summary?.todayDate || new Date().toISOString().split('T')[0];
      const res = await api.post(`/habits/${habitId}/toggle`, { date: todayStr });
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? res.data : h))
      );
      const summaryRes = await api.get('/analytics/summary');
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleRefreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { nutrition, hydration, sleep, mood, habits: habitsSummary, goals, profile } = summary || {};
  const todayStr = summary?.todayDate;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{t('todayOverview')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('heroTitle')}
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            {t('heroRemaining1')}{' '}
            <strong className="text-white">{nutrition?.caloriesRemaining || 0} kcal</strong>{' '}
            {t('heroRemaining2')}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setMealModalOpen(true)}
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>{t('quickAddMeal')}</span>
          </button>
          <button
            onClick={() => setWaterModalOpen(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-sm transition flex items-center gap-1.5"
          >
            <Droplet className="w-4 h-4 text-sky-200" />
            <span>{t('quickAddWater')}</span>
          </button>
          <button
            onClick={() => setWorkoutModalOpen(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-sm transition flex items-center gap-1.5"
          >
            <Dumbbell className="w-4 h-4 text-rose-200" />
            <span>{t('quickAddWorkout')}</span>
          </button>
          <button
            onClick={() => setSleepMoodModalOpen(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-sm transition flex items-center gap-1.5"
          >
            <Moon className="w-4 h-4 text-purple-200" />
            <span>{t('quickAddSleep')}</span>
          </button>
        </div>
      </div>

      {/* Real-Time AI Coach Widget */}
      <AICoachWidget />

      {/* 4 Real-time Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Calories Remaining */}
        <StatCard
          title={t('caloriesRemaining')}
          value={nutrition?.caloriesRemaining || 0}
          unit="kcal"
          target={`${nutrition?.calorieGoal || 2000} kcal`}
          progress={
            nutrition?.calorieGoal
              ? Math.min(100, Math.round((nutrition.caloriesConsumed / nutrition.calorieGoal) * 100))
              : 0
          }
          icon={Flame}
          colorScheme="amber"
          subtitle={`${t('consumed')}: ${nutrition?.caloriesConsumed || 0} | ${t('burned')}: ${nutrition?.caloriesBurned || 0}`}
          badgeText={nutrition?.caloriesRemaining > 0 ? t('onTrack') : t('goalExceeded')}
        />

        {/* 2. Hydration */}
        <StatCard
          title={t('hydrationIntake')}
          value={hydration?.waterConsumed || 0}
          unit="ml"
          target={`${hydration?.waterGoal || 2500} ml`}
          progress={hydration?.waterPercentage || 0}
          icon={Droplet}
          colorScheme="blue"
          subtitle={`+250ml / +500ml`}
          badgeText={`${hydration?.waterPercentage || 0}%`}
        />

        {/* 3. Sleep Recorded */}
        <StatCard
          title={t('sleepRecorded')}
          value={sleep?.durationHours ? `${sleep.durationHours}h` : '0h'}
          target={`${sleep?.sleepGoal || 8} hrs`}
          progress={sleep?.sleepGoal ? Math.min(100, Math.round((sleep.durationHours / sleep.sleepGoal) * 100)) : 0}
          icon={Moon}
          colorScheme="purple"
          subtitle={sleep?.qualityRating ? `Rating: ${'⭐'.repeat(sleep.qualityRating)}` : t('notRated')}
          badgeText={mood?.status ? mood.status : t('pending')}
        />

        {/* 4. Active Streaks & Habits */}
        <StatCard
          title={t('dailyHabits')}
          value={`${habitsSummary?.completedToday || 0} / ${habitsSummary?.total || 0}`}
          target="100%"
          progress={habitsSummary?.completionRate || 0}
          icon={CheckCircle2}
          colorScheme="emerald"
          subtitle={`${habitsSummary?.activeStreaks || 0} ${t('activeRoutines')}`}
          badgeText={`${habitsSummary?.completionRate || 0}%`}
        />
      </div>

      {/* Middle Section: Macronutrients & Hydration Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macronutrients Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('macronutrientTargets')}</h3>
              <p className="text-xs text-slate-500">{t('macroSubtitle')}</p>
            </div>
            <button
              onClick={() => navigate('/log')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{t('details')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 my-2">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t('protein')}
                </span>
                <span className="text-slate-600">
                  {nutrition?.proteinConsumed || 0}g / {goals?.dailyProteinGrams || 120}g
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(((nutrition?.proteinConsumed || 0) / (goals?.dailyProteinGrams || 120)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-sky-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  {t('carbohydrates')}
                </span>
                <span className="text-slate-600">
                  {nutrition?.carbsConsumed || 0}g / {goals?.dailyCarbsGrams || 220}g
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(((nutrition?.carbsConsumed || 0) / (goals?.dailyCarbsGrams || 220)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {t('healthyFats')}
                </span>
                <span className="text-slate-600">
                  {nutrition?.fatConsumed || 0}g / {goals?.dailyFatsGrams || 65}g
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(((nutrition?.fatConsumed || 0) / (goals?.dailyFatsGrams || 65)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t('netCalorieBalance')}</span>
            <span className="font-bold text-slate-800">{nutrition?.netCalories || 0} kcal</span>
          </div>
        </div>

        {/* Quick Hydration Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{t('hydrationLog')}</h3>
                <p className="text-xs text-slate-500">{hydration?.waterConsumed} ml {t('drankToday')}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-sky-600">{hydration?.waterPercentage}%</span>
          </div>

          <div className="my-4 py-3 bg-gradient-to-b from-sky-50/50 to-blue-50/50 rounded-2xl border border-sky-100 p-4 text-center">
            <div className="text-3xl font-extrabold text-sky-800">
              {hydration?.waterConsumed} <span className="text-sm font-semibold text-sky-500">/ {hydration?.waterGoal} ml</span>
            </div>
            <p className="text-xs text-sky-600 mt-1 font-medium">
              {hydration?.waterConsumed >= hydration?.waterGoal
                ? t('hydrationGoalAchieved')
                : `${t('waterLeftPrefix')}${hydration?.waterGoal - hydration?.waterConsumed}${t('waterLeftSuffix')}`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={async () => {
                await api.post(`/logs/${todayStr}/water`, { amountMl: 250 });
                handleRefreshData();
              }}
              className="py-2 px-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-xl transition text-center"
            >
              +250 ml
            </button>
            <button
              onClick={async () => {
                await api.post(`/logs/${todayStr}/water`, { amountMl: 500 });
                handleRefreshData();
              }}
              className="py-2 px-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-xl transition text-center"
            >
              +500 ml
            </button>
            <button
              onClick={() => setWaterModalOpen(true)}
              className="py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition text-center"
            >
              {t('customAmount')}
            </button>
          </div>
        </div>

        {/* Recovery, Mood & Journal Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">{t('restReflection')}</h3>
                <p className="text-xs text-slate-500">{t('restSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setSleepMoodModalOpen(true)}
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 my-2">
            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-600 font-medium uppercase tracking-wider block">{t('sleepDuration')}</span>
                <span className="text-lg font-bold text-slate-800">{sleep?.durationHours || 0} Hours</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-purple-600 font-medium uppercase tracking-wider block">{t('sleepQuality')}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {sleep?.qualityRating ? '⭐'.repeat(sleep.qualityRating) : t('notRated')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">
                {t('moodStatus')}
              </span>
              <p className="text-xs text-slate-700 font-medium line-clamp-2">
                {mood?.journalNotes || t('noNotesWritten')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSleepMoodModalOpen(true)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            {t('updateRecovery')}
          </button>
        </div>
      </div>

      {/* Bottom Section: Habits Checklist & Today's Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-lg">{t('todaysHabits')}</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {habitsSummary?.completedToday || 0}/{habits.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t('tapToToggle')}</p>
            </div>
            <button
              onClick={() => navigate('/habits')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">{t('noHabitsYet')}</p>
              <p className="text-xs text-slate-500 mb-4">{t('startSmall')}</p>
              <button
                onClick={() => navigate('/habits')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium"
              >
                {t('createFirstHabit')}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {habits.slice(0, 5).map((habit) => {
                const isCompleted = habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit._id}
                    onClick={() => handleToggleHabit(habit._id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer group ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                          }`}
                        >
                          {habit.title}
                        </p>
                        <span className="text-xs text-slate-400">{habit.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{habit.currentStreak || 0}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{t('streakUpdatesInstantly')}</span>
            <button
              onClick={() => navigate('/habits')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {t('viewAll')} →
            </button>
          </div>
        </div>

        {/* Today's Meals & Workouts Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('todaysActivityLog')}</h3>
              <p className="text-xs text-slate-500">{t('mealsAndWorkouts')}</p>
            </div>
            <button
              onClick={() => navigate('/log')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{t('details')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Meals preview */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span>{t('recentMeals')} ({dailyLog?.meals?.length || 0})</span>
                <button
                  onClick={() => setMealModalOpen(true)}
                  className="text-emerald-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('add')}
                </button>
              </div>

              {!dailyLog?.meals || dailyLog.meals.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t('noMealsLogged')}</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {dailyLog.meals.map((m) => (
                    <div
                      key={m._id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800">{m.foodName}</span>
                        <span className="text-slate-400 ml-2">({m.mealType})</span>
                      </div>
                      <span className="font-bold text-slate-700 shrink-0">{m.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workouts preview */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span>{t('workouts')} ({dailyLog?.workouts?.length || 0})</span>
                <button
                  onClick={() => setWorkoutModalOpen(true)}
                  className="text-rose-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('add')}
                </button>
              </div>

              {!dailyLog?.workouts || dailyLog.workouts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t('noWorkoutsRecorded')}</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {dailyLog.workouts.map((w) => (
                    <div
                      key={w._id}
                      className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800">{w.exerciseName}</span>
                        <span className="text-slate-400 ml-2">{w.durationMinutes} min</span>
                      </div>
                      <span className="font-bold text-rose-600 shrink-0">-{w.caloriesBurned} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{t('currentWeight')}: {profile?.currentWeight || 70} kg</span>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('view30DayTrends')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickAddWaterModal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        dateStr={todayStr}
        currentWater={hydration?.waterConsumed || 0}
        goalWater={hydration?.waterGoal || 2500}
        onLogged={handleRefreshData}
      />

      <MealModal
        isOpen={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        dateStr={todayStr}
        onLogged={handleRefreshData}
      />

      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        dateStr={todayStr}
        onLogged={handleRefreshData}
      />

      <SleepMoodModal
        isOpen={sleepMoodModalOpen}
        onClose={() => setSleepMoodModalOpen(false)}
        dateStr={todayStr}
        currentSleep={sleep}
        currentMood={mood}
        currentWeight={profile?.currentWeight}
        onLogged={handleRefreshData}
      />
    </div>
  );
};

export default Dashboard;
