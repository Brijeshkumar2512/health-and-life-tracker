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
// Helper to call Google Gemini API if GEMINI_API_KEY is configured
const callGeminiLLM = async (question, user, log, habits, lang) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const todayStr = formatDateStr(new Date());
    const waterConsumed = log?.water?.totalMl || 0;
    const waterGoal = user.goals?.dailyWaterMl || 2500;
    const caloriesConsumed = (log?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
    const calorieGoal = user.goals?.dailyCalories || 2000;
    const workoutsCount = log?.workouts?.length || 0;
    const caloriesBurned = (log?.workouts || []).reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const pendingHabits = (habits || [])
      .filter((h) => !h.completedDates.includes(todayStr))
      .map((h) => h.title);

    const systemPrompt = `You are a certified, world-class personal Health, Nutrition and Fitness AI Coach inside the "Health & Life Tracker" app.
User's personal metrics today:
- Current weight: ${user.profile?.currentWeight || 70} kg (Target: ${user.profile?.targetWeight || 68} kg)
- Calories eaten today: ${caloriesConsumed} kcal / Goal: ${calorieGoal} kcal
- Water drunk today: ${waterConsumed} ml / Goal: ${waterGoal} ml
- Workouts today: ${workoutsCount} sessions, ${caloriesBurned} kcal burned
- Pending daily habits today: ${pendingHabits.join(', ') || 'All completed'}

Guidelines:
1. Provide scientifically grounded, clear, encouraging, and highly actionable advice.
2. If the user asks in Hindi or Hinglish, respond in natural, friendly, polite Hindi (Devanagari or clean conversational Hindi).
3. If the user asks in English, respond in English.
4. Keep the answer structured with emojis and concise bullet points (around 4-7 lines).
5. For serious medical conditions, remind the user to consult a certified medical doctor.`;

    const model = 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${question}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const answer = parts.filter((p) => p.text).map((p) => p.text).join('\n').trim();
      if (answer && answer.length > 10) {
        return answer;
      }
    } else {
      console.warn('Gemini API status not ok:', resp.status);
    }
  } catch (err) {
    console.warn('Gemini LLM call note:', err.message);
  }
  return null;
};

// Comprehensive Expert Health Knowledge Engine (Built-in offline/fallback AI)
const getExpertHealthAdvice = (question, user, log, lang) => {
  const q = question.toLowerCase();

  // 1. Capabilities / "What can I ask" queries
  if (
    q.includes('kya puch') ||
    q.includes('kya kya') ||
    q.includes('what can i ask') ||
    q.includes('what to ask') ||
    q.includes('help') ||
    q.includes('topics') ||
    q.includes('क्या पूछ') ||
    q.includes('क्या सवाल') ||
    q.includes('क्या क्या')
  ) {
    if (lang === 'hi') {
      return `🌟 मैं आपका संपूर्ण स्वास्थ्य, पोषण और फिटनेस AI कोच हूँ! आप मुझसे स्वास्थ्य से जुड़े किसी भी विषय पर पूछ सकते हैं:

1. 🥗 खान-पान और डाइट: "डिनर में क्या खाऊं?", "शाकाहारी प्रोटीन स्रोत", "फास्टिंग कैसे करें?"
2. 💧 पानी और हाइड्रेशन: "पानी का लक्ष्य कैसे पूरा करूं?", "दिन में कितना पानी पिएं?"
3. 🏃‍♂️ कसरत और फिटनेस: "वजन घटाने का वर्कआउट", "पेट की चर्बी कम करना", "रनिंग स्टैमिना"
4. 🌙 नींद और तनाव: "अच्छी नींद के उपाय", "तनाव और डिप्रेशन से कैसे बचें?"
5. 🩺 सामान्य स्वास्थ्य: "सरदर्द का घरेलू उपाय", "पाचन और एसिडिटी", "क्रिएटिन व सप्लीमेंट्स", "विटामिन D/B12"
6. 🎯 वजन और आदतें: "वजन कैसे बढ़ाएं/घटाएं?", "दैनिक रूटीन कैसे बनाएं?"

आप जो चाहें खुलकर पूछें, मैं आपके वर्तमान स्वास्थ्य डेटा के आधार पर सटीक उत्तर दूंगा!`;
    } else {
      return `🌟 I am your comprehensive AI Health, Nutrition & Fitness Coach! You can ask me about ANY wellness topic:

1. 🥗 Nutrition & Diet: "What to eat for dinner?", "Vegetarian protein sources", "Intermittent fasting guide"
2. 💧 Hydration: "How to hit my water goal?", "Best times to drink water"
3. 🏃‍♂️ Fitness & Workouts: "Workout for fat loss", "How to build core strength", "Improve running stamina"
4. 🌙 Sleep & Recovery: "Tips for deep restorative sleep", "Managing stress and anxiety"
5. 🩺 Daily Health & Supplements: "Natural relief for headaches", "Gut health & acidity", "Creatine & protein safety", "Vitamin D & B12"
6. 🎯 Habits & Goals: "Safe calorie deficit", "How to stick to healthy habits"

Ask me anything—I'll personalize the advice to your live fitness metrics!`;
    }
  }

  // 2. Headache & Migraine
  if (
    q.includes('headache') ||
    q.includes('sir dard') ||
    q.includes('sar dard') ||
    q.includes('migraine') ||
    q.includes('सिर दर्द') ||
    q.includes('सरदर्द') ||
    q.includes('माइग्रेन')
  ) {
    if (lang === 'hi') {
      return `💆‍♂️ सरदर्द से राहत के लिए ये 4 तुरंत कदम उठाएं:
1. 💧 पानी पिएं: 70% सरदर्द हल्के डिहाइड्रेशन से होते हैं। अभी 1-2 गिलास सामान्य पानी पिएं।
2. 📱 स्क्रीन से ब्रेक: मोबाइल और लैपटॉप से कम से कम 20 मिनट दूर हटें और आँखें बंद करें।
3. 🧘 गर्दन और कंधों की स्ट्रेचिंग: गर्दन को धीरे-धीरे दोनों तरफ घुमाएं और गहरी सांस लें।
4. 🧊 ठंडी/गुनगुनी सिकाई: माथे पर ठंडे पानी की पट्टी या गर्दन के पीछे हल्का गर्म सेक लगाएं।
नोट: यदि सरदर्द बहुत तेज, लगातार या उल्टी के साथ हो, तो तुरंत डॉक्टर से परामर्श लें।`;
    } else {
      return `💆‍♂️ 4 Effective steps for headache relief:
1. 💧 Hydrate immediately: Drink 1-2 large glasses of water—mild dehydration is the leading trigger.
2. 📱 Digital screen break: Step away from all monitors and phones for 20 minutes in a dimly lit room.
3. 🧘 Gentle neck mobility: Softly stretch your trapezius and neck muscles to release tension.
4. 🧊 Cold/Warm compress: Place a cool cloth across your forehead or warm compress on your neck.
Note: If headaches are severe, recurring, or accompanied by vision changes, consult a medical professional.`;
    }
  }

  // 3. Digestion, Acidity, Gas, Constipation & Gut Health
  if (
    q.includes('pachan') ||
    q.includes('digestion') ||
    q.includes('acidity') ||
    q.includes('gas') ||
    q.includes('kabz') ||
    q.includes('constipation') ||
    q.includes('bloat') ||
    q.includes('gut') ||
    q.includes('पाचन') ||
    q.includes('एसिडिटी') ||
    q.includes('कब्ज') ||
    q.includes('पेट खराब') ||
    q.includes('गैस') ||
    q.includes('ब्लोटिंग')
  ) {
    if (lang === 'hi') {
      return `🌱 पाचन, गैस और एसिडिटी को तुरंत शांत करने के उपाय:
1. 🥛 प्रोबायोटिक्स: दोपहर के भोजन में ताजा दही या छाछ (भुना जीरा और काला नमक डालकर) लें।
2. 🍵 सौंफ और अजवाइन: भोजन के बाद 1 चम्मच सौंफ और चुटकी भर अजवाइन चबाएं या इसका गुनगुना काढ़ा पिएं।
3. 🚶 15 मिनट की धीमी सैर: खाना खाने के तुरंत बाद लेटने से बचें; 100-200 कदम धीरे-धीरे टहलें।
4. 🥗 फाइबर और पानी: हरी सब्जियां, पपीता और दिन भर में 2.5 लीटर पानी जरूर पिएं ताकि आंतें साफ रहें।
5. 🚫 तली-भुनी चीजें, अत्यधिक चाय और देर रात भारी भोजन से परहेज करें।`;
    } else {
      return `🌱 Proven tips for optimal gut health, digestion & acidity relief:
1. 🥛 Probiotics: Include plain Greek yogurt or buttermilk with roasted cumin seed powder in lunch.
2. 🍵 Digestive herbs: Chew a teaspoon of fennel seeds (saunf) or drink warm ajwain/ginger water post-meal.
3. 🚶 Post-meal walk: Never lie down right after eating. Take a slow 15-minute gentle stroll.
4. 🥗 Fiber & Hydration: Eat fiber-rich papaya, oats, and leafy greens, and hit your 2.5L daily water goal.
5. 🚫 Limit deep-fried foods, late-night dinners, and excessive caffeine on an empty stomach.`;
    }
  }

  // 4. Fasting / Intermittent Fasting
  if (
    q.includes('fasting') ||
    q.includes('upvas') ||
    q.includes('vrat') ||
    q.includes('16/8') ||
    q.includes('फास्टिंग') ||
    q.includes('उपवास') ||
    q.includes('व्रत')
  ) {
    if (lang === 'hi') {
      return `⏳ इंटरमिटेंट फास्टिंग (16:8) का सही और सुरक्षित तरीका:
1. ⏰ खाने की विंडो: दिन में 8 घंटे खाएं (जैसे दोपहर 12 बजे से रात 8 बजे तक) और 16 घंटे उपवास रखें।
2. 💧 फास्टिंग के दौरान: भरपूर पानी, ब्लैक कॉफी या ग्रीन टी पी सकते हैं (बिना चीनी और दूध के)।
3. 🥗 फास्टिंग कैसे खोलें: उपवास को कभी भी भारी या तली हुई चीज़ से न तोड़ें; पहले सूप, नारियल पानी, या उबले अंडे/फल लें।
4. 🛡️ लाभ: इंसुलिन संवेदनशीलता सुधरती है, ऑटोफैगी (कोशिकाओं की सफाई) होती है और फैट लॉस तेज होता है।
सलाह: गर्भवती महिलाएं, बहुत कम वजन वाले या डायबिटीज के मरीज बिना डॉक्टर के उपवास न करें।`;
    } else {
      return `⏳ Guide to Intermittent Fasting (16:8 Protocol):
1. ⏰ Eating Window: Fast for 16 hours, eat within an 8-hour window (e.g., 12:00 PM to 8:00 PM).
2. 💧 During the fast: Hydrate generously with plain water, black coffee, or green tea (zero sugar/milk).
3. 🥗 Breaking the fast: Break gently with light protein and fiber (vegetable soup, fruits, boiled eggs), not greasy heavy meals.
4. 🛡️ Key Benefits: Enhances insulin sensitivity, supports autophagy, and aids sustainable fat loss.
Caution: Individuals with diabetes or pregnancy should consult a doctor prior to fasting regimes.`;
    }
  }

  // 5. Supplements, Creatine, Whey Protein
  if (
    q.includes('creatine') ||
    q.includes('whey') ||
    q.includes('protein powder') ||
    q.includes('supplement') ||
    q.includes('क्रिएटिन') ||
    q.includes('व्हे प्रोटीन') ||
    q.includes('सप्लीमेंट') ||
    q.includes('प्रोटीन पाउडर')
  ) {
    if (lang === 'hi') {
      return `💊 सप्लीमेंट्स और क्रिएटिन पर वैज्ञानिक मार्गदर्शन:
1. ⚡ क्रिएटिन मोनोहाइड्रेट: यह दुनिया का सबसे रिसर्च-प्रमाणित सप्लीमेंट है। रोजाना 3-5 ग्राम लेने से ताकत (strength) और मांसपेशियों की रिकवरी बढ़ती है। इसके साथ दिन में 3-4 लीटर पानी जरूर पिएं।
2. 🥛 व्हे प्रोटीन (Whey Protein): यह दूध से बना सुरक्षित सप्लीमेंट है। यदि आप भोजन से प्रोटीन (1.2-1.6g प्रति किग्रा वजन) पूरा नहीं कर पा रहे हैं, तो 1 स्कूप (24-27g प्रोटीन) कसरत के बाद लेना बहुत मददगार है।
3. 🥦 भोजन पहले, सप्लीमेंट बाद में: अंडे, पनीर, दालें और टोफू आपकी पहली प्राथमिकता होने चाहिए।`;
    } else {
      return `💊 Science-backed guide on Creatine & Whey Protein:
1. ⚡ Creatine Monohydrate: The most rigorously studied fitness supplement. A daily maintenance dose of 3-5g boosts ATP power output, muscle fullness, and strength. Ensure 3-4 liters of water daily.
2. 🥛 Whey Protein: Naturally derived from milk, whey is a safe and convenient tool to meet your daily protein target (aim for 1.2-1.6g per kg bodyweight). 1 scoop provides ~25g high-quality protein.
3. 🥦 Food First Philosophy: Whole foods (eggs, paneer, chicken, lentils, tofu) should form your primary foundation.`;
    }
  }

  // 6. Belly Fat & Core
  if (
    q.includes('belly') ||
    q.includes('pet ki charbi') ||
    q.includes('pait') ||
    q.includes('abs') ||
    q.includes('love handle') ||
    q.includes('पेट की चर्बी') ||
    q.includes('बेली फैट') ||
    q.includes('पेट कम')
  ) {
    if (lang === 'hi') {
      return `🔥 पेट की चर्बी (Belly Fat) कम करने का वैज्ञानिक सत्य:
1. ❌ सिर्फ पेट का फैट अलग से कम नहीं होता (Spot reduction is a myth): फैट पूरे शरीर से एक साथ कम होता है।
2. 📉 हल्का कैलोरी डेफिसिट: दैनिक जरूरत से 300-400 kcal कम खाएं और रिफाइंड चीनी, कोल्ड ड्रिंक व मैदा पूरी तरह बंद करें।
3. 🏋️ स्ट्रेंथ ट्रेनिंग + कार्डियो: सिर्फ सिट-अप्स करने के बजाय स्क्वैट्स, पुश-अप्स और वॉक करें ताकि ज्यादा कैलोरी बर्न हो।
4. 🌙 कोर्टिसोल (स्ट्रेस हार्मोन) कम करें: तनाव और कम नींद पेट पर विसरल फैट जमा करते हैं। रोजाना 7-8 घंटे सोएं।`;
    } else {
      return `🔥 Evidence-based approach to reducing Belly Fat:
1. ❌ Spot Reduction Myth: You cannot target belly fat solely with crunches. Fat loss occurs systematically across the entire body.
2. 📉 Caloric Deficit: Maintain a moderate 300-400 kcal daily deficit. Eliminate sugary beverages, refined flour, and processed snacks.
3. 🏋️ Compound Lifting & Steps: Prioritize squats, deadlifts, and 8,000-10,000 daily steps to elevate metabolic rate.
4. 🌙 Regulate Cortisol & Sleep: Elevated stress hormones store visceral fat around the abdomen. Aim for 7-8 hours of quality sleep.`;
    }
  }

  // 7. Vegetarian Protein Sources
  if (
    q.includes('veg protein') ||
    q.includes('shakahari') ||
    q.includes('plant protein') ||
    q.includes('शाकाहारी') ||
    q.includes('वेज प्रोटीन')
  ) {
    if (lang === 'hi') {
      return `🌱 शीर्ष शाकाहारी (Vegetarian) प्रोटीन स्रोत:
1. 🫘 सोया चंक्स (Soya Chunks): 100g में लगभग 52g शुद्ध प्रोटीन (सबसे सस्ता व रिच स्रोत)।
2. 🧀 पनीर / टोफू: 100g में 18-20g प्रोटीन।
3. 🍲 मूंग स्प्राउट्स और दालें: अंकुरित मूंग, चना, राजमा, छोले (100g पकी हुई में 8-15g प्रोटीन)।
4. 🥛 ग्रीक योगर्ट / गाढ़ा दही: 1 कटोरी में 10-12g प्रोटीन।
5. 🌾 चिया सीड्स, कद्दू के बीज और मूंगफली: हेल्दी फैट्स और प्रोटीन का बेहतरीन मेल।`;
    } else {
      return `🌱 Top Vegetarian & Plant-Based Protein Sources:
1. 🫘 Soya Chunks: ~52g protein per 100g (one of the richest, most cost-effective sources).
2. 🧀 Paneer & Tofu: ~18-20g protein per 100g serving with great bioavailability.
3. 🍲 Legumes & Sprouts: Moong sprouts, black chickpeas, kidney beans (rajma), and lentils.
4. 🥛 Greek Yogurt / Hung Curd: ~10-12g protein per cup with natural gut probiotics.
5. 🌾 Pumpkin seeds, Chia seeds, and Peanut Butter: Nutrient-dense protein and essential omega fats.`;
    }
  }

  // 8. Knee, Back & Joint Pain
  if (
    q.includes('ghutne') ||
    q.includes('kamar dard') ||
    q.includes('back pain') ||
    q.includes('joint') ||
    q.includes('knee') ||
    q.includes('घुटने') ||
    q.includes('कमर') ||
    q.includes('जोड़ों') ||
    q.includes('पीठ दर्द')
  ) {
    if (lang === 'hi') {
      return `🦴 जोड़ों, घुटनों और कमर दर्द से बचाव व राहत:
1. 🚶 लो-इम्पैक्ट एक्टिविटी: यदि घुटने में दर्द है, तो दौड़ने के बजाय स्विमिंग, साइकिलिंग या सपाट जगह पर टहलें।
2. 🪑 पोस्चर ठीक रखें: कुर्सी पर बैठते समय पीठ सीधी रखें और हर 40 मिनट में उठकर 2 मिनट स्ट्रेच करें।
3. 💪 कोर और क्वाड्स मजबूत करें: पेल्विक ब्रिज और वॉल-सिट्स जोड़ों पर दबाव कम करते हैं।
4. ☀️ विटामिन D3 और कैल्शियम: धूप में 15 मिनट बैठें या डॉक्टर से सलाह लेकर सप्लीमेंट चेक कराएं।`;
    } else {
      return `🦴 Joint, Knee & Lower Back Relief Strategies:
1. 🚶 Low-Impact Exercise: Replace high-impact running with swimming, cycling, or flat walking if knees hurt.
2. 🪑 Ergonomic Posture: Maintain a neutral spine while sitting; stand and stretch every 40 minutes.
3. 💪 Core & Quad Strengthening: Glute bridges, bird-dogs, and wall sits stabilize joints without direct spinal load.
4. ☀️ Vitamin D3 & Calcium: Get 15 mins morning sunlight and check blood levels to prevent bone density issues.`;
    }
  }

  // 9. Stress, Anxiety & Mental Well-being
  if (
    q.includes('stress') ||
    q.includes('tanav') ||
    q.includes('anxiety') ||
    q.includes('depression') ||
    q.includes('chinta') ||
    q.includes('तनाव') ||
    q.includes('चिंता') ||
    q.includes('घबराहट') ||
    q.includes('स्ट्रेस')
  ) {
    if (lang === 'hi') {
      return `🧘 मानसिक शांति और तनाव कम करने के 4 तरीके:
1. 🫁 4-7-8 सांस तकनीक: 4 सेकंड सांस अंदर लें, 7 सेकंड रोकें, और 8 सेकंड में धीरे-धीरे मुंह से बाहर छोड़ें (3-4 बार दोहराएं)।
2. 🌳 प्रकृति में 15 मिनट वॉक: हरी-भरी जगह में खुली हवा में टहलने से कॉर्टिसोल स्तर तुरंत गिरता है।
3. 📝 विचार लिखें: जो बातें परेशान कर रही हैं उन्हें डायरी में लिख लें (Brain Dump)।
4. 📵 डिजिटल डिटॉक्स: सोने से 1 घंटे पहले सोशल मीडिया और समाचारों से दूरी बनाएं।`;
    } else {
      return `🧘 4 Powerful practices to relieve mental stress & anxiety:
1. 🫁 4-7-8 Breathing Technique: Inhale quietly through nose for 4s, hold breath for 7s, exhale completely through mouth for 8s.
2. 🌳 15-Minute Nature Walk: Walking outdoors in natural sunlight rapidly suppresses adrenaline and cortisol.
3. 📝 Daily Brain Dump: Journal the 3 things causing stress onto paper to externalize mental clutter.
4. 📵 Screen Disconnect: Power down notifications and social media 60 minutes before bedtime.`;
    }
  }

  // 10. Diabetes, Blood Sugar
  if (
    q.includes('sugar') ||
    q.includes('diabetes') ||
    q.includes('insulin') ||
    q.includes('डायबिटीज') ||
    q.includes('शुगर') ||
    q.includes('इंसुलिन')
  ) {
    if (lang === 'hi') {
      return `🩸 ब्लड शुगर (डायबिटीज) नियंत्रण के महत्वपूर्ण नियम:
1. 🚶 भोजन के बाद 15 मिनट वॉक: लंच और डिनर के बाद हल्की सैर मांसपेशियों द्वारा ग्लूकोज अवशोषण को 30% बढ़ा देती है।
2. 🥦 लो-जीआई (Low GI) खाद्य पदार्थ: सफेद चावल, मैदा, और चीनी के स्थान पर ब्राउन राइस, ओट्स, दालें और हरी सब्जियां चुनें।
3. 🥗 भोजन का सही क्रम: पहले सलाद/सब्जियां खाएं, फिर प्रोटीन (दाल/पनीर), और सबसे अंत में कार्ब्स (रोटी/चावल)।
4. 🩺 डॉक्टर द्वारा दी गई दवाओं और नियमित शुगर टेस्टिंग का समय पर पालन करें।`;
    } else {
      return `🩸 Essential habits for Blood Sugar & Insulin sensitivity:
1. 🚶 15-Min Post-Meal Walk: Gentle walking after meals increases muscular glucose uptake without relying solely on insulin.
2. 🥦 Low-GI Whole Foods: Swap white carbs for steel-cut oats, lentils, quinoa, and non-starchy vegetables.
3. 🥗 Food Order Sequence: Eat fibrous salad first, followed by protein, and consume carbohydrates last to blunt glucose spikes.
4. 🩺 Maintain scheduled medical consultations and monitor fasting blood sugar regularly.`;
    }
  }

  // 11. Blood Pressure & Heart
  if (
    q.includes('bp') ||
    q.includes('blood pressure') ||
    q.includes('hypertension') ||
    q.includes('dil') ||
    q.includes('heart') ||
    q.includes('बीपी') ||
    q.includes('ब्लड प्रेशर') ||
    q.includes('हार्ट')
  ) {
    if (lang === 'hi') {
      return `❤️ ब्लड प्रेशर (BP) और हृदय स्वास्थ्य के नियम:
1. 🧂 नमक पर नियंत्रण: दैनिक नमक की मात्रा 1 छोटी चम्मच (5g) से कम रखें; पैकेज्ड व फ्रोजन फूड्स से बचें।
2. 🍌 पोटैशियम युक्त आहार: केला, पालक, शकरकंद और नारियल पानी अतिरिक्त सोडियम को शरीर से बाहर निकालते हैं।
3. 🏃 30 मिनट का ब्रिस्क वॉक: नियमित कार्डियो रक्त वाहिकाओं को लचीला और स्वस्थ रखता है।
4. ☕ कैफीन और धूम्रपान से दूरी बनाएं।`;
    } else {
      return `❤️ Cardiovascular & Blood Pressure Management Guidelines:
1. 🧂 Moderate Sodium: Keep daily sodium intake under 2,000mg; minimize packaged snacks, pickles, and processed meats.
2. 🍌 Potassium-Rich Foods: Bananas, spinach, sweet potatoes, and coconut water naturally counterbalance sodium levels.
3. 🏃 30 Minutes Brisk Cardio: Consistent aerobic movement enhances vascular compliance and lowers resting blood pressure.
4. ☕ Limit high stimulants, stay hydrated, and manage chronic stress.`;
    }
  }

  // 12. Hair Fall & Glowing Skin
  if (
    q.includes('hair') ||
    q.includes('baal') ||
    q.includes('skin') ||
    q.includes('glow') ||
    q.includes('बाल') ||
    q.includes('त्वचा') ||
    q.includes('चेहरा') ||
    q.includes('ग्लो')
  ) {
    if (lang === 'hi') {
      return `✨ स्वस्थ बालों और चमकदार त्वचा के लिए आंतरिक पोषण:
1. 💧 पर्याप्त पानी (2.5L+): त्वचा में चमक और नमी का सबसे बड़ा स्रोत पानी है।
2. 🥚 बायोटिन और प्रोटीन: बाल केराटिन (प्रोटीन) से बने हैं। अंडे, बादाम, अखरोट, और अलसी के बीज खाएं।
3. 🍊 विटामिन C और एंटीऑक्सीडेंट: आंवला, संतरा, नींबू और टमाटर कोलेजन निर्माण को बढ़ाते हैं।
4. 🌙 7-8 घंटे की गहरी नींद: रात में ही त्वचा की कोशिकाएं रिपेयर होती हैं।`;
    } else {
      return `✨ Internal nutrition for resilient hair & radiant skin:
1. 💧 Deep Hydration (2.5L+): Cellular hydration keeps skin elastic, supple, and glowing.
2. 🥚 Biotin, Zinc & Protein: Hair follicles are made of keratin protein. Eat eggs, walnuts, almonds, and flaxseeds.
3. 🍊 Vitamin C & Collagen: Amla, citrus fruits, and berries stimulate natural collagen synthesis.
4. 🌙 7-8 Hours Restorative Sleep: Cellular repair and turnover peak during deep stage-3 sleep.`;
    }
  }

  // 13. Tea, Coffee & Caffeine
  if (
    q.includes('chai') ||
    q.includes('tea') ||
    q.includes('coffee') ||
    q.includes('caffeine') ||
    q.includes('चाय') ||
    q.includes('कॉफी') ||
    q.includes('कॉफ़ी')
  ) {
    if (lang === 'hi') {
      return `☕ चाय और कॉफ़ी का सही स्वास्थ्य नियम:
1. ⏱️ समय का ध्यान: शाम 4 बजे के बाद कैफीन न लें, क्योंकि कैफीन का असर शरीर में 6-8 घंटे रहता है और नींद खराब करता है।
2. 🚫 खाली पेट न पिएं: सुबह उठते ही खाली पेट चाय/कॉफी पीने से एसिडिटी और कॉर्टिसोल स्पाइक होता है; पहले गुनगुना पानी पिएं।
3. 🥛 सुरक्षित मात्रा: दिन में 2 से 3 कप तक चाय/कॉफी सुरक्षित मानी जाती है। अत्यधिक चीनी डालने से बचें।`;
    } else {
      return `☕ Optimal guidelines for Tea & Coffee consumption:
1. ⏱️ 4:00 PM Curfew: Caffeine has a 5-8 hour half-life in the bloodstream; avoid late consumption to safeguard deep sleep.
2. 🚫 Avoid on an empty stomach: Drinking concentrated caffeine first thing triggers gastric acidity and cortisol spikes; hydrate first.
3. 🥛 Healthy Moderation: 2-3 standard cups daily provide antioxidant benefits. Minimize refined sugar and heavy creamer.`;
    }
  }

  // 14. Water & Hydration
  if (
    q.includes('pani') ||
    q.includes('water') ||
    q.includes('hydration') ||
    q.includes('पानी') ||
    q.includes('जल') ||
    q.includes('प्यास')
  ) {
    const water = log?.water?.totalMl || 0;
    const goal = user.goals?.dailyWaterMl || 2500;
    const remaining = Math.max(0, goal - water);

    if (lang === 'hi') {
      if (remaining > 0) {
        return `💧 आज आपने ${water} ml पानी पिया है। अपने दैनिक लक्ष्य (${goal} ml) को पूरा करने के लिए अभी ${remaining} ml (लगभग ${Math.ceil(remaining / 250)} गिलास) बाकी है!\n- हर 1 घंटे में 1 गिलास पानी पिएं।\n- पास में एक पानी की बोतल रखें ताकि याद रहे।\nपर्याप्त पानी से ऊर्जा, पाचन और त्वचा सब बेहतरीन रहते हैं!`;
      } else {
        return `🎉 बधाई हो! आपने आज का ${goal} ml पानी का लक्ष्य सफलतापूर्वक पूरा कर लिया है (${water} ml लॉग किया गया)। शरीर को हाइड्रेटेड रखना मेटाबॉलिज्म के लिए सर्वोत्तम है!`;
      }
    } else {
      if (remaining > 0) {
        return `💧 You've logged ${water} ml out of your ${goal} ml goal. You need ${remaining} ml (about ${Math.ceil(remaining / 250)} glasses) to finish today! Keep a bottle on your desk and take consistent sips.`;
      } else {
        return `🎉 Awesome! You have already hit your daily water goal of ${goal} ml (${water} ml logged). Excellent discipline!`;
      }
    }
  }

  // 15. Diet, Meals & Dinner
  if (
    q.includes('khana') ||
    q.includes('food') ||
    q.includes('diet') ||
    q.includes('dinner') ||
    q.includes('lunch') ||
    q.includes('breakfast') ||
    q.includes('meal') ||
    q.includes('calorie') ||
    q.includes('protein') ||
    q.includes('डिनर') ||
    q.includes('खाना') ||
    q.includes('खाऊं') ||
    q.includes('खाऊ') ||
    q.includes('नाश्ता') ||
    q.includes('भोजन') ||
    q.includes('डाइट') ||
    q.includes('कैलोरी') ||
    q.includes('प्रोटीन')
  ) {
    const calories = (log?.meals || []).reduce((s, m) => s + (m.calories || 0), 0);
    const goal = user.goals?.dailyCalories || 2000;
    const remaining = Math.max(0, goal - calories);
    const proteinConsumed = (log?.meals || []).reduce((s, m) => s + (m.protein || 0), 0);
    const proteinGoal = user.goals?.dailyProteinGrams || 120;

    if (lang === 'hi') {
      return `🥗 आज आपने ${calories} kcal ली है, आपके पास ${remaining} kcal बची हुई हैं (प्रोटीन: ${proteinConsumed}g / ${proteinGoal}g लक्ष्य)।

स्वस्थ भोजन के उत्तम सुझाव:
1. 2 मल्टीग्रेन रोटी + 100g पनीर भुर्जी + खीरे का सलाद (~380 kcal, 22g प्रोटीन)
2. मूंग दाल की खिचड़ी + 1 कटोरी ताजा दही (~320 kcal, 14g प्रोटीन)
3. ग्रिल्ड सब्जियां / टोफू / उबले अंडे + हरी चटनी (~280 kcal)
टिप: रात का भोजन सोने से 2 घंटे पहले समाप्त कर लें!`;
    } else {
      return `🥗 Today you have logged ${calories} kcal with ${remaining} kcal remaining (Protein: ${proteinConsumed}g / ${proteinGoal}g target).

Top balanced meal ideas:
1. 2 Rotis with Paneer Bhurji / Tofu & cucumber salad (~380 kcal, 22g protein)
2. Yellow Lentil Soup (Moong Dal) with steamed vegetables & Greek yogurt (~320 kcal)
3. Grilled chicken breast or scrambled egg whites with sautéed veggies
Tip: Finish dinner at least 2 hours before bed for sound digestion!`;
    }
  }

  // 16. Sleep & Rest
  if (
    q.includes('neend') ||
    q.includes('sleep') ||
    q.includes('soye') ||
    q.includes('sona') ||
    q.includes('tired') ||
    q.includes('fatigue') ||
    q.includes('नींद') ||
    q.includes('सोने') ||
    q.includes('थकान') ||
    q.includes('आराम')
  ) {
    if (lang === 'hi') {
      return `🌙 गहरी और ताजगी भरी नींद के 4 अचूक नियम:
1. 📱 सोने से 45 मिनट पहले स्क्रीन बंद कर दें (नीली रोशनी मेलाटोनिन को रोकती है)।
2. ☕ शाम 4-5 बजे के बाद चाय या कॉफी न पिएं।
3. 🛏️ कमरे को अंधेरा, शांत और हल्का ठंडा रखें।
4. 🧘 सोने से पहले 5 मिनट गहरी सांस लें या 10 मिनट स्ट्रेचिंग करें। कम से कम 7-8 घंटे की निर्बाध नींद लें!`;
    } else {
      return `🌙 4 Proven habits for deep, restorative sleep:
1. 📱 Power down electronic screens 45 minutes before bed (blue light blunts melatonin release).
2. ☕ Avoid caffeine intake after 4:00 PM.
3. 🛏️ Maintain a cool, pitch-dark, and quiet sleep sanctuary.
4. 🧘 Practice 5 minutes of mindful breathwork before sleeping. Target 7-8 hours nightly!`;
    }
  }

  // 17. Workout & Exercise
  if (
    q.includes('workout') ||
    q.includes('kasrat') ||
    q.includes('exercise') ||
    q.includes('gym') ||
    q.includes('run') ||
    q.includes('walk') ||
    q.includes('stamina') ||
    q.includes('कसरत') ||
    q.includes('व्यायाम') ||
    q.includes('वर्कआउट') ||
    q.includes('दौड़') ||
    q.includes('स्टैमिना')
  ) {
    const burned = (log?.workouts || []).reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    if (lang === 'hi') {
      return `💪 आज आपने कसरत में ${burned} kcal जलाई है।
सर्वोत्तम वर्कआउट रूटीन:
1. 5 मिनट वार्म-अप (जंपिंग जैक्स, जॉइंट रोटेशन)
2. 20 मिनट बॉडीवेट सर्किट: 3 सेट (12 पुश-अप्स, 15 स्क्वैट्स, 12 लंज, 30s प्लैंक)
3. 10 मिनट कूल-डाउन वॉक और स्ट्रेचिंग
सप्ताह में कम से कम 4-5 दिन सक्रिय रहें!`;
    } else {
      return `💪 You've burned ${burned} kcal through workouts today.
Recommended routine:
1. 5-min dynamic warm-up (jumping jacks, shoulder rotations)
2. 20-min functional circuit: 3 sets (12 push-ups, 15 bodyweight squats, 12 lunges, 30s plank)
3. 10-min cool-down walk and hamstring stretch
Aim for 4-5 active training sessions weekly!`;
    }
  }

  // 18. Weight Management
  if (
    q.includes('vajan') ||
    q.includes('weight') ||
    q.includes('fat') ||
    q.includes('lose') ||
    q.includes('gain') ||
    q.includes('वजन') ||
    q.includes('मोटापा') ||
    q.includes('कम')
  ) {
    const weight = user.profile?.currentWeight || 70;
    const target = user.profile?.targetWeight || 68;
    const diff = Math.abs(weight - target).toFixed(1);
    if (lang === 'hi') {
      return `⚖️ वर्तमान वजन: ${weight} kg | लक्ष्य वजन: ${target} kg (अंतर: ${diff} kg)।
स्वस्थ वजन प्रबंधन के नियम:
- रोजाना 300-400 kcal का हल्का डेफिसिट रखें (भूखे कभी न रहें)।
- 8,000 से 10,000 कदम दैनिक चलने का लक्ष्य बनाएं।
- पर्याप्त प्रोटीन लें ताकि फैट कम हो और मांसपेशियां सुरक्षित रहें!`;
    } else {
      return `⚖️ Current weight: ${weight} kg | Target weight: ${target} kg (Difference: ${diff} kg).
Sustainable weight management guidelines:
- Maintain a moderate 300-400 kcal daily deficit (avoid crash diets).
- Strive for 8,000 to 10,000 daily steps.
- Prioritize dietary protein to preserve lean muscle while burning body fat!`;
    }
  }

  // 19. Habits & Streaks
  if (
    q.includes('habit') ||
    q.includes('streak') ||
    q.includes('routine') ||
    q.includes('आदत') ||
    q.includes('लकीर') ||
    q.includes('दिनचर्या')
  ) {
    if (lang === 'hi') {
      return `🔥 आदतें और लकीरें (Streaks) बनाने का नियम: 'कभी भी लगातार दो दिन मिस न करें'। अगर समय की कमी हो, तो आदत का छोटा 2 मिनट का वर्जन करें। दैनिक निरंतरता ही जीवन बदलती है!`;
    } else {
      return `🔥 The golden rule of habit streaks: 'Never miss twice'. On hectic days, execute a 2-minute micro version of your habit. Relentless daily consistency compounds into extraordinary long-term results!`;
    }
  }

  // 20. Dynamic Intelligent Advisor for ANY other health question
  if (lang === 'hi') {
    return `💡 आपके स्वास्थ्य प्रश्न "${question}" के लिए AI वेलनेस सलाह:
1. 🎯 संतुलन और निरंतरता: किसी भी स्वास्थ्य लक्ष्य में अचानक बड़े बदलाव के बजाय छोटे, दैनिक सुधार सबसे टिकाऊ होते हैं।
2. 💧 पोषण और पानी: दिन भर में 2.5-3 लीटर पानी पिएं और रिफाइंड शुगर से दूरी रखें।
3. 🏃 सक्रियता: रोजाना कम से कम 30 मिनट शारीरिक हलचल या वॉक जरूर रखें।
4. 🩺 यदि यह किसी विशिष्ट चिकित्सीय समस्या या दर्द से संबंधित है, तो कृपया किसी योग्य डॉक्टर से चिकित्सीय परामर्श जरूर लें।
मुझसे डाइट, कसरत, नींद या पानी के बारे में कुछ भी पूछ सकते हैं! 🌟`;
  } else {
    return `💡 AI Health Guidance regarding "${question}":
1. 🎯 Sustainable Balance: For any wellness objective, consistent small daily habits outperform drastic short-term extremes.
2. 💧 Nutrition & Hydration: Maintain 2.5-3L water intake and avoid heavily refined sugars and oils.
3. 🏃 Movement: Accumulate at least 30 minutes of intentional daily movement or walking.
4. 🩺 If this involves an acute medical symptom or clinical condition, please consult a qualified healthcare provider.
Feel free to ask me for specific meal, workout, sleep, or hydration strategies! 🌟`;
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
    const habits = await Habit.find({ user: req.user._id, isActive: true });

    // 1. First, attempt real generative AI via Google Gemini API if configured
    let reply = await callGeminiLLM(question, user, log, habits, lang);

    // 2. If Gemini API is not configured or offline, use our comprehensive expert knowledge engine
    if (!reply) {
      reply = getExpertHealthAdvice(question, user, log, lang);
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

