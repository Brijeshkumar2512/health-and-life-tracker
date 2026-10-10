# 🥗 Health & Life Tracker

> A unified full-stack web application designed to help users take control of their physical well-being, nutritional habits, recovery, and daily routines with interactive visual analytics. Built according to the **Health & Life Tracker Product Requirements Document (PRD v1.0)**.

---

## 🌟 Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Axios, React Router v7
* **Backend:** Node.js, Express 5, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, CORS
* **Database:** MongoDB (with zero-configuration automatic in-memory fallback via `mongodb-memory-server` and customizable `MONGO_URI`)

---

## 🚀 Features Implemented

### 1. Authentication & Session Management (FR-01 to FR-04)
* Secure user registration and login with encrypted password storage (`bcryptjs`).
* Stateless JWT authentication with route guards on both frontend and backend.
* **One-Click Demo Account:** Instantly log in as `alex@healthtracker.io` without having to type credentials.

### 2. User Profile & Custom Goals Module (FR-05, FR-06)
* Physical metric management: Age, Height (cm), Current Weight (kg), Target Weight (kg), Activity Level, and Gender.
* Real-time Body Mass Index (BMI) and target delta calculation.
* Customizable daily wellness goals:
  * Daily Calorie consumption target (kcal)
  * Daily Hydration target (ml)
  * Sleep duration target (hours)
  * Macronutrient target breakdown (Protein, Carbohydrates, Fats in grams)

### 3. Daily Tracking Module (FR-07 to FR-10)
* **Hydration Tracker:** Visual hydration fill gauge with quick increments (`+250ml`, `+500ml`, custom ml) and daily target progress bar.
* **Categorized Nutrition Logger:** Organize meals by **Breakfast, Lunch, Dinner, and Snacks**. Log food names, calories, and grams of protein, carbs, and fat.
* **Physical Workouts:** Record exercises (Cardio, Strength, HIIT, Yoga, Walking, Sports), duration in minutes, and estimated calories burned.
* **Sleep, Recovery & Mood:** Log total hours slept, 1–5 star sleep quality rating, mood emoji/tags, and daily journal reflection notes.
* **Date Navigation:** Seamlessly jump across previous days, next day, today, or pick any calendar date.

### 4. Habit & Routine Tracker with Dynamic Streaks (FR-11 to FR-13)
* Create, edit, and delete custom daily or weekly habits with category tags and color accents.
* **Interactive 7-Day Matrix:** Click any day circle in the last 7 calendar days to immediately toggle completion for that date.
* **Automatic Streak Calculations:** Automatically computes current active streaks and all-time record streaks.

### 5. Analytics & Dashboard Module (FR-14, FR-15)
* **Summary Metric Cards:** Real-time metrics for today (Calories remaining, water drank %, sleep recorded, active habits/streaks).
* **Interactive Recharts Visualizations (7, 14, and 30-day filters):**
  * **Calorie Balance Chart:** Consumed vs Burned vs Calorie Target Line.
  * **Weight Progression Chart:** Historical trend toward target goal weight.
  * **Macronutrient Donut Chart:** Aggregated Protein, Carbs, and Fats intake distribution.
  * **Sleep & Recovery Chart:** Nightly hours slept vs 8-hour goal.
  * **Habit Completion Trends:** Consistency percentage over time.
* **One-Click Demo Seeder:** Button to populate 14 days of realistic logs and habits with active streaks.

---

## 🛠️ Project Structure

```
Health & Life Tracker/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection with in-memory fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me
│   │   ├── userController.js   # Physical metrics & goals
│   │   ├── logController.js    # Meals, water, workouts, sleep & mood
│   │   ├── habitController.js  # Habits CRUD & streak toggle
│   │   └── analyticsController.js # Dashboard summary, charts & demo seeder
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT validation
│   │   └── errorHandler.js     # Express error handling
│   ├── models/
│   │   ├── User.js             # User credentials, profile & goals
│   │   ├── DailyLog.js         # Daily log with meals, water, workouts, sleep
│   │   └── Habit.js            # Habit schema with completedDates array
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── logRoutes.js
│   │   ├── habitRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   └── streakCalculator.js # Streak calculation algorithm
│   ├── .env                    # Configured on PORT 5001
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── QuickAddWaterModal.jsx
│   │   │   ├── MealModal.jsx
│   │   │   ├── WorkoutModal.jsx
│   │   │   ├── SleepMoodModal.jsx
│   │   │   ├── HabitModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DailyLog.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── package.json
└── README.md
```

---

## 🏃 Quick Start Guide

### 1. Start the Backend Server (Port 5001)
```powershell
cd "e:\Health & Life Tracker\backend"
node server.js
```
*Note: If no local MongoDB service is running, the server automatically starts an in-memory MongoDB instance with zero manual setup required.*

### 2. Start the Frontend Application (Port 3000)
In a separate terminal:
```powershell
cd "e:\Health & Life Tracker\frontend"
npm run dev
```

### 3. Open in Browser
Navigate to:
```
http://localhost:3000
```
Click **"One-Click Demo Account"** on the login page to immediately sign in and explore the pre-populated dashboard, interactive charts, and streak tracker!
