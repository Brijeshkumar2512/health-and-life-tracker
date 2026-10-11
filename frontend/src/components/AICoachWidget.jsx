import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Droplet,
  Flame,
  Moon,
  Sun,
  Sunrise,
  Dumbbell,
  Apple,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AICoachWidget = () => {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [asking, setAsking] = useState(false);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/instructions?lang=${lang}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load AI coach instructions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructions();
  }, [lang]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userQ }]);

    try {
      setAsking(true);
      const res = await api.post('/ai/ask', { question: userQ, lang });
      setChatLog((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: lang === 'hi' ? 'क्षमा करें, उत्तर प्राप्त करने में त्रुटि हुई।' : 'Error retrieving AI response.',
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'droplet':
        return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-purple-500" />;
      case 'sunrise':
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-orange-500" />;
      case 'dumbbell':
        return <Dumbbell className="w-5 h-5 text-rose-500" />;
      case 'apple':
        return <Apple className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <>
      {/* Live AI Instructions Banner on Dashboard */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {lang === 'hi' ? 'AI स्वास्थ्य और दिनचर्या कोच' : 'AI Health & Routine Coach'}
                </h3>
                <span className="text-2xs bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Live Insights
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {data?.overviewTip || (lang === 'hi' ? 'समय-समय पर व्यक्तिगत निर्देश और सुझाव' : 'Real-time personalized instructions & guidance')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInstructions}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              title={lang === 'hi' ? 'ताज़ा करें' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{lang === 'hi' ? 'AI से प्रश्न पूछें' : 'Chat with AI Coach'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic AI Instructions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {data?.instructions?.map((inst, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
                inst.urgency === 'urgent'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-xl bg-white/10">{getIcon(inst.icon)}</div>
                <h4 className="text-xs font-bold truncate text-white">{inst.title}</h4>
              </div>
              <p className="text-2xs text-slate-300 leading-relaxed line-clamp-3">
                {inst.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI Chat Assistant Modal / Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[520px] max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    {lang === 'hi' ? 'AI स्वास्थ्य सहायक' : 'AI Health Coach Assistant'}
                  </h3>
                  <p className="text-2xs text-emerald-200">
                    {lang === 'hi' ? 'आहार, पानी, कसरत या नींद पर कुछ भी पूछें' : 'Ask about diet, water, exercise or sleep'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions Pills */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto text-2xs no-scrollbar">
              {[
                lang === 'hi' ? 'आज डिनर में क्या खाऊं?' : 'What to eat for dinner?',
                lang === 'hi' ? 'शाकाहारी प्रोटीन स्रोत' : 'Veg protein sources',
                lang === 'hi' ? 'पानी का लक्ष्य कैसे पूरा करूं?' : 'Reach water goal',
                lang === 'hi' ? 'फास्टिंग कैसे करें?' : 'Intermittent fasting',
                lang === 'hi' ? 'सरदर्द और तनाव के उपाय' : 'Headache & stress',
                lang === 'hi' ? 'गहरी नींद के लिए टिप्स' : 'Deep sleep tips',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(suggestion)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 shrink-0 transition shadow-2xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatLog.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="font-semibold text-slate-700">
                    {lang === 'hi' ? 'नमस्ते! मैं आपका ऑल-इन-वन स्वास्थ्य कोच हूँ।' : 'Hello! I am your AI Health Coach.'}
                  </p>
                  <p className="text-2xs mt-1 max-w-xs mx-auto text-slate-500 leading-relaxed">
                    {lang === 'hi'
                      ? 'डाइट, प्रोटीन, कसरत, सिरदर्द, पाचन, फास्टिंग या स्वास्थ्य से जुड़ा कोई भी सवाल पूछें!'
                      : 'Ask about meals, proteins, workouts, headaches, fasting, or any wellness question!'}
                  </p>
                </div>
              ) : (
                chatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl text-slate-500 text-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{lang === 'hi' ? 'AI कोच विचार कर रहा है...' : 'AI Coach is thinking...'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAsk} className="p-3 border-t border-slate-100 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Ask your question here...'}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AICoachWidget;
