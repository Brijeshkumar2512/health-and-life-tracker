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

    // Comprehensive multilingual keywords (English, Romanized Hindi, and Devanagari Hindi)
    const isWaterQuery =
      q.includes('pani') ||
      q.includes('water') ||
      q.includes('hydration') ||
      q.includes('पानी') ||
      q.includes('जल') ||
      q.includes('प्यास');

    const isFoodQuery =
      q.includes('khana') ||
      q.includes('food') ||
      q.includes('diet') ||
      q.includes('dinner') ||
      q.includes('lunch') ||
      q.includes('breakfast') ||
      q.includes('meal') ||
      q.includes('protein') ||
      q.includes('calorie') ||
      q.includes('डिनर') ||
      q.includes('खाना') ||
      q.includes('खाऊं') ||
      q.includes('खाऊ') ||
      q.includes('नाश्ता') ||
      q.includes('भोजन') ||
      q.includes('डाइट') ||
      q.includes('कैलोरी') ||
      q.includes('प्रोटीन');

    const isSleepQuery =
      q.includes('neend') ||
      q.includes('sleep') ||
      q.includes('soye') ||
      q.includes('sona') ||
      q.includes('tired') ||
      q.includes('fatigue') ||
      q.includes('नींद') ||
      q.includes('सोने') ||
      q.includes('थकान') ||
      q.includes('आराम');

    const isWorkoutQuery =
      q.includes('workout') ||
      q.includes('kasrat') ||
      q.includes('exercise') ||
      q.includes('gym') ||
      q.includes('run') ||
      q.includes('walk') ||
      q.includes('कसरत') ||
      q.includes('व्यायाम') ||
      q.includes('वर्कआउट') ||
      q.includes('दौड़');

    const isWeightQuery =
      q.includes('vajan') ||
      q.includes('weight') ||
      q.includes('fat') ||
      q.includes('lose') ||
      q.includes('gain') ||
      q.includes('वजन') ||
      q.includes('मोटापा') ||
      q.includes('कम');

    const isHabitQuery =
      q.includes('habit') ||
      q.includes('streak') ||
      q.includes('routine') ||
      q.includes('आदत') ||
      q.includes('लकीर') ||
      q.includes('दिनचर्या');

    if (isWaterQuery) {
      const water = log?.water?.totalMl || 0;
      const goal = user.goals?.dailyWaterMl || 2500;
      const remaining = Math.max(0, goal - water);

      if (lang === 'hi') {
        if (remaining > 0) {
          reply = `💧 आज आपने ${water} ml पानी पिया है। अपने दैनिक लक्ष्य (${goal} ml) को पूरा करने के लिए अभी ${remaining} ml (लगभग ${Math.ceil(remaining / 250)} गिलास) पानी और पीना बाकी है! हर 1 घंटे में 1 गिलास पानी पीने का अलार्म लगा लें और पास में पानी की बोतल रखें।`;
        } else {
          reply = `🎉 बधाई हो! आपने आज का ${goal} ml पानी का लक्ष्य सफलतापूर्वक पूरा कर लिया है (${water} ml लॉग किया गया)। शरीर को हाइड्रेटेड रखना मेटाबॉलिज्म और त्वचा के लिए सर्वोत्तम है!`;
        }
      } else {
        if (remaining > 0) {
          reply = `💧 You've logged ${water} ml out of your ${goal} ml goal. You need ${remaining} ml (about ${Math.ceil(remaining / 250)} glasses) to finish today! Keep a bottle on your desk and take sips every 45-60 minutes.`;
        } else {
          reply = `🎉 Awesome! You have already hit your daily water goal of ${goal} ml (${water} ml logged). Great discipline!`;
        }
      }
    } else if (isFoodQuery) {
      const calories = (log?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
      const goal = user.goals?.dailyCalories || 2000;
      const remaining = Math.max(0, goal - calories);
      const proteinConsumed = (log?.meals || []).reduce((s, m) => s + (m.protein || 0), 0);
      const proteinGoal = user.goals?.dailyProteinGrams || 120;

      if (lang === 'hi') {
        reply = `🥗 आज आपने कुल ${calories} kcal ली है, और आपके पास ${remaining} kcal बची हुई हैं (प्रोटीन: ${proteinConsumed}g / ${proteinGoal}g लक्ष्य)।\n\nरात के डिनर के लिए बेहतरीन विकल्प:\n1. 2 मल्टीग्रेन रोटी + 100g पनीर भुर्जी + खीरे का सलाद (~380 kcal, 22g प्रोटीन)\n2. मूंग दाल की खिचड़ी + एक कटोरी गाढ़ा दही (~320 kcal, 16g प्रोटीन)\n3. उबली दाल + ग्रिल्ड सब्जियां / टोफू / उबले अंडे\n\nटिप: सोने से कम से कम 2 घंटे पहले खाना खा लें ताकि पाचन अच्छा रहे!`;
      } else {
        reply = `🥗 Today you have consumed ${calories} kcal, leaving ${remaining} kcal for your target (Protein: ${proteinConsumed}g / ${proteinGoal}g goal).\n\nRecommended dinner choices:\n1. 2 Rotis with Paneer Bhurji / Tofu & Green Salad (~380 kcal, 22g Protein)\n2. Yellow Lentil Soup (Moong Dal) with steamed veggies & Greek yogurt (~320 kcal)\n3. Grilled chicken breast or scrambled egg whites with sautéed veggies\n\nTip: Finish dinner at least 2 hours before bed for sound digestion!`;
      }
    } else if (isSleepQuery) {
      const sleepDuration = log?.sleep?.durationHours || 0;
      if (lang === 'hi') {
        reply = `🌙 अच्छी और गहरी नींद के लिए ये 4 नियम अपनाएं:\n1. सोने से 45 मिनट पहले मोबाइल, लैपटॉप और टीवी बंद कर दें (नीली रोशनी मेलाटोनिन को रोकती है)।\n2. शाम 5 बजे के बाद चाय/कॉफ़ी न पिएं।\n3. कमरे को बिल्कुल शांत, अंधेरा और थोड़ा ठंडा रखें।\n4. सोने से पहले 5 मिनट गहरी सांस (अनुलोम-विलोम या 4-7-8 तकनीक) लें। शरीर की मांसपेशियों की मरम्मत गहरी नींद में ही होती है!`;
      } else {
        reply = `🌙 4 Proven tips for deep restorative sleep:\n1. Power down screens 45 mins before bedtime (blue light suppresses melatonin).\n2. Avoid caffeine after 4 PM.\n3. Keep the bedroom dark, quiet, and around 18-20°C.\n4. Practice 5 minutes of mindful deep breathing before sleeping!`;
      }
    } else if (isWorkoutQuery) {
      const burned = (log?.workouts || []).reduce((s, w) => s + (w.caloriesBurned || 0), 0);
      if (lang === 'hi') {
        reply = `💪 आज आपने कसरत में ${burned} kcal जलाई है। यदि आज कसरत नहीं की है, तो 25-30 मिनट का यह रूटीन करें:\n1. 5 मिनट वार्म-अप (जंपिंग जैक्स, स्ट्रेचिंग)\n2. 15 मिनट बॉडीवेट कसरत (3 सेट: 12 पुश-अप्स, 15 स्क्वैट्स, 30 सेकंड प्लैंक)\n3. 10 मिनट कूल-डाउन वॉक।\nयह रूटीन आपके दिल को स्वस्थ रखेगा और कैलोरी बर्न करेगा!`;
      } else {
        reply = `💪 You've burned ${burned} kcal through exercise today. If you haven't worked out yet, try this 25-min home session:\n1. 5-min dynamic warm-up\n2. 15-min circuit (3 sets: 12 push-ups, 15 bodyweight squats, 30s plank)\n3. 5-min cool-down walk & stretching!`;
      }
    } else if (isWeightQuery) {
      const weight = user.profile?.currentWeight || 70;
      const target = user.profile?.targetWeight || 68;
      const diff = Math.abs(weight - target).toFixed(1);
      if (lang === 'hi') {
        reply = `⚖️ आपका वर्तमान वजन ${weight} kg है और लक्ष्य ${target} kg है (अंतर: ${diff} kg)।\nवजन को स्वस्थ रूप से प्रबंधित करने के लिए:\n- दैनिक 300-400 kcal का हल्का डेफिसिट रखें (क्रैश डाइट कभी न करें)।\n- रोजाना 8,000-10,000 कदम चलें।\n- पर्याप्त पानी पिएं और हर भोजन में प्रोटीन जरूर शामिल करें!`;
      } else {
        reply = `⚖️ Current weight: ${weight} kg | Target: ${target} kg (Delta: ${diff} kg).\nFor healthy weight management:\n- Maintain a modest 300-400 kcal deficit (avoid extreme starvation).\n- Target 8,000-10,000 steps daily.\n- Keep protein high to preserve muscle mass while burning fat!`;
      }
    } else if (isHabitQuery) {
      if (lang === 'hi') {
        reply = `🔥 आदतें और लकीरें (Streaks) बनाने का नियम: 'कभी भी लगातार दो दिन मिस न करें (Never miss twice)'। अगर किसी दिन समय कम हो, तो भी 5 मिनट का छोटा वर्जन पूरा करें। छोटी-छोटी दैनिक आदतें ही 6 महीने में बड़ा बदलाव लाती हैं!`;
      } else {
        reply = `🔥 Habit streak rule: 'Never miss twice'. Even on busy days, perform a 2-minute micro version of your habit. Daily micro-consistency compounds into massive lifestyle transformations!`;
      }
    } else {
      if (lang === 'hi') {
        reply = `🌟 मैं आपका व्यक्तिगत स्वास्थ्य कोच हूँ! मुझे आपके प्रश्न "${question}" पर विचार करके यह सलाह देनी है:\nस्वास्थ्य में निरंतरता सबसे बड़ी ताकत है। आप मुझसे विशिष्ट रूप से पूछ सकते हैं: "आज डिनर में क्या खाऊं?", "पानी कैसे पूरा करूं?", "कसरत का प्लान", या "वजन कैसे घटाएं"।`;
      } else {
        reply = `🌟 I am your personal AI Health Coach! Regarding "${question}":\nConsistency is the cornerstone of wellness. Feel free to ask specifically about: "What to eat for dinner?", "Hydration tips", "Workout routines", or "Sleep hygiene"!`;
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
