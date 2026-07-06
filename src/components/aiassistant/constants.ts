import type { GuideSelection, RecommendationQuestion } from "./types";

export const DEFAULT_BRAND_NAME = "NutriStack";
export const MAX_GUIDE_USES = 3;

export const GUIDE_LIMIT_MESSAGE =
  "You have used your 3 free personalized NutriStack guides.";

export const NO_MATCHING_PRODUCTS_MESSAGE =
  "I could not find matching NutriStack products right now.";

export const LOGIN_REQUIRED_MESSAGE =
  "Please log in to use the NutriStack AI assistant.";

export const GUIDE_SELECTIONS: GuideSelection[] = [
  {
    id: "whey",
    label: "Whey Protein",
    searchQueries: ["whey protein"],
    isStack: false,
  },
  {
    id: "creatine",
    label: "Creatine",
    searchQueries: ["creatine"],
    isStack: false,
  },
  {
    id: "multivitamin",
    label: "Multivitamin",
    searchQueries: ["multivitamins"],
    isStack: false,
  },
  {
    id: "preworkout",
    label: "Pre-workout",
    searchQueries: ["pre workout"],
    isStack: false,
  },
  {
    id: "whey-creatine",
    label: "Whey + Creatine Stack",
    searchQueries: ["whey protein", "creatine"],
    isStack: true,
  },
];

const budgetQuestion = (stack = false): RecommendationQuestion => ({
  id: "budget",
  prompt: stack
    ? "What is your maximum total stack budget in Indian Rupees (INR)?"
    : "What is your maximum budget in Indian Rupees (INR)?",
  placeholder: "For example: 2000 or ₹2,000",
});

const trainingDaysQuestion: RecommendationQuestion = {
  id: "trainingDays",
  prompt: "How many days do you train per week?",
  placeholder: "For example: 4 days",
  options: ["1–2 days", "3–4 days", "5–6 days", "Every day"],
};

const bodyWeightQuestion: RecommendationQuestion = {
  id: "bodyWeight",
  prompt: "What is your body weight?",
  placeholder: "For example: 72 kg",
};

const workoutIntensityQuestion: RecommendationQuestion = {
  id: "workoutIntensity",
  prompt: "How intense are your usual workouts?",
  placeholder: "Choose or describe the intensity",
  options: ["Light", "Moderate", "High", "Very high"],
};

const creatineExperienceQuestion: RecommendationQuestion = {
  id: "creatineExperience",
  prompt: "Have you used creatine before, and did it suit you?",
  placeholder: "For example: first time, or monohydrate caused discomfort",
  options: ["First time", "Used it successfully", "It caused discomfort"],
};

export const GUIDE_QUESTIONS: Record<
  GuideSelection["id"],
  RecommendationQuestion[]
> = {
  whey: [
    {
      id: "goal",
      prompt: "What is your main goal for adding whey protein?",
      placeholder: "Choose your main goal",
      options: [
        "Muscle gain",
        "Fat loss",
        "Weight gain",
        "Strength",
        "General protein support",
      ],
    },
    bodyWeightQuestion,
    {
      id: "dietPreference",
      prompt: "Which diet pattern best describes you?",
      placeholder: "Choose your diet pattern",
      options: ["Vegetarian", "Non-vegetarian", "Vegan"],
    },
    trainingDaysQuestion,
    {
      id: "safety",
      prompt:
        "Any allergies, lactose sensitivity, acidity, bloating, kidney/liver issues, pregnancy, medication use, or serious condition?",
      placeholder: "Describe them, or type none",
      options: ["None", "Lactose sensitive", "Bloating or acidity", "Allergy", "Medical condition or medication"],
    },
    {
      id: "productPreference",
      prompt: "What matters most when choosing your whey?",
      placeholder: "Choose your preference",
      options: ["Budget-friendly", "Lean / low-carb", "Easy digestion"],
    },
    budgetQuestion(),
  ],
  creatine: [
    {
      id: "goal",
      prompt: "What do you mainly want creatine to support?",
      placeholder: "Choose your goal",
      options: ["Strength", "Muscle gain", "Performance", "General gym support"],
    },
    trainingDaysQuestion,
    creatineExperienceQuestion,
    {
      id: "safety",
      prompt:
        "Any stomach discomfort, allergies, lactose sensitivity, acidity, bloating, kidney/liver issues, pregnancy, medication use, or serious condition?",
      placeholder: "Describe them, or type none",
      options: ["None", "Stomach discomfort", "Bloating or acidity", "Medical condition or medication"],
    },
    {
      id: "productPreference",
      prompt: "Which creatine preference is more important to you?",
      placeholder: "Choose your preference",
      options: ["Most proven / budget-friendly", "Easier digestion"],
    },
    budgetQuestion(),
  ],
  multivitamin: [
    {
      id: "multivitaminReason",
      prompt: "What is your main reason for considering a multivitamin?",
      placeholder: "Choose the closest reason",
      options: ["General wellness", "Diet gaps", "Vegetarian diet", "Low energy", "Busy lifestyle"],
    },
    {
      id: "dietPattern",
      prompt: "Which diet pattern best describes you?",
      placeholder: "Choose your diet pattern",
      options: ["Vegetarian", "Non-vegetarian", "Vegan", "Mixed"],
    },
    {
      id: "produceDaily",
      prompt: "Do you usually eat fruits and vegetables every day?",
      placeholder: "Describe your usual intake",
      options: ["Yes, most days", "Sometimes", "Rarely"],
    },
    {
      id: "doctorRecommendation",
      prompt: "Do you have a diagnosed deficiency or a doctor recommendation?",
      placeholder: "Describe it, or type no",
      options: ["No", "Yes — doctor recommended"],
    },
    {
      id: "safety",
      prompt:
        "Any allergies, lactose sensitivity, acidity, bloating, kidney/liver issues, pregnancy, medication use, or serious condition?",
      placeholder: "Describe them, or type none",
      options: ["None", "Pregnancy", "Medication use", "Kidney/liver issue", "Allergy or serious condition"],
    },
    budgetQuestion(),
  ],
  preworkout: [
    {
      id: "preWorkoutGoal",
      prompt: "What do you want pre-workout to help with most?",
      placeholder: "Choose your main reason",
      options: ["Energy", "Focus", "Pump", "Strength performance", "Fatigue during workouts"],
    },
    {
      id: "trainingTime",
      prompt: "What time do you usually train?",
      placeholder: "Choose your usual training time",
      options: ["Morning", "Afternoon", "Evening", "Late night"],
    },
    {
      id: "caffeineSensitivity",
      prompt: "How sensitive are you to caffeine?",
      placeholder: "Choose the closest answer",
      options: ["Low sensitivity", "Normal", "High sensitivity", "Not sure"],
    },
    {
      id: "dailyCaffeine",
      prompt: "How much caffeine do you already take daily?",
      placeholder: "Coffee, tea, energy drinks, cola, fat burners, etc.",
    },
    {
      id: "preWorkoutSymptoms",
      prompt:
        "Do you have anxiety, sleep issues, high blood pressure, heart palpitations, chest pain, or panic attacks?",
      placeholder: "Describe them, or choose none",
      options: ["None", "Anxiety", "Sleep issues", "High BP", "Palpitations", "Chest pain", "Panic attacks"],
    },
    {
      id: "preWorkoutMedical",
      prompt: "Are you taking medication or do you have kidney, liver, or heart issues?",
      placeholder: "Describe them, or choose no",
      options: ["No", "Medication", "Kidney issue", "Liver issue", "Heart issue"],
    },
    budgetQuestion(),
  ],
  "whey-creatine": [
    {
      id: "goal",
      prompt: "What is your main goal for this whey and creatine stack?",
      placeholder: "Choose your main goal",
      options: ["Muscle gain", "Strength", "Performance", "Weight gain", "Fat loss"],
    },
    bodyWeightQuestion,
    trainingDaysQuestion,
    workoutIntensityQuestion,
    {
      id: "dietPreference",
      prompt: "Which diet pattern best describes you?",
      placeholder: "Choose your diet pattern",
      options: ["Vegetarian", "Non-vegetarian", "Vegan", "Mixed"],
    },
    {
      id: "safety",
      prompt:
        "Any allergies, lactose sensitivity, bloating, acidity, kidney/liver issues, pregnancy, medication use, or serious condition?",
      placeholder: "Describe them, or type none",
      options: ["None", "Lactose sensitive", "Bloating or acidity", "Medical condition or medication"],
    },
    creatineExperienceQuestion,
    budgetQuestion(true),
  ],
};

export const DEFAULT_USAGE = { guideCount: 0 } as const;
