import React, { useState, useEffect } from 'react';
import {
  User,
  Target,
  Scale,
  Activity,
  Droplet,
  Flame,
  Moon,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const Profile = () => {
  const { user, updateProfile, updateGoals } = useAuth();
  const { t } = useLanguage();

  // Profile physical metrics state
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(68);
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [gender, setGender] = useState('Prefer not to say');

  // Goals state
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [dailyWaterMl, setDailyWaterMl] = useState(2500);
  const [dailySleepHours, setDailySleepHours] = useState(8);
  const [dailyProteinGrams, setDailyProteinGrams] = useState(120);
  const [dailyCarbsGrams, setDailyCarbsGrams] = useState(220);
  const [dailyFatsGrams, setDailyFatsGrams] = useState(65);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.profile) {
        setAge(user.profile.age || 25);
        setHeight(user.profile.height || 175);
        setCurrentWeight(user.profile.currentWeight || 70);
        setTargetWeight(user.profile.targetWeight || 68);
        setActivityLevel(user.profile.activityLevel || 'Moderately Active');
        setGender(user.profile.gender || 'Prefer not to say');
      }
      if (user.goals) {
        setDailyCalories(user.goals.dailyCalories || 2000);
        setDailyWaterMl(user.goals.dailyWaterMl || 2500);
        setDailySleepHours(user.goals.dailySleepHours || 8);
        setDailyProteinGrams(user.goals.dailyProteinGrams || 120);
        setDailyCarbsGrams(user.goals.dailyCarbsGrams || 220);
        setDailyFatsGrams(user.goals.dailyFatsGrams || 65);
      }
    }
  }, [user]);

  // BMI Calculation
  const bmi = height > 0 ? (currentWeight / Math.pow(height / 100, 2)).toFixed(1) : 0;
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setMessage('');
      await updateProfile({
        name,
        profile: {
          age: Number(age),
          height: Number(height),
          currentWeight: Number(currentWeight),
          targetWeight: Number(targetWeight),
          activityLevel,
          gender,
        },
      });
      setMessage('Profile physical metrics saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    try {
      setSavingGoals(true);
      setMessage('');
      await updateGoals({
        dailyCalories: Number(dailyCalories),
        dailyWaterMl: Number(dailyWaterMl),
        dailySleepHours: Number(dailySleepHours),
        dailyProteinGrams: Number(dailyProteinGrams),
        dailyCarbsGrams: Number(dailyCarbsGrams),
        dailyFatsGrams: Number(dailyFatsGrams),
      });
      setMessage('Custom health and nutrition goals updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSavingGoals(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{t('profileHeading')}</h2>
        <p className="text-sm text-slate-500">
          {t('profileSubtitle')}
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <LanguageSelector variant="profile" />
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Body Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg">
            BMI
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t('bmiLabel')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-800">{bmi}</span>
              <span className="text-xs font-bold text-indigo-600">{bmiCategory}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t('targetDeltaLabel')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-800">
                {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
              </span>
              <span className="text-xs font-medium text-slate-500">
                {currentWeight > targetWeight ? t('toLose') : t('toGain')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">{t('activityLevelLabel')}</span>
            <span className="text-sm font-bold text-slate-800 block truncate">{activityLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical Metrics Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('physicalAttributes')}</h3>
              <p className="text-xs text-slate-500">{t('physicalSubtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('fullNameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('ageLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('heightLabel')}
                </label>
                <input
                  type="number"
                  min="50"
                  max="260"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('currentWeightLabel')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('targetWeightLabel')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('activityLevelLabel')}
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Super Active">Super Active (Hard physical work)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : t('savePhysicalMetrics')}</span>
            </button>
          </form>
        </div>

        {/* Daily Custom Goals Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('customDailyGoals')}</h3>
              <p className="text-xs text-slate-500">{t('goalsSubtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSaveGoals} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('dailyCalorieTarget')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Flame className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('waterGoalLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    value={dailyWaterMl}
                    onChange={(e) => setDailyWaterMl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:border-emerald-500"
                  />
                  <Droplet className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('sleepTargetLabel')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="16"
                    value={dailySleepHours}
                    onChange={(e) => setDailySleepHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:border-emerald-500"
                  />
                  <Moon className="w-4 h-4 text-purple-500 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Daily Macronutrient Targets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {t('dailyMacroTargets')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-2xs font-bold text-emerald-700 mb-1">{t('protein')} (g)</span>
                  <input
                    type="number"
                    min="10"
                    value={dailyProteinGrams}
                    onChange={(e) => setDailyProteinGrams(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="block text-2xs font-bold text-sky-700 mb-1">{t('carbohydrates')} (g)</span>
                  <input
                    type="number"
                    min="10"
                    value={dailyCarbsGrams}
                    onChange={(e) => setDailyCarbsGrams(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <span className="block text-2xs font-bold text-amber-700 mb-1">{t('healthyFats')} (g)</span>
                  <input
                    type="number"
                    min="5"
                    value={dailyFatsGrams}
                    onChange={(e) => setDailyFatsGrams(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingGoals}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{savingGoals ? 'Saving...' : t('updateDailyTargets')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
