import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Flame,
  Scale,
  PieChart as PieIcon,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Analytics = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [days, setDays] = useState(14);
  const [trendData, setTrendData] = useState([]);
  const [macrosData, setMacrosData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrends = async (numDays) => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/trends?days=${numDays}`);
      setTrendData(res.data.trends || []);
      setMacrosData(res.data.macros || []);
    } catch (err) {
      console.error('Failed to load analytics trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(days);
  }, [days]);

  const targetWeight = user?.profile?.targetWeight || 68;
  const calorieGoal = user?.goals?.dailyCalories || 2000;
  const sleepGoal = user?.goals?.dailySleepHours || 8;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <p className="font-bold text-slate-300">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{t('visualAnalyticsHeading')}</h2>
          <p className="text-sm text-slate-500">
            {t('visualAnalyticsSubtitle')}
          </p>
        </div>

        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          {[
            { d: 7, label: t('past7Days') },
            { d: 14, label: t('past14Days') },
            { d: 30, label: t('past30Days') },
          ].map(({ d, label }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
                days === d
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3 font-medium">{t('loading')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Calorie Balance Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t('calorieChartTitle')}</h3>
                  <p className="text-xs text-slate-500">
                    {t('calorieChartSubtitle')} ({calorieGoal} kcal)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> {t('consumed')}
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> {t('burned')}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Target
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={calorieGoal}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Target', position: 'top', fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="caloriesConsumed"
                    name={t('consumed')}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorConsumed)"
                  />
                  <Bar
                    dataKey="caloriesBurned"
                    name={t('burned')}
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Weight Progression & Macro Nutrients Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{t('weightProgressionTitle')}</h3>
                    <p className="text-xs text-slate-500">{t('weightProgressionSubtitle')} {targetWeight} kg</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  Target: {targetWeight} kg
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                    <YAxis
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#818cf8"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name={t('currentWeight')}
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Macronutrients Donut Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <PieIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{t('macroDistributionTitle')}</h3>
                    <p className="text-xs text-slate-500">{t('macroDistributionSubtitle')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macrosData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="grams"
                      >
                        {macrosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 w-full max-w-xs">
                  {macrosData.map((m) => (
                    <div
                      key={m.name}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="font-bold text-slate-700">
                          {m.name === 'Protein' ? t('protein') : m.name === 'Carbohydrates' ? t('carbohydrates') : t('healthyFats')}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800">{m.grams} g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sleep Trends & Habit Consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{t('sleepHygieneTitle')}</h3>
                    <p className="text-xs text-slate-500">{t('sleepHygieneSubtitle')}</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} domain={[0, 12]} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={sleepGoal}
                      stroke="#8b5cf6"
                      strokeDasharray="3 3"
                    />
                    <Bar
                      dataKey="sleepHours"
                      name={t('sleepDuration')}
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{t('habitConsistencyTitle')}</h3>
                    <p className="text-xs text-slate-500">{t('habitConsistencySubtitle')}</p>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHabit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="habitCompletionRate"
                      name="Completion Rate (%)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorHabit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
