const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { formatDateStr } = require('../utils/streakCalculator');

// Helper to determine time of day
const getTimeOfDayGreeting = (lang = 'en') => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return lang === 'hi' ? 'शुभ प्रभात (Good Morning)!' : 'Good Morning!';
  } else if (hour >= 12 && hour < 17) {
    return lang === 'hi' ? 'शुभ दोपहर (Good Afternoon)!' : 'Good Afternoon!';
  } else if (hour >= 17 && hour < 21) {
    return lang === 'hi' ? 'शुभ संध्या (Good Evening)!' : 'Good Evening!';
  } else {
    return lang === 'hi' ? 'शुभ रात्रि की तैयारी (Night Routine)!' : 'Good Night / Bedtime Routine!';
  }
};

// Generates time-to-time contextual instructions based on live metrics
const generateSmartInstructions = (user, log, habits, lang = 'hi') => {
  const hour = new Date().getHours();
  const instructions = [];

  const waterConsumed = log?.water?.totalMl || 0;
  const waterGoal = user.goals?.dailyWaterMl || 2500;
  const caloriesConsumed = (log?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
  const caloriesBurned = (log?.workouts || []).reduce((s, w) => s + (w.caloriesBurned || 0), 0);
  const calorieGoal = user.goals?.dailyCalories || 2000;
  const sleepHours = log?.sleep?.durationHours || 0;

  const incompleteHabits = habits.filter(
    (h) => !h.completedDates.includes(log?.date || formatDateStr(new Date()))
  );

  // 1. Time-specific instruction
  if (hour >= 5 && hour < 12) {
    // Morning instruction
    if (lang === 'hi') {
      instructions.push({
        type: 'morning_routine',
        urgency: 'high',
        icon: 'sunrise',
        title: 'दिन की शुरुआत और जलयोजन',
        message: 'सुबह खाली पेट 1-2 गिलास गुनगुना पानी पिएं। अपने नाश्ते में प्रोटीन (अंडे, स्प्राउट्स या ओट्स) शामिल करें ताकि दिन भर ऊर्जा बनी रहे।',
      });
    } else {
      instructions.push({
        type: 'morning_routine',
        urgency: 'high',
        icon: 'sunrise',
        title: 'Morning Routine & Hydration',
        message: 'Kickstart your metabolism with 1-2 glasses of water. Include adequate protein in your breakfast for sustained daily energy.',
      });
    }
  } else if (hour >= 12 && hour < 17) {
    // Afternoon instruction
    if (lang === 'hi') {
      instructions.push({
        type: 'afternoon_focus',
        urgency: 'medium',
        icon: 'sun',
        title: 'दोपहर की ऊर्जा और मुद्रा (Posture)',
        message: 'लंबे समय तक बैठने के बाद 5 मिनट का वॉक या स्ट्रेच करें। भोजन के तुरंत बाद भारी पानी पीने से बचें, 30 मिनट बाद पिएं।',
      });
    } else {
      instructions.push({
        type: 'afternoon_focus',
        urgency: 'medium',
        icon: 'sun',
        title: 'Afternoon Energy & Posture',
        message: 'Take a 5-minute stretch break. Avoid heavy water intake immediately after lunch; hydrate 30 minutes later for optimal digestion.',
      });
    }
  } else if (hour >= 17 && hour < 21) {
    // Evening instruction
    if (lang === 'hi') {
      instructions.push({
        type: 'evening_workout',
        urgency: 'high',
        icon: 'dumbbell',
        title: 'शाम की कसरत और हल्का भोजन',
        message: 'आज की शारीरिक गतिविधि / कसरत पूरी करने का सही समय है। रात का खाना हल्का और सोने से कम से कम 2 घंटे पहले लें।',
      });
    } else {
      instructions.push({
        type: 'evening_workout',
        urgency: 'high',
        icon: 'dumbbell',
        title: 'Evening Activity & Light Dinner',
        message: 'Ideal time for physical workout or a brisk walk. Keep dinner light and finish at least 2 hours before bedtime.',
      });
    }
  } else {
    // Night instruction
    if (lang === 'hi') {
      instructions.push({
        type: 'night_rest',
        urgency: 'medium',
        icon: 'moon',
        title: 'नींद की स्वच्छता और स्क्रीन डिटॉक्स',
        message: 'सोने से 30 मिनट पहले मोबाइल और स्क्रीन बंद कर दें। कमरे को अंधेरा और ठंडा रखें ताकि गहरी व शांत नींद मिल सके।',
      });
    } else {
      instructions.push({
        type: 'night_rest',
        urgency: 'medium',
        icon: 'moon',
        title: 'Sleep Hygiene & Digital Detox',
        message: 'Turn off screens 30 minutes prior to sleep. Keep bedroom cool and dark for restorative deep sleep.',
      });
    }
  }

  // 2. Hydration specific instruction
  if (waterConsumed < waterGoal * 0.5 && hour >= 14) {
    if (lang === 'hi') {
      instructions.push({
        type: 'water_alert',
        urgency: 'urgent',
        icon: 'droplet',
        title: 'पानी का लक्ष्य पीछे चल रहा है ⚠️',
        message: `आपने अब तक सिर्फ ${waterConsumed} ml पानी पिया है। लक्ष्य (${waterGoal} ml) तक पहुंचने के लिए अगले 3 घंटों में 2 गिलास पानी जरूर पिएं।`,
      });
    } else {
      instructions.push({
        type: 'water_alert',
        urgency: 'urgent',
        icon: 'droplet',
        title: 'Hydration Target Lagging ⚠️',
        message: `You have consumed only ${waterConsumed} ml so far. Aim to drink 2 glasses over the next 3 hours to meet your ${waterGoal} ml target.`,
      });
    }
  }

  // 3. Habit streak preservation instruction
  if (incompleteHabits.length > 0 && hour >= 16) {
    const habitTitles = incompleteHabits.map((h) => h.title).slice(0, 2).join(', ');
    if (lang === 'hi') {
      instructions.push({
        type: 'habit_alert',
        urgency: 'high',
        icon: 'flame',
        title: 'लकीर (Streak) सुरक्षित रखें 🔥',
        message: `आपकी आज ${incompleteHabits.length} आदतें बाकी हैं (${habitTitles})। अपनी दैनिक लकीर टूटने से बचाने के लिए सोने से पहले इन्हें पूरा करें!`,
      });
    } else {
      instructions.push({
        type: 'habit_alert',
        urgency: 'high',
        icon: 'flame',
        title: 'Preserve Your Streaks 🔥',
        message: `You have ${incompleteHabits.length} habits pending today (${habitTitles}). Complete them before bedtime to maintain your active streak!`,
      });
    }
  }

  // 4. Calorie & nutrition balance instruction
  const netCalories = caloriesConsumed - caloriesBurned;
  if (netCalories > calorieGoal) {
    if (lang === 'hi') {
      instructions.push({
        type: 'nutrition_alert',
        urgency: 'medium',
        icon: 'apple',
        title: 'कैलोरी संतुलन सलाह',
        message: `आज का शुद्ध कैलोरी सेवन (${netCalories} kcal) लक्ष्य (${calorieGoal} kcal) से थोड़ा अधिक है। रात को हल्का सूप या सलाद लें और 20 मिनट टहलें।`,
      });
    } else {
      instructions.push({
        type: 'nutrition_alert',
        urgency: 'medium',
        icon: 'apple',
        title: 'Calorie Balance Tip',
        message: `Net intake (${netCalories} kcal) is above goal (${calorieGoal} kcal). Opt for a light soup/salad and take a 20-minute post-dinner walk.`,
      });
    }
  }

  return instructions;
};

// @desc    Get real-time AI coach instructions and summary
// @route   GET /api/ai/instructions?lang=hi
// @access  Private
const getAIInstructions = async (req, res) => {
  try {
    const lang = req.query.lang === 'hi' ? 'hi' : 'en';
    const todayStr = formatDateStr(new Date());

    const user = await User.findById(req.user._id);
    const log = await DailyLog.findOne({ user: req.user._id, date: todayStr });
    const habits = await Habit.find({ user: req.user._id, isActive: true });

    const greeting = getTimeOfDayGreeting(lang);
    const instructions = generateSmartInstructions(user, log, habits, lang);

    // AI summary advice
    let overviewTip = '';
    if (lang === 'hi') {
      overviewTip = `${greeting} आपका AI कोच आपके स्वास्थ्य का विश्लेषण कर रहा है। आज की मुख्य प्राथमिकताएं नीचे दी गई हैं: निरंतरता बनाए रखें!`;
    } else {
      overviewTip = `${greeting} Your AI Health Coach is tracking your metrics. Here are your key real-time recommendations for today:`;
    }

    res.json({
      greeting,
      overviewTip,
      timestamp: new Date(),
      instructions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Interactive AI Chat Assistant for personalized health queries
// @route   POST /api/ai/ask
// @access  Private
const askAICoach = async (req, res) => {
  try {
    const { question, lang = 'hi' } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const todayStr = formatDateStr(new Date());
    const user = await User.findById(req.user._id);
    const log = await DailyLog.findOne({ user: req.user._id, date: todayStr });

    const q = question.toLowerCase();
    let reply = '';

    // Smart contextual NLP response generator
    if (q.includes('pani') || q.includes('water') || q.includes('hydration')) {
      const water = log?.water?.totalMl || 0;
      const goal = user.goals?.dailyWaterMl || 2500;
      if (lang === 'hi') {
        reply = `आज आपने ${water} ml पानी पिया है (लक्ष्य: ${goal} ml)। पर्याप्त पानी पीने से त्वचा चमकदार रहती है, पाचन सुधरता है और थकान दूर होती है। हर 1-2 घंटे में 1 गिलास पानी पीने का नियम बनाएं! 💧`;
      } else {
        reply = `You have logged ${water} ml of water today out of your ${goal} ml target. Staying hydrated boosts cognitive function, aids digestion, and keeps energy high! 💧`;
      }
    } else if (q.includes('khana') || q.includes('food') || q.includes('diet') || q.includes('dinner') || q.includes('meal') || q.includes('protein')) {
      const calories = (log?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
      const goal = user.goals?.dailyCalories || 2000;
      const remaining = Math.max(0, goal - calories);
      if (lang === 'hi') {
        reply = `आज आपने ${calories} kcal ली है, आपके पास ${remaining} kcal शेष हैं। उच्च प्रोटीन विकल्पों में पनीर, दाल, अंडे, सोया चंक्स, ग्रीक योगर्ट या चिकन शामिल करें। रात का भोजन हल्का रखें! 🥗`;
      } else {
        reply = `You have consumed ${calories} kcal today with ${remaining} kcal remaining. For high protein with clean macros, consider eggs, paneer, lentils, tofu, or grilled chicken breast with veggies! 🥗`;
      }
    } else if (q.includes('neend') || q.includes('sleep') || q.includes('soye') || q.includes('tired') || q.includes('fatigue')) {
      if (lang === 'hi') {
        reply = `गहरी नींद के लिए सोने से 1 घंटे पहले कमरे की लाइट धीमी कर दें और फोन दूर रखें। कैफीन (चाय/कॉफी) शाम 5 बजे के बाद न लें। कम से कम 7-8 घंटे की निर्बाध नींद शरीर की मांसपेशियों की रिकवरी के लिए बहुत जरूरी है। 🌙`;
      } else {
        reply = `For restorative sleep, aim for 7-8 hours nightly. Avoid caffeine after 4 PM, limit blue-light exposure 45 minutes before bed, and maintain a consistent sleep-wake schedule. 🌙`;
      }
    } else if (q.includes('workout') || q.includes('kasrat') || q.includes('exercise') || q.includes('vajan') || q.includes('weight')) {
      const weight = user.profile?.currentWeight || 70;
      const target = user.profile?.targetWeight || 68;
      if (lang === 'hi') {
        reply = `आपका वर्तमान वजन ${weight} kg है और लक्ष्य ${target} kg है। वसा घटाने और ताकत बढ़ाने के लिए सप्ताह में 4-5 दिन 30-45 मिनट स्ट्रेंथ ट्रेनिंग और 20 मिनट ब्रिस्क वॉकिंग करें। निरंतरता ही सफलता की कुंजी है! 💪`;
      } else {
        reply = `Your current weight is ${weight} kg targeting ${target} kg. Combine resistance training 4x/week with progressive overload and daily steps (7,000-10,000) for sustainable body recomposition! 💪`;
      }
    } else {
      if (lang === 'hi') {
        reply = `मैं आपका व्यक्तिगत स्वास्थ्य कोच हूँ! आपके द्वारा साझा किए गए शारीरिक लक्ष्यों (कैलोरी, पानी, आदतें और कसरत) के अनुसार, नियमित दिनचर्या का पालन करना और पर्याप्त नींद लेना सबसे महत्वपूर्ण है। आप मुझसे खान-पान, पानी या कसरत से संबंधित कोई भी प्रश्न पूछ सकते हैं। 🌟`;
      } else {
        reply = `I am your personal AI Health Coach! Based on your current profile metrics, maintaining daily consistency with hydration, balanced macronutrients, and mindful recovery will yield the best long-term results. Feel free to ask about meals, workouts, or habits! 🌟`;
      }
    }

    res.json({
      question,
      reply,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAIInstructions,
  askAICoach,
};
