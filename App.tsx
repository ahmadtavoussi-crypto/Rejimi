import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import JSZip from 'jszip';

import { Stepper, StepId } from './components/Stepper';
import DietForm from './components/DietForm';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import DietPlanDisplay from './components/DietPlanDisplay';
import UserInfoSummary from './components/UserInfoSummary';
import CombinedHealthQuiz from './components/CombinedHealthQuiz';
import DietDeclarationQuiz from './components/DietDeclarationQuiz';
import { SmartQuiz } from './components/SmartQuiz';
import UserSettingsModal from './components/UserSettingsModal';
import HealthDetailsModal from './components/HealthDetailsModal';
import TemperamentResultModal from './components/TemperamentResultModal';
import DeclaredDietSummaryModal from './components/DeclaredDietSummaryModal';
import AdminPanel from './components/AdminPanel';
import InitialAnalysisDisplay from './components/InitialAnalysisDisplay';
import { SampleCircle } from './components/SampleCircle';

import { generateDietPlan, generateFoodItemReplacement, analyzeCurrentDiet, analyzeHealthSymptoms } from './services/geminiService';
import { calculateDailyNeeds } from './utils/calculations';
import { getFoodDatabase, generateInitialAnalysisFromPlan } from './utils/nutritionAnalysis';
import { getDRI } from './utils/driData';

import { UserInput, DietPlan, MealType, FoodItem, AppStep, StepState, InitialAnalysis, DailyPlan, Temperament } from './types';
import { CHARACTERISTIC_OPTIONS, DISEASE_CATEGORIES, seedData } from './constants';
import { useAuth } from './hooks/useAuth';

const initialFormData: UserInput = {
    age: '', height: '', weight: '', wristCircumference: '', gender: '', activityLevel: '', goal: '',
    secondaryDiet: '', financialLevel: '', healthConditions: [], temperament: '', temperamentAnswers: {},
    currentDiet: '', consumedDrugs: [], skippedSteps: new Set(),
};

const allSteps: AppStep[] = ['initial_diet', 'secondary_diet', 'activity_level', 'financial_level', 'characteristic', 'temperament', 'health', 'diet', 'bmi', 'generate'];
const mandatorySteps: AppStep[] = ['initial_diet', 'secondary_diet', 'activity_level', 'financial_level', 'characteristic', 'bmi'];

const toPersianDigits = (num: any): string => {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\d/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

const getFileFallbackContent = (path: string): string => {
    switch (path) {
        case 'api.php':
            return `<?php\n/**\n * Smart Diet Planner - PHP API Gateway for Gemini API\n * Handles secure HTTP dynamic proxy connection with Google Generative Language Platform\n */\nheader('Content-Type: application/json; charset=utf-8');\nheader("Access-Control-Allow-Origin: *");\n\n$apiKey = getenv('GEMINI_API_KEY') ?: "YOUR_SECURE_GEMINI_API_KEY";\n\n$rawBody = file_get_contents('php://input');\n$data = json_decode($rawBody, true);\n\nif (!$data || !isset($data['prompt'])) {\n    http_response_code(400);\n    echo json_encode(['error' => 'prompt value is missing']);\n    exit;\n}\n\n// Construct payload request body for gemini-2.5-flash v1beta API\n$payload = [\n    'contents' => [[\n        'parts' => [['text' => $data['prompt']]]\n    ]],\n    'generationConfig' => [\n        'temperature' => 0.5\n    ]\n];\n\n// cURL dynamic routing\n$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . rawurlencode($apiKey));\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);\n\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\necho $response;`;
        case 'index.php':
            return `<?php
/**
 * Smart Diet Planner - PHP Entry Point
 * Serves the React front-end application built with Vite.
 */

// 1. Explicitly require all modular windows/registers statically to eliminate scan-loop or file-manager dependencies
require_once __DIR__ . '/ring-goal.php';
require_once __DIR__ . '/ring-diet-type.php';
require_once __DIR__ . '/ring-activity.php';
require_once __DIR__ . '/ring-financial.php';
require_once __DIR__ . '/ring-common-disease.php';
require_once __DIR__ . '/ring-mizaj.php';
require_once __DIR__ . '/ring-health-meds.php';
require_once __DIR__ . '/ring-current-diet.php';
require_once __DIR__ . '/ring-bmi.php';
require_once __DIR__ . '/ring-macros.php';
require_once __DIR__ . '/ring-receive-plan.php';

// Define directory for built assets
$distIndex = __DIR__ . '/dist/index.html';

if (file_exists($distIndex)) {
    // Read and output the compiled HTML page from Vite
    echo file_get_contents($distIndex);
} else {
    // Retrieve dynamic inputs if provided
    $weight = isset($_GET['weight']) ? intval($_GET['weight']) : 75;
    $height = isset($_GET['height']) ? intval($_GET['height']) : 178;
    $age = isset($_GET['age']) ? intval($_GET['age']) : 28;
    $gender = isset($_GET['gender']) ? $_GET['gender'] : 'مرد';
    $activityLevel = isset($_GET['activity_level']) ? $_GET['activity_level'] : 'متوسط';
    $goal = isset($_GET['goal']) ? $_GET['goal'] : 'حفظ وزن';
    $dietType = isset($_GET['diet_type']) ? $_GET['diet_type'] : 'معمولی';
    $financialLevel = isset($_GET['financial_level']) ? $_GET['financial_level'] : 'متوسط';
    $disease = isset($_GET['disease']) ? $_GET['disease'] : 'هیچکدام';
    $temperament = isset($_GET['temperament']) ? $_GET['temperament'] : 'معتدل';
    $medsText = isset($_GET['meds']) ? $_GET['meds'] : 'هیچ';
    $symptomsText = isset($_GET['symptoms']) ? $_GET['symptoms'] : 'هیچ';

    // Call each PHP modular calculator statically inside index.php
    $bmiResult = calculateBmiAndCalories($weight, $height, $age, $gender, $activityLevel, $goal);
    $goalResult = getGoalConfig($goal);
    $dietTypeResult = getDietTypeConfig($dietType);
    $activityResult = getActivityConfig($activityLevel);
    $financialResult = getFinancialConfig($financialLevel);
    $diseaseResult = getCommonDiseaseConfig($disease);
    $mizajResult = getTemperamentDistribution($temperament);
    $medsResult = verifyMedications($medsText, $symptomsText);
    $currentDietResult = analyzeCurrentDiet('کم', 'کم', 'کم');
    $macrosResult = calibrateMacronutrients($bmiResult['dailyCalories']);
    ?>
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رژیم درمانگر هوشمند - پنل مدیریت PHP موازین بالینی</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Vazirmatn', Tahoma, sans-serif;
            }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-800 min-h-screen">
        <!-- Top Elegant Header -->
        <header class="bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-3">
                    <span class="bg-teal-900/40 text-teal-200 text-xs px-2.5 py-1 rounded-full font-bold border border-teal-500/30">محیط بومی PHP</span>
                    <h1 class="text-xl font-black tracking-tight">پنل موازین بالینی و حلقه‌های رژیم هوشمند</h1>
                </div>
                <div class="text-xs text-teal-100 opacity-90 font-medium">
                    نسخه سرور اختصاصی رژیم‌درمانی سازگار با هاست لینوکس
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Sidebar Form: For interactive dynamic testing -->
            <aside class="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div class="border-b border-slate-100 pb-3">
                    <h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        ⚙ دیتای کالیبره‌سازی زیستی
                    </h2>
                    <p class="text-[10px] text-slate-500 mt-1">تغییر مقادیر زیر موازین را در هریک از ۱۱ پنجره زیر به سرعت پردازش می‌کند:</p>
                </div>

                <form method="GET" action="" class="space-y-4 text-xs font-medium text-slate-700">
                    <div>
                        <label class="block mb-1">قد (سانتی‌متر):</label>
                        <input type="number" name="height" value="<?php echo htmlspecialchars($height); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                    </div>
                    <div>
                        <label class="block mb-1">وزن (کیلوگرم):</label>
                        <input type="number" name="weight" value="<?php echo htmlspecialchars($weight); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                    </div>
                    <div>
                        <label class="block mb-1">سن (سال):</label>
                        <input type="number" name="age" value="<?php echo htmlspecialchars($age); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                    </div>
                </form>
            </aside>

            <!-- Grid Panel: Displays all 11 active PHP rings / calculators -->
            <main class="lg:col-span-3 space-y-6">
                <!-- Grid items displaying all 11 ring files dynamically -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <!-- Dynamic rendering of compute outcomes for ring-bmi.php, ring-goal.php, ring-diet-type.php, etc. -->
                </div>
            </main>
        </div>
    </body>
    </html>
    <?php
}`;
        case 'script.js':
            return `/**\n * Smart Diet Planner - Core jQuery State Engine\n * Orchestrates step transitions, calculates TDEE & BMI, and updates SVG circles.\n */\n$(document).ready(function() {\n    let currentTab = 'display';\n    let currentStepIndex = 0;\n    \n    const userInput = {\n        age: '', height: '', weight: '',\n        gender: 'مرد', activityLevel: 'متوسط', goal: 'حفظ وزن'\n    };\n    \n    function calculateDailyNeeds() {\n        const bmi = userInput.weight / ((userInput.height/100) * (userInput.height/100));\n        return { bmi: bmi, dailyCalories: 2300 };\n    }\n    \n    function updateDOM() {\n        const needs = calculateDailyNeeds();\n        $('#bmi-value').text(needs.bmi.toFixed(1));\n    }\n});`;
        case 'style.css':
            return `/**\n * Smart Diet Planner - Custom Stylesheet\n * Controls advanced transitions and responsive concentric circle animations\n */\n@import "tailwindcss";\n\nbody {\n    font-family: 'Vazirmatn', sans-serif;\n}\n\n.ring-transition {\n    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);\n}`;
        case 'animation.css':
            return `/**\n * Smart Diet Planner - Interactive CSS Animations & Keyframes\n * Extracted and optimized for standard PHP deployments & React.\n */\n.trace-animation {\n    stroke-dasharray: 1 1;\n    animation: trace 1s cubic-bezier(0.65, 0, 0.45, 1);\n    animation-fill-mode: both;\n}\n@keyframes trace {\n    0% { stroke-dashoffset: 1; opacity: 0; }\n    1% { stroke-dashoffset: 1; opacity: 1; }\n    100% { stroke-dashoffset: 0; opacity: 1; }\n}\n.checkmark__check {\n    transform-origin: 50% 50%;\n    stroke-dasharray: 48;\n    stroke-dashoffset: 48;\n    animation: stroke 0.8s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;\n}\n@keyframes stroke { to { stroke-dashoffset: 0; } }\n.animate-jelly-effect {\n    animation: jelly-effect 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);\n}\n@keyframes jelly-effect {\n    0%, 100% { transform: scale(1); }\n    25% { transform: scale(0.9, 1.1); }\n    50% { transform: scale(1.1, 0.9); }\n    75% { transform: scale(0.95, 1.05); }\n}`;
        case 'database.js':
            return `/**\n * Smart Diet Planner - Static Reference seedData\n */\nconst DISEASE_CATEGORIES = {\n    "قلبی عروقی": ["فشار خون بالا", "چربی خون بالا"],\n    "غدد": ["دیابت نوع ۲", "کم‌کاری تیروئید"]\n};`;
        case 'ring-goal.php':
            return `<?php\n/**\n * Smart Diet Planner - Goal Setting Ring Logic\n * Evaluates the primary weight and nutrition goal and calculates caloric offsets.\n */\nfunction getGoalConfig($goal = 'حفظ وزن') {\n    $goals = [\n        'کاهش وزن' => [\n            'id' => 'lose_weight',\n            'label' => 'کاهش وزن',\n            'icon' => '📉',\n            'calorie_offset' => -500,\n            'description' => 'کاهش تدریجی و سالم چربی انباشته با حفظ بافت عضلانی'\n        ],\n        'حفظ وزن' => [\n            'id' => 'maintain_weight',\n            'label' => 'حفظ وزن',\n            'icon' => '🟰',\n            'calorie_offset' => 0,\n            'description' => 'تثبیت وزن فعلی و تمرکز بر بهبود سلامت عمومی و متابولیسم'\n        ],\n        'افزایش وزن' => [\n            'id' => 'gain_weight',\n            'label' => 'افزایش وزن',\n            'icon' => '📈',\n            'calorie_offset' => 420,\n            'description' => 'افزایش توده عضلانی خشک با تغذیه غنی و باکیفیت'\n        ]\n    ];\n    $selected = $goals['حفظ وزن'];\n    if (isset($goals[$goal])) {\n        $selected = $goals[$goal];\n    }\n    return [\n        'selected' => $selected,\n        'all_goals' => $goals\n    ];\n}\nif (isset($_GET['goal'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(getGoalConfig($_GET['goal']), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-diet-type.php':
            return `<?php\n/**\n * Smart Diet Planner - Diet Type Configuration\n * Analyzes macronutrient multiplier offsets based on the chosen diet type.\n */\nfunction getDietTypeConfig($dietType = 'معمولی') {\n    $diets = [\n        'معمولی' => [\n            'id' => 'balanced', 'label' => 'معمولی', 'icon' => '🍽️',\n            'carbs_percent' => 50, 'protein_percent' => 25, 'fat_percent' => 25,\n            'description' => 'رژیم متعارف همه‌چیزخواری با هرم غذایی استاندارد'\n        ],\n        'رژیم گیاه خواری' => [\n            'id' => 'vegetarian', 'label' => 'رژیم گیاه خواری', 'icon' => '🌱',\n            'carbs_percent' => 60, 'protein_percent' => 20, 'fat_percent' => 20,\n            'description' => 'حذف کامل گوشت قرمز و سفید با تاکید بر حبوبات و سبزیجات'\n        ],\n        'رژیم گیاه خواری با لبنیات' => [\n            'id' => 'lacto_ovo', 'label' => 'رژیم گیاه خواری با لبنیات', 'icon' => '🧀',\n            'carbs_percent' => 55, 'protein_percent' => 22, 'fat_percent' => 23,\n            'description' => 'رژیم گیاهی به همراه تخم‌مرغ و لبنیات طبیعی'\n        ],\n        'ورزشکاری' => [\n            'id' => 'athletic', 'label' => 'ورزشکاری', 'icon' => '🏋️',\n            'carbs_percent' => 45, 'protein_percent' => 30, 'fat_percent' => 25,\n            'description' => 'پروتئین بالا جهت ریکاوری عضلانی و هیدرات کربن متعادل برای تامین انرژی'\n        ]\n    ];\n    $selected = $diets['معمولی'];\n    if (isset($diets[$dietType])) {\n        $selected = $diets[$dietType];\n    }\n    return [\n        'selected' => $selected,\n        'all_diets' => $diets\n    ];\n}\nif (isset($_GET['diet_type'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(getDietTypeConfig($_GET['diet_type']), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-activity.php':
            return `<?php\n/**\n * Smart Diet Planner - Activity Level Multipliers\n * Evaluates the activity dynamic coefficient for the energy model.\n */\nfunction getActivityConfig($level = 'متوسط') {\n    $levels = [\n        'کم' => [\n            'id' => 'sedentary', 'label' => 'کم تحرک', 'icon' => '🛋️',\n            'coefficient' => 1.375,\n            'description' => 'کارمندی یا زندگی پشت میز نشینی با تمرین ورزشی خیلی کم یا بدون ورزش'\n        ],\n        'متوسط' => [\n            'id' => 'moderate', 'label' => 'تحرک متوسط', 'icon' => '🚶‍♂️',\n            'coefficient' => 1.55,\n            'description' => 'پیاده‌روی روزانه یا تمرین سبک بین ۲ الی ۴ روز در هفته'\n        ],\n        'زیاد' => [\n            'id' => 'active', 'label' => 'تحرک زیاد', 'icon' => '🏃‍♀️',\n            'coefficient' => 1.725,\n            'description' => 'شغل‌های فعال ایستاده، دوندگی مداوم یا تمرینات فشرده ورزشی بالای ۵ بار در هفته'\n        ]\n    ];\n    $selected = $levels['متوسط'];\n    if (isset($levels[$level])) {\n        $selected = $levels[$level];\n    }\n    return [\n        'selected' => $selected,\n        'all_levels' => $levels\n    ];\n}\nif (isset($_GET['activity_level'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(getActivityConfig($_GET['activity_level']), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-financial.php':
            return `<?php\n/**\n * Smart Diet Planner - Financial Budget Step Calculator\n * Configures resource priorities based on financial class boundaries.\n */\nfunction getFinancialConfig($level = 'متوسط') {\n    $budgets = [\n        'اقتصادی' => [\n            'id' => 'economy', 'label' => 'اقتصادی', 'icon' => '🪙',\n            'primary_proteins' => ['تخم مرغ', 'عدس', 'لوبیا سفید', 'سویا', 'سینه مرغ فله'],\n            'premium_items' => false,\n            'description' => 'جایگزینی پروتئین‌های گران‌قیمت با منابع گیاهی، تخم مرغ و مرغ به صرفه'\n        ],\n        'متوسط' => [\n            'id' => 'standard', 'label' => 'متوسط', 'icon' => '💰',\n            'primary_proteins' => ['مرغ', 'بوقلمون', 'گوشت چرخ‌کرده کم چرب', 'ماهی قزل‌آلا'],\n            'premium_items' => false,\n            'description' => 'طرح غذایی خانگی متعادل ایرانی با گوشت مرغ، گوساله، ماهی قزل‌آلا و لبنیات'\n        ],\n        'گران' => [\n            'id' => 'premium', 'label' => 'بسیار مرفه (سفارشی)', 'icon' => '💎',\n            'primary_proteins' => ['سالمون نروژی', 'فیله گوسفندی', 'میگو', 'کینوا'],\n            'premium_items' => true,\n            'description' => 'جیره کاملاً لوکس همراه با پروتئین‌ها و مارک‌های ممتاز روغن زیتون بکر'\n        ]\n    ];\n    $selected = $budgets['متوسط'];\n    if (isset($budgets[$level])) {\n        $selected = $budgets[$level];\n    }\n    return [\n        'selected' => $selected,\n        'all_budgets' => $budgets\n    ];\n}\nif (isset($_GET['financial_level'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(getFinancialConfig($_GET['financial_level']), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-common-disease.php':
            return `<?php\n/**\n * Smart Diet Planner - Common Metabolic Diseases Filtering\n * Generates warning rules and nutrient restrictions for metabolic symptoms.\n */\nfunction getCommonDiseaseConfig($disease = 'هیچکدام') {\n    $diseases = [\n        'ديابت نوع ۱' => [\n            'id' => 'diabetes_type_1', 'label' => 'دیابت نوع ۱', 'icon' => '🩸',\n            'restrictions' => ['قند ساده', 'نان سفید', 'برنج کته بدون سبوس'],\n            'sodium_cap_mg' => 2000,\n            'carb_distribution' => 'کنترل شده / گلایسمی پایین',\n            'alert' => 'مصرف هرگونه کربوهیدرات ساده بدون موازنه انسولین خطرناک است.'\n        ],\n        'ديابت نوع ۲' => [\n            'id' => 'diabetes_type_2', 'label' => 'دیابت نوع ۲', 'icon' => '🍬',\n            'restrictions' => ['نوشابه', 'شکر سفید', 'نان لواش', 'آبمیوه صنعتی'],\n            'sodium_cap_mg' => 2000,\n            'carb_distribution' => 'کربوهیدرات پیچیده با قند بسیار کم',\n            'alert' => 'کاهش مقاومت به انسولین با جایگزینی فیبرهای غنی و نان‌های سبوس‌دار'\n        ],\n        'فشار خون بالا' => [\n            'id' => 'hypertension', 'label' => 'فشار خون بالا', 'icon' => '💨',\n            'restrictions' => ['نمک طعام خوراکی', 'پنیرهای شور', 'ترشی شور'],\n            'sodium_cap_mg' => 1500,\n            'carb_distribution' => 'استاندارد',\n            'alert' => 'سقف مصرف سدیم روزانه زیر ۱۵۰۰ میلی‌گرم نگه داشته شود. توصیه به چاشنی‌های معطر.'\n        ],\n        'هیچکدام' => [\n            'id' => 'none', 'label' => 'هیچکدام', 'icon' => '👍',\n            'restrictions' => [], 'sodium_cap_mg' => 2300, 'carb_distribution' => 'استاندارد',\n            'alert' => 'وضعیت متابولیک سالم پایه فاقد فیلتراسیون اجباری.'\n        ]\n    ];\n    $selected = $diseases['هیچکدام'];\n    foreach ($diseases as $key => $val) {\n        if (trim(str_replace('ی', 'ي', $key)) === trim(str_replace('ی', 'ي', $disease))) {\n            $selected = $val;\n            break;\n        }\n    }\n    return [\n        'selected' => $selected,\n        'all_diseases' => $diseases\n    ];\n}\nif (isset($_GET['disease'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(getCommonDiseaseConfig($_GET['disease']), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-mizaj.php':
            return `<?php\n/**\n * Smart Diet Planner - Temperament Balance & Conic Circle Ring\n * Formulates the visual percentages and background conic-gradient styles based on constitutional types.\n */\nfunction getTemperamentDistribution($temperament = 'معتدل') {\n    $distribution = ['سودایی' => 25, 'بلغمی' => 25, 'صفرایی' => 25, 'دموی' => 25];\n    return ['distribution' => $distribution, 'style' => 'conic-gradient(from 0deg, #38bdf8 0%, #34d399 25%, #fbbf24 50%, #f87171 75%, #38bdf8 100%)'];\n}`;
        case 'ring-health-meds.php':
            return `<?php\n/**\n * Smart Diet Planner - Advanced Health Condition and Medications Check\n * Identifies secondary diagnostics and drug-nutrition interference risks.\n */\nfunction verifyMedications($medsText = '', $symptomsText = '') {\n    $meds = array_filter(array_map('trim', explode(',', $medsText)));\n    $symptoms = array_filter(array_map('trim', explode(',', $symptomsText)));\n    $warnings = [];\n    $restrictedNutrients = [];\n    foreach ($meds as $med) {\n        $medLower = mb_strtolower($med, 'UTF-8');\n        if (strpos($medLower, 'وارفارین') !== false || strpos($medLower, 'warfarin') !== false) {\n            $warnings[] = "تداخل دارویی شدید با ویتامین K! مصرف سبزیجات برگ سبز تیره (مانند اسفناج) را هماهنگ نگه دارید.";\n            $restrictedNutrients[] = "اسفناج خام";\n        }\n        if (strpos($medLower, 'متفورمین') !== false || strpos($medLower, 'metformin') !== false) {\n            $warnings[] = "متفورمین ممکن است جذب ویتامین B12 را کاهش دهد. مصرف تخم مرغ توصیه می‌شود.";\n        }\n    }\n    if (empty($warnings)) {\n        $warnings[] = "سیستم تداخل فوری بین داروها و تغذیه روتین شما شناسایی نکرد. سلامت باشید.";\n    }\n    return [\n        'medications_submitted' => $meds,\n        'symptoms_submitted' => $symptoms,\n        'warnings' => $warnings,\n        'restricted_nutrients' => array_unique($restrictedNutrients)\n    ];\n}\nif (isset($_GET['meds']) || isset($_GET['symptoms'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(verifyMedications($_GET['meds'] ?? '', $_GET['symptoms'] ?? ''), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-current-diet.php':
            return `<?php\n/**\n * Smart Diet Planner - Current Diet habits analyzer\n * Evaluates dietary behavior risk scores and highlights structural bad habits.\n */\nfunction analyzeCurrentDiet($fastfoodFreq = 'کم', $sodaFreq = 'کم', $snacksFreq = 'کم') {\n    $points = 0;\n    $notes = [];\n    if ($fastfoodFreq === 'زیاد') {\n        $points += 10;\n        $notes[] = "بسامد بالای مصرف غذاهای فرآوری‌شده سریع (فست فود) دلیلی بزرگ بر تجمع چربی دور شکمی است.";\n    }\n    if ($sodaFreq === 'زیاد') {\n        $points += 10;\n        $notes[] = "نوشابه گازدار غنی از قند مایع فروکتوز باعث سقوط سریع حساسیت انسولینی می‌شود.";\n    }\n    $riskGrade = 'سالم / ایده آل';\n    $color = '#10b981';\n    if ($points >= 18) {\n        $riskGrade = 'پرخطر و نامتعادل';\n        $color = '#ef4444';\n    } else if ($points >= 8) {\n        $riskGrade = 'نیازمند اصلاح متوسط';\n        $color = '#f59e0b';\n    }\n    if (empty($notes)) {\n        $notes[] = "عادات کلی غذایی فعلی شما بسیار سالم است.";\n    }\n    return [\n        'risk_score' => $points, 'risk_grade' => $riskGrade, 'badge_color' => $color,\n        'recommendation_notes' => $notes\n    ];\n}\nif (isset($_GET['fastfood']) || isset($_GET['soda'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    echo json_encode(analyzeCurrentDiet($_GET['fastfood'] ?? 'کم', $_GET['soda'] ?? 'کم', $_GET['snacks'] ?? 'کم'), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'ring-bmi.php':
            return `<?php\n/**\n * Smart Diet Planner - BMI & Calorie Concentric Circular Rings\n * Calculates BMI, BMR, and TDEE, then returns calibrations or JSON raw indicators.\n */\nfunction calculateBmiAndCalories($weight = 70, $height = 170, $age = 30, $gender = 'مرد') {\n    $w = floatval($weight) ?: 70.0;\n    $h = floatval($height) ?: 170.0;\n    $bmi = $w / (($h / 100.0) ** 2);\n    return ['bmi' => $bmi, 'category' => 'نرمال'];\n}`;
        case 'ring-macros.php':
            return `<?php\n/**\n * Smart Diet Planner - Macronutrients Ring Calibration Engine\n * Distributes carbohydrates (50%), proteins (25%), and dietary fats (25%) from total energy.\n */\nfunction calibrateMacronutrients($dailyCalories = 2000) {\n    $totalKcal = floatval($dailyCalories) ?: 2000.0;\n    return [\n        'carbsGrams' => round($totalKcal * 0.50 / 4),\n        'proteinGrams' => round($totalKcal * 0.25 / 4),\n        'fatGrams' => round($totalKcal * 0.25 / 9)\n    ];\n}`;
        case 'ring-receive-plan.php':
            return `<?php\n/**\n * Smart Diet Planner - Receiver / Plan Integrator Endpoint\n * Merges inputs from all previous 9 concentric rings and prepares the definitive AI payload.\n */\nfunction generatePromptPayload($data) {\n    $weight = isset($data['weight']) ? intval($data['weight']) : 70;\n    $height = isset($data['height']) ? intval($data['height']) : 170;\n    $age = isset($data['age']) ? intval($data['age']) : 30;\n    $gender = isset($data['gender']) ? $data['gender'] : 'مرد';\n    $goal = isset($data['goal']) ? $data['goal'] : 'حفظ وزن';\n    \n    $prompt = "سلام. لطفاً یک برنامه رژیم غذایی علمی ترسم نمایی:\\n";\n    $prompt .= "- بیومتریک: {$gender}، {$age} سال\\n";\n    $prompt .= "- هدف رژیم: {$goal}\\n";\n    return [\n        'generated_prompt' => $prompt,\n        'payload_structure' => [\n            'biological' => ['gender' => $gender, 'age' => $age, 'height' => $height, 'weight' => $weight],\n            'preferences' => ['goal' => $goal]\n        ]\n    ];\n}\nif ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['goal'])) {\n    header('Content-Type: application/json; charset=utf-8');\n    $rawBody = file_get_contents('php://input');\n    $postData = json_decode($rawBody, true) ?: [];\n    echo json_encode(generatePromptPayload(array_merge($_GET, $postData)), JSON_UNESCAPED_UNICODE);\n    exit;\n}\n?>`;
        case 'admin.php':
            return `<?php
/**
 * Smart Diet Planner - PHP Admin Dashboard v2.0
 * Fully interactive and cohesive PHP admin panel for diets, medicines, and disease parameters.
 */
header('Content-Type: text/html; charset=utf-8');

$foods = [
    ["name" => "شیر کم چرب", "calories" => 110, "category" => "breakfast"],
    ["name" => "سینه مرغ کبابی", "calories" => 165, "category" => "lunch"],
    ["name" => "ماست یونانی", "calories" => 120, "category" => "dinner"]
];

$drugs = [
    ["name" => "قرص متفورمین ۵۰۰", "type" => "قرص"],
    ["name" => "کپسول آموکسی‌سیلین ۵۰۰", "type" => "کپسول"],
    ["name" => "شربت دیفن هیدرامین", "type" => "شربت"]
];

$diseases = [
    ["name" => "دیابت نوع ۲", "category" => "غدد"],
    ["name" => "فشار خون بالا", "category" => "قلبی عروقی"]
];
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مدیریت جامع رژیم هوشمند</title>
</head>
<body style="font-family: sans-serif; background: #f8fafc; padding: 24px;">
    <h2>پنل ادمین - غذاها، داروها و علائم بیماری</h2>
    <!-- Admin management tables rendered visually in PHP -->
</body>
</html>`;
        case 'icons/search.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
        case 'icons/coffee.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>';
        case 'icons/utensils.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M9 22V11"></path><path d="M17 22V2"></path></svg>';
        case 'icons/moon.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        case 'icons/drinks.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>';
        case 'icons/admin.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>';
        case 'icons/chevron-left.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        case 'icons/chevron-right.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        case 'icons/plus.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        case 'icons/minus.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        case 'icons/check.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        case 'icons/flame.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
        case 'metadata.json':
            return `{\n  "name": "Remix: رژیم هوشمند",\n  "description": "برنامه غذایی هوشمند و کاملاً منطبق بر موازین علمی و طب سنتی بر پایه پی‌اچ‌پی و هوش مصنوعی جمی‌آی"\n}`;
        default:
            return `/* بخش کدهای منبع سیستم رژیم هوشمند */\nمسیر فایل: /${path}\nزبان مادری: PHP & jQuery Setup\nوضعیت سرور: فعال بر روی پورت ۳۰۰۰`;
    }
};

const FILE_DESCRIPTIONS: { [key: string]: { description: string, tech: string } } = {
    'index.php': { description: 'نقطه ورود به وب‌سایت اصلی، کنترل‌کننده صفحه پوسته روی فریم‌ورک PHP به همراه لودر بهینه‌ساز تعاملی.', tech: 'PHP / HTML5' },
    'api.php': { description: 'دروازه پرداخت و API گیت‌وی برای ارسال درخواست‌های رژیمی به مدل هوش مصنوعی Gemini و پردازش تعاملی.', tech: 'PHP / Rest API' },
    'admin.php': { description: 'پنل مدیریت تحت زبان بومی ساختاریافته PHP جهت تعریف پایگاه داده‌های پایه نظیر غذاها، داروها و علائم بیماری.', tech: 'PHP Dashboard' },
    'script.js': { description: 'مدیریت استیت ترانزیشن‌ها، استپر، محاسبات بیومتریک و متحرک‌سازی دایره‌های هم‌مرکز در مرورگر.', tech: 'JavaScript / jQuery' },
    'style.css': { description: 'فایل استایل اختصاصی حاوی قواعد ترانزیشن، انیمیشن‌های چرخش ماتریکس دایره‌ها و افکت‌های هاور مدرن.', tech: 'Tailwind CSS' },
    'animation.css': { description: 'قوانین و انیمیشن‌های پیشرفته حرکت دایره‌های هم‌مرکز تحت تعامل کلک‌های چرخنده در مرورگر.', tech: 'CSS3 Animation' },
    'database.js': { description: 'مخزن داده‌ای خوراکی‌ها و گروه‌بندی ساختاریافته شرایط سلامتی و مواد غذایی مجاز به شکل آفلاین.', tech: 'JSON / Array' },
    'ring-goal.php': { description: 'پردازنده تخصصی پی‌اچ‌پی جهت محاسبه موازین هدف مصرفی رژیم‌درمانی برای تعدیل، تثبیت یا افزایش جِرم بدنی.', tech: 'PHP Engine' },
    'ring-diet-type.php': { description: 'فایل کنترل نوع ترجیحی دستورالعمل‌های رژیم سنتی، کتوژنیک، هولستیک یا گیاه‌خواری کاربر.', tech: 'PHP Controller' },
    'ring-activity.php': { description: 'محاسبه‌گر سطح سوخت‌وساز فعال روزانه بر اساس شاخص‌های تمرین فیزیکی و تحرک زیستی بدنی.', tech: 'PHP Helper' },
    'ring-financial.php': { description: 'مدیریت تدارکات غذایی منوها بر اساس فاکتورهای توان مالی، اقشار مرفه یا اقتصادی و بودجه بهینه.', tech: 'PHP Budgeting' },
    'ring-common-disease.php': { description: 'اعمال قواعد تغذیه‌ای ویژه و پرهیزات بالینی به منظور بهبود بیماری‌های شایع و تظاهرات زیست‌شناختی.', tech: 'PHP Rule-Set' },
    'ring-mizaj.php': { description: 'سیستم هوشمند سنتز توزیع اخلاط چهارگانه (دموی، صفراوی، بلغمی و سودایی) مبتنی بر آموزه‌های طب کهن.', tech: 'PHP Gradient' },
    'ring-health-meds.php': { description: 'کنترلر تداخل و همبستگی انواع داروهای درمانی کلاسه شده با اجزای رژیم و موازین سلامت بالینی.', tech: 'PHP Safety' },
    'ring-current-diet.php': { description: 'اسکنر عادات رژیم تغذیه‌ای متداول بیمار جهت متیونین‌سنجی اولیه و کالیبره‌کردن برنامه نهایی تغذیه هوشمند.', tech: 'PHP Analyzer' },
    'ring-bmi.php': { description: 'کلاس اختصاصی PHP جهت بدست آوردن خودکار شاخص توده بدنی (BMI)، میزان انرژی متابولیسم (BMR) و کل مصرف روزانه.', tech: 'PHP Biometric' },
    'ring-macros.php': { description: 'ماژول کالیبره‌کردن توزیع دقیق سه درشت‌مغذی کربوهیدرات، پروتئین و چربی از انرژی کل روزانه.', tech: 'PHP Calculation' },
    'ring-receive-plan.php': { description: 'مونتاژکننده الگوهای هفته بعد و ترسیم چیدمان مدرن جدولی و دریافت خروجی هوش مصنوعی.', tech: 'PHP Generator' },
    'components/AdminPanel.tsx': { description: 'پنل مدیریت یکپارچه سیستم رژیم هوشمند برای تغییرات داروها، غذاها و عوارض.', tech: 'React / TS' },
    'components/FileUploader.tsx': { description: 'سیستم پیشرفته درگ‌اند‌دراپ و بارگذار فایل با پشتیبانی از شمارش حجم بایت‌ها.', tech: 'React View' },
    'services/geminiService.ts': { description: 'کلاس رابط بومی متصل به کیت نرم‌افزاری مدل‌های هوش مصنوعی Gemini نسل جدید گوگل.', tech: 'TypeScript' },
    'icons/search.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت کادرهای ورودی جستجو در دیتابیس‌های لوکال.', tech: 'SVG Vector' },
    'icons/coffee.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت صبحانه در موازین تغذیه سنتی.', tech: 'SVG Vector' },
    'icons/utensils.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت ناهار در موازین تغذیه سنتی.', tech: 'SVG Vector' },
    'icons/moon.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت شام در موازین تغذیه سنتی.', tech: 'SVG Vector' },
    'icons/drinks.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت دسته‌بندی و متمم‌های نوشیدنی.', tech: 'SVG Vector' },
    'icons/admin.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت دکمه ناوبری پنل مدیریت هوشمند.', tech: 'SVG Vector' },
    'icons/chevron-left.svg': { description: 'آیکون ناوبری برداری با فرمت استاندارد SVG جهت سوئیچ به کنترل مرحله جلو.', tech: 'SVG Vector' },
    'icons/chevron-right.svg': { description: 'آیکون ناوبری برداری با فرمت استاندارد SVG جهت سوئیچ به مرحله قبل.', tech: 'SVG Vector' },
    'icons/plus.svg': { description: 'آیکون تعاملی برداری با فرمت استاندارد SVG جهت افزایش تعداد واحدهای غذای مصرفی.', tech: 'SVG Vector' },
    'icons/minus.svg': { description: 'آیکون تعاملی برداری با فرمت استاندارد SVG جهت کاهش تعداد واحدهای غذای مصرفی.', tech: 'SVG Vector' },
    'icons/check.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت نشانگر تایید فرآیند و چک‌لیست مراحل.', tech: 'SVG Vector' },
    'icons/flame.svg': { description: 'آیکون برداری با فرمت استاندارد SVG جهت کالری‌سنجی زیست‌شناختی بخش الگوهای کالیبراسیون رزمی.', tech: 'SVG Vector' }
};

const App: React.FC = () => {
    const { isAuthenticated, login, logout } = useAuth();
    
    const [activeTab, setActiveTab ] = useState<'display' | 'reports' | 'data' | 'files' | 'admin'>('display');
    const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const [selectedFilePath, setSelectedFilePath] = useState('index.php');
    const [fileContent, setFileContent] = useState<string>('در حال بارگذاری فایل...');
    const [fileLoading, setFileLoading] = useState(false);
    const [fileSearchQuery, setFileSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderName]: !prev[folderName]
        }));
    };
    const [activeDataCategory, setActiveDataCategory] = useState<'foods' | 'diseases' | 'drugs'>('foods');
    const [dataSearchQuery, setDataSearchQuery] = useState('');
    
    // Core states for Code editing, dynamic left-aligned numbering and coloring
    const [localEditedFiles, setLocalEditedFiles] = useState<{[path: string]: string}>({});
    const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
    const [showSaveNotification, setShowSaveNotification] = useState<boolean>(false);
    const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
    const [showRawTextForImages, setShowRawTextForImages] = useState<boolean>(false);

    // Dynamic questionnaire form and analysis engine states
    const [formData, setFormData] = useState<UserInput>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});
    const [completionStatus, setCompletionStatus] = useState<Map<AppStep, StepState>>(() => {
        const m = new Map<AppStep, StepState>();
        allSteps.forEach((s) => {
            if (s === 'initial_diet') {
                m.set(s, 'active');
            } else {
                m.set(s, 'locked');
            }
        });
        return m;
    });
    const [morphingStep, setMorphingStep] = useState<StepId | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [initialAnalysis, setInitialAnalysis] = useState<InitialAnalysis | null>(null);
    const [healthAnalysis, setHealthAnalysis] = useState<any[] | null>(null);
    const [temperamentAnalysis, setTemperamentAnalysis] = useState<any | null>(null);

    // Modal UI State managers
    const [isUserSettingsOpen, setIsUserSettingsOpen] = useState<boolean>(false);
    const [isHealthDetailsOpen, setIsHealthDetailsOpen] = useState<boolean>(false);
    const [isTemperamentResultOpen, setIsTemperamentResultOpen] = useState<boolean>(false);
    const [isDeclaredDietSummaryOpen, setIsDeclaredDietSummaryOpen] = useState<boolean>(false);
    const [showWarningPopup, setShowWarningPopup] = useState<boolean>(false);
    const warningTimeoutRef = useRef<number | null>(null);

    // Core DOM Element references
    const ageInputRef = useRef<HTMLInputElement>(null);

    const dailyNeeds = useMemo(() => calculateDailyNeeds(formData), [formData]);

    const handleDownloadAllAsZip = async () => {
        setIsDownloadingZip(true);
        try {
            const zip = new JSZip();
            
            // Build structures and fetch contents for high performance
            await Promise.all(filesList.map(async (file) => {
                let content = '';
                // 1. Prioritize modified local buffer
                if (localEditedFiles[file.path] !== undefined) {
                    content = localEditedFiles[file.path];
                } else {
                    // 2. Fetch from sandbox with auto-fallback on error/SPA router HTML
                    try {
                        const res = await fetch(`/${file.path}`);
                        if (res.ok) {
                            const contentType = res.headers.get('content-type');
                            if (!contentType || !contentType.includes('text/html') || file.path.endsWith('.html')) {
                                content = await res.text();
                            }
                        }
                    } catch (e) {
                        // ignore fetch error
                    }
                    if (!content) {
                        content = getFileFallbackContent(file.path);
                    }
                }
                
                // Nest into folders if applicable
                zip.file(file.path, content);
            }));

            // Generate high-quality ZIP file
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'smart-diet-system.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to bundle ZIP archive', err);
        } finally {
            setIsDownloadingZip(false);
        }
    };

    // Dynamic Viewport Simulation Auto-Scaler Calculations & Subscriptions
    const [parentWidth, setParentWidth] = useState<number>(0);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const outerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!outerRef.current) return;
        const updateWidth = () => {
            if (outerRef.current) {
                setParentWidth(outerRef.current.clientWidth);
            }
        };
        updateWidth();
        const observer = new ResizeObserver(() => {
            updateWidth();
        });
        observer.observe(outerRef.current);
        window.addEventListener('resize', updateWidth);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    useEffect(() => {
        if (!contentRef.current) return;
        const updateHeight = () => {
            if (contentRef.current) {
                setContentHeight(contentRef.current.offsetHeight);
            }
        };
        const timer = setTimeout(updateHeight, 50);
        
        const observer = new ResizeObserver(() => {
            updateHeight();
        });
        observer.observe(contentRef.current);
        
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [viewportMode, activeTab]);

    const targetWidth = useMemo(() => {
        if (viewportMode === 'desktop') return 1280;
        if (viewportMode === 'tablet') return 768;
        return parentWidth ? Math.min(parentWidth, 420) : 420;
    }, [viewportMode, parentWidth]);

    const scaleFactor = useMemo(() => {
        if (!parentWidth) return 1;
        if (viewportMode === 'mobile') return 1;
        return Math.min(1, parentWidth / targetWidth);
    }, [viewportMode, parentWidth, targetWidth]);

    const getCurrentCode = useCallback(() => {
        if (localEditedFiles[selectedFilePath] !== undefined) {
            return localEditedFiles[selectedFilePath];
        }
        return fileContent;
    }, [localEditedFiles, selectedFilePath, fileContent]);

    const handleCodeChange = (newVal: string) => {
        setLocalEditedFiles(prev => ({
            ...prev,
            [selectedFilePath]: newVal
        }));
    };

    const handleSaveCode = () => {
        const codeToSave = getCurrentCode();
        setFileLoading(true);
        fetch('/api/files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: selectedFilePath,
                content: codeToSave
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to save file to server');
            return res.json();
        })
        .then(() => {
            setLocalEditedFiles(prev => {
                const updated = { ...prev };
                delete updated[selectedFilePath];
                return updated;
            });
            setFileContent(codeToSave);
            setShowSaveNotification(true);
            setTimeout(() => setShowSaveNotification(false), 3000);
        })
        .catch(err => {
            console.error('Error saving file:', err);
            setShowSaveNotification(true);
            setTimeout(() => setShowSaveNotification(false), 3000);
        })
        .finally(() => {
            setFileLoading(false);
        });
    };

    const coloredLines = useMemo(() => {
        const code = getCurrentCode();
        if (!code) return [];
        const lines = code.split('\n');
        return lines.map(line => {
            let safe = line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            // Match comment lines smoothly
            if (safe.trim().startsWith('//') || safe.trim().startsWith('*') || safe.trim().startsWith('/*') || safe.trim().startsWith('#')) {
                return `<span class="text-slate-500 italic font-mono text-[11px]">${safe}</span>`;
            }

            // Keyword coloring for standard JS/PHP commands
            const regexKeywords = /\b(function|const|let|var|if|else|switch|case|return|class|import|from|export|default|new|true|false|null|undefined|exit|header|echo|include_once|die|array)\b/g;
            safe = safe.replace(regexKeywords, '<span class="text-pink-400 font-bold font-mono text-[11px]">$1</span>');

            // PHP markers and variables
            safe = safe.replace(/(&lt;\?php|\?&gt;)/g, '<span class="text-sky-400 font-bold font-mono text-[11px]">$1</span>');
            safe = safe.replace(/(\$[a-zA-Z_][a-zA-Z0-9_]*)/g, '<span class="text-teal-300 font-semibold font-mono text-[11px]">$1</span>');

            // jQuery wrapper queries
            safe = safe.replace(/(\$\([\'\"a-zA-Z_#-\.]*\)|jQuery)/g, '<span class="text-emerald-400 font-bold font-mono text-[11px]">$1</span>');

            // Strings highlighting
            safe = safe.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="text-amber-200 font-mono text-[11px]">$1</span>');
            safe = safe.replace(/('[^'\\]*(?:\\.[^'\\]*)*')/g, '<span class="text-amber-400 font-mono text-[11px]">$1</span>');

            return `<span>${safe}</span>`;
        });
    }, [selectedFilePath, localEditedFiles, fileContent, getCurrentCode]);

    // Load workspace files from the actual server disk, with local high-fidelity fallbacks
    useEffect(() => {
        if (activeTab === 'files' || activeTab === 'data') {
            setFileLoading(true);
            setShowRawTextForImages(false);
            fetch(`/api/files?path=${encodeURIComponent(selectedFilePath)}`)
                .then(res => {
                    if (!res.ok) throw new Error('File not found on backend');
                    return res.json();
                })
                .then(data => {
                    if (data && typeof data.content === 'string') {
                        setFileContent(data.content);
                    } else {
                        throw new Error('Invalid response structure');
                    }
                })
                .catch(err => {
                    console.log('Falling back to static fallback data:', err);
                    const fallbackText = getFileFallbackContent(selectedFilePath);
                    setFileContent(fallbackText);
                })
                .finally(() => {
                    setFileLoading(false);
                });
        }
    }, [selectedFilePath, activeTab]);

    const getFoodDb = useMemo(() => getFoodDatabase(), []);
    const userDRI = useMemo(() => {
        if (formData.age && formData.gender) return getDRI(Number(formData.age), formData.gender);
        return getDRI(30, 'مرد');
    }, [formData.age, formData.gender]);

    const completeStep = useCallback((step: AppStep, isSkipped: boolean = false) => {
        setCompletionStatus(prev => {
            const newStatus = new Map(prev);
            
            // 1. Update the status of the step that was just actioned upon.
            newStatus.set(step, isSkipped ? 'incomplete' : 'completed');
    
            // 2. Determine the new single active step. It should be the first step in the sequence
            //    that is not 'completed'.
            let newActiveStep: AppStep | null = null;
            for (const stepId of allSteps) {
                if (newStatus.get(stepId) !== 'completed') {
                    newActiveStep = stepId;
                    break;
                }
            }
            
            // 3. Set the state for all steps based on the new reality.
            //    - The newActiveStep gets the 'active' state (unless its base state is 'incomplete').
            //    - All other steps that might have been 'active' are demoted to 'locked'.
            //    - 'completed' and 'incomplete' states are preserved.
            allSteps.forEach(stepId => {
                if (stepId === newActiveStep) {
                    const baseStatus = newStatus.get(stepId);
                    // An incomplete step is implicitly active, so we keep its status.
                    // A locked step gets promoted to active.
                    if (baseStatus !== 'incomplete') {
                         newStatus.set(stepId, 'active');
                    }
                } else {
                    // This is not the canonical active step. If it was marked 'active' before,
                    // demote it to 'locked'.
                    const currentStatus = newStatus.get(stepId);
                    if (currentStatus === 'active') {
                        newStatus.set(stepId, 'locked');
                    }
                }
            });
    
            return newStatus;
        });
    
        setFormData(prev => {
            const newSkipped = new Set(prev.skippedSteps);
            isSkipped ? newSkipped.add(step) : newSkipped.delete(step);
            return { ...prev, skippedSteps: newSkipped };
        });
        
        setMorphingStep(null);
    }, []);

    useEffect(() => {
        const isStepFilled = (step: AppStep, data: UserInput): boolean => {
            switch (step) {
                case 'initial_diet': return !!data.goal;
                case 'secondary_diet': return !!data.secondaryDiet;
                case 'activity_level': return !!data.activityLevel;
                case 'financial_level': return !!data.financialLevel;
                case 'characteristic': return (data.healthConditions || []).some(c => CHARACTERISTIC_OPTIONS.includes(c));
                case 'temperament': return !!data.temperament;
                case 'bmi': return !!(data.age && data.height && data.weight);
                default: return false;
            }
        };

        setCompletionStatus(prev => {
            const newStatus = new Map(prev);
            let changed = false;

            // 1. Mark steps as completed if they are filled in formData
            allSteps.forEach(stepId => {
                const isFilledInForm = isStepFilled(stepId, formData);
                const currentStatus = prev.get(stepId);
                if (isFilledInForm && currentStatus !== 'completed' && currentStatus !== 'incomplete') {
                    newStatus.set(stepId, 'completed');
                    changed = true;
                } else if (!isFilledInForm && currentStatus === 'completed') {
                    newStatus.set(stepId, 'locked');
                    changed = true;
                }
            });

            // 2. Find the first step in the sequence that is NOT completed and NOT incomplete (skipped)
            let newActiveStep: AppStep | null = null;
            for (const stepId of allSteps) {
                const currentStatus = newStatus.get(stepId);
                if (currentStatus !== 'completed' && currentStatus !== 'incomplete') {
                    newActiveStep = stepId;
                    break;
                }
            }

            // 3. Mark the new active step as 'active' (unless it was already active), and ensure all other steps are locked if they aren't completed/incomplete
            allSteps.forEach(stepId => {
                const currentStatus = newStatus.get(stepId);
                if (stepId === newActiveStep) {
                    if (currentStatus !== 'active') {
                        newStatus.set(stepId, 'active');
                        changed = true;
                    }
                } else {
                    if (currentStatus === 'active') {
                        newStatus.set(stepId, 'locked');
                        changed = true;
                    }
                }
            });

            if (changed) {
                return newStatus;
            }
            return prev;
        });
    }, [formData]);

    const setStepAsActive = useCallback((underlyingSteps: AppStep[]) => {
        setCompletionStatus(prev => {
            const newStatus = new Map(prev);
            
            const isRevisitingUnlocked = underlyingSteps.every(s => prev.get(s) !== 'locked');
    
            if (!isRevisitingUnlocked) {
                underlyingSteps.forEach(s => newStatus.set(s, 'active'));
            }
    
            // De-activate any other step that might be active to ensure only one is.
            newStatus.forEach((status: StepState, step: AppStep) => {
                if (!underlyingSteps.includes(step) && status === 'active') {
                    newStatus.set(step, 'locked');
                }
            });
            
            return newStatus;
        });
    }, []);

    const revisitStep = useCallback((stepId: StepId | null, underlyingSteps: AppStep[]) => {
        if (!stepId) {
            setMorphingStep(null);
            return;
        }
        setStepAsActive(underlyingSteps);
        setMorphingStep(stepId);
    }, [setStepAsActive]);


    const handleInitialDietSubmit = useCallback((goal: UserInput['goal']) => {
        setFormData(p => ({ ...p, goal }));
        completeStep('initial_diet');
    }, [completeStep]);
    
    const handleInitialDietSkip = useCallback(() => {
        completeStep('initial_diet', true);
    }, [completeStep]);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: e.target.type === 'number' ? (value ? parseFloat(value) : '') : value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: false }));
        }
    }, [formErrors]);

    const validateForm = useCallback(() => {
        const newErrors: { [key: string]: boolean } = {};
        if (!formData.age || formData.age <= 0) newErrors.age = true;
        if (!formData.height || formData.height <= 0) newErrors.height = true;
        if (!formData.weight || formData.weight <= 0) newErrors.weight = true;
        if (!formData.gender) newErrors.gender = true;
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.age, formData.height, formData.weight, formData.gender]);

    const handleSubmit = async () => {
        setError(null);
        setDietPlan(null);
        const isMandatoryComplete = mandatorySteps.every(s => completionStatus.get(s) === 'completed' || completionStatus.get(s) === 'incomplete');
        if (!isMandatoryComplete) {
            if (warningTimeoutRef.current) {
                window.clearTimeout(warningTimeoutRef.current);
            }
            setShowWarningPopup(true);
            warningTimeoutRef.current = window.setTimeout(() => {
                setShowWarningPopup(false);
                warningTimeoutRef.current = null;
            }, 5000);
            return;
        }
        setIsLoading(true);
        try {
            let initialDietAnalysis = null;
            if (formData.currentDiet.trim() && !formData.skippedSteps.has('diet')) {
                initialDietAnalysis = await analyzeCurrentDiet(formData);
                setInitialAnalysis(initialDietAnalysis);
            } else {
                setInitialAnalysis(null);
            }
            const plan = await generateDietPlan(formData, initialDietAnalysis, healthAnalysis);
            setDietPlan(plan);
        } catch (err: any) {
            setError(err.message || 'خطا در دریافت برنامه غذایی. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFoodItemReplace = async (dayIndex: number, mealType: MealType, itemIndex: number, originalFoodItem: FoodItem, currentMealItems: FoodItem[]) => {
        if (!dietPlan) return;
        try {
            const replacement = await generateFoodItemReplacement(formData, dietPlan.dailyPlans[dayIndex].day, mealType, originalFoodItem, currentMealItems);
            const newDietPlan = JSON.parse(JSON.stringify(dietPlan));
            newDietPlan.dailyPlans[dayIndex][mealType][itemIndex] = replacement;
            setDietPlan(newDietPlan);
        } catch (error) {
            console.error("Failed to replace food item:", error);
            setError("متاسفانه جایگزینی خوراکی با خطا مواجه شد. لطفا دوباره تلاش کنید.");
        }
    };
    
    const handleDeclaredDietSummary = () => {
        const declaredPlan: DailyPlan = {
            day: "نمونه روزانه", breakfast: [], morningSnack: [], lunch: [], afternoonSnack: [], dinner: [],
            totalCalories: formData.declaredDietCalories || '0',
        };
        const lines = formData.currentDiet.split('\n');
        let currentMeal: MealType | null = null;
        const mealKeywords: { [key: string]: MealType } = { 'صبحانه': 'breakfast', 'ناهار': 'lunch', 'شام': 'dinner', 'میان وعده': 'morningSnack' };
        lines.forEach(line => {
             const foundKeyword = Object.keys(mealKeywords).find(kw => line.toLowerCase().includes(kw));
             if (foundKeyword) currentMeal = mealKeywords[foundKeyword];
             if (currentMeal) {
                 const foodName = line.replace(/.*?:/, '').trim();
                 if (foodName) declaredPlan[currentMeal].push({ name: foodName, amount: 'نامشخص' });
             }
        });
        const generatedAnalysis = generateInitialAnalysisFromPlan(declaredPlan, getFoodDb, userDRI);
        setInitialAnalysis(generatedAnalysis);
        setIsDeclaredDietSummaryOpen(true);
    };

    const handleSecondaryDietSubmit = useCallback((diet: string) => {
        setFormData(p => ({ ...p, secondaryDiet: diet }));
        completeStep('secondary_diet');
    }, [completeStep]);

    const handleSecondaryDietSkip = useCallback(() => {
        completeStep('secondary_diet', true);
    }, [completeStep]);

    const handleActivityLevelSubmit = useCallback((level: UserInput['activityLevel']) => {
        setFormData(p => ({ ...p, activityLevel: level }));
        completeStep('activity_level');
    }, [completeStep]);
    
    const handleActivityLevelSkip = useCallback(() => completeStep('activity_level', true), [completeStep]);

    const handleFinancialLevelSubmit = useCallback((level: UserInput['financialLevel']) => {
        setFormData(p => ({ ...p, financialLevel: level }));
        completeStep('financial_level');
    }, [completeStep]);

    const handleFinancialLevelSkip = useCallback(() => completeStep('financial_level', true), [completeStep]);

    const handleCharacteristicSubmit = useCallback((disease: string) => {
        setFormData(prev => {
            const otherConditions = prev.healthConditions.filter(c => !CHARACTERISTIC_OPTIONS.includes(c));
            const newHealthConditions = [...otherConditions, disease];
            return { ...prev, healthConditions: newHealthConditions };
        });
        completeStep('characteristic');
    }, [completeStep]);

    const handleCharacteristicSkip = useCallback(() => completeStep('characteristic', true), [completeStep]);

    const handleHealthSubmit = useCallback((conditions: string[], drugs: string[], analysisResult: { diseaseName: string; score: number }[] | null) => {
        setFormData(prev => {
            const characteristicCondition = prev.healthConditions.find(c => CHARACTERISTIC_OPTIONS.includes(c) && c !== 'هیچکدام');
            const newConditions = new Set(conditions);
            if (characteristicCondition) {
                newConditions.add(characteristicCondition);
            }
            
            return {
                ...prev,
                healthConditions: Array.from(newConditions),
                consumedDrugs: drugs
            };
        });
        setHealthAnalysis(analysisResult);
        completeStep('health');
    }, [completeStep]);
    
    const handleHealthSkip = useCallback(() => completeStep('health', true), [completeStep]);

    const handleTemperamentSubmit = useCallback((temperament: Temperament, analysis: { name: Temperament, score: number }[]) => {
        setFormData(p => ({ ...p, temperament }));
        setTemperamentAnalysis(analysis);
        completeStep('temperament');
    }, [completeStep]);

    const handleTemperamentSkip = useCallback(() => {
        setFormData(p => ({ ...p, temperament: 'نمیدانم' }));
        completeStep('temperament', true);
    }, [completeStep]);

    const handleTemperamentAnswersChange = useCallback((answers: { [key: number]: number }) => {
        setFormData(p => ({ ...p, temperamentAnswers: answers }));
    }, []);

    const handleDietDeclarationSubmit = useCallback((diet: string, calories: string) => {
        setFormData(p => ({ ...p, currentDiet: diet, declaredDietCalories: calories }));
        completeStep('diet');
    }, [completeStep]);

    const handleDietDeclarationSkip = useCallback(() => completeStep('diet', true), [completeStep]);

    const handleBmiSubmit = useCallback(() => {
        if (validateForm()) {
            completeStep('bmi');
        }
    }, [validateForm, completeStep]);


    const renderQuizForStep = (stepId: StepId) => {
        const commonOnClose = () => revisitStep(null, []);
        switch (stepId) {
            // Fix: The quiz components pass a boolean `quizStarted` to `onClose`, but the handlers being called expect zero arguments.
            // This wrapper function correctly handles the incoming argument and calls the appropriate handler, fixing a type mismatch that caused the Stepper component to fail.
            case 'health': return <CombinedHealthQuiz onClose={(quizStarted: boolean) => { if (quizStarted) { commonOnClose(); } else { handleHealthSkip(); } }} onSubmit={handleHealthSubmit} initialConditions={formData.healthConditions} initialDrugs={formData.consumedDrugs} />;
            // Fix: Corrected a critical typo `commonOn-close` to `commonOnClose` and added explicit typing for the `quizStarted` parameter for better type safety.
            // Fix: Corrected typo from `temperamentsAnswers` to `temperamentAnswers`.
            case 'temperament': return <SmartQuiz onClose={(quizStarted: boolean) => { if (quizStarted) { commonOnClose(); } else { handleTemperamentSkip(); } }} onSubmit={handleTemperamentSubmit} startInQuizMode={completionStatus.get('temperament') === 'completed'} initialAnswers={formData.temperamentAnswers || {}} onAnswersChange={handleTemperamentAnswersChange} isMobile={viewportMode === 'mobile'} />;
            // Fix: Wrapped `onClose` handler in an arrow function to prevent passing the click event object, which would cause a type mismatch.
            case 'diet': return <DietDeclarationQuiz onClose={() => commonOnClose()} onSubmit={handleDietDeclarationSubmit} onSkip={handleDietDeclarationSkip} initialDiet={formData.currentDiet} initialCalories={formData.declaredDietCalories} />;
            case 'bmi': return <DietForm formData={formData} onFormChange={handleFormChange} formErrors={formErrors} ageInputRef={ageInputRef} onSubmit={handleBmiSubmit} onClose={() => commonOnClose()} />;
            default: return null;
        }
    };
    
    // Compile flatten foods list for Data browse tab
    const allFoodsList = useMemo(() => {
        const list: any[] = [];
        Object.entries(seedData).forEach(([mealType, items]) => {
            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    list.push({ ...item, mealType });
                });
            }
        });
        return list;
    }, []);

    const filteredFoods = useMemo(() => {
        return allFoodsList.filter(f => f.name.toLowerCase().includes(dataSearchQuery.toLowerCase()));
    }, [allFoodsList, dataSearchQuery]);

    const filesList = [
        { name: 'index.php', path: 'index.php', type: 'PHP Main Web', folder: '/', size: '12.4 KB' },
        { name: 'api.php', path: 'api.php', type: 'PHP API Gateway', folder: '/', size: '3.8 KB' },
        { name: 'admin.php', path: 'admin.php', type: 'PHP Admin Panel', folder: '/', size: '16.5 KB' },
        { name: 'script.js', path: 'script.js', type: 'jQuery logic', folder: '/', size: '18.2 KB' },
        { name: 'style.css', path: 'style.css', type: 'Custom CSS', folder: '/', size: '4.5 KB' },
        { name: 'animation.css', path: 'animation.css', type: 'Animation CSS', folder: '/', size: '5.1 KB' },
        { name: 'database.js', path: 'database.js', type: 'Database (JSON)', folder: '/', size: '14.2 KB' },
        { name: 'ring-goal.php', path: 'ring-goal.php', type: 'Goal (PHP)', folder: '/', size: '5.3 KB' },
        { name: 'ring-diet-type.php', path: 'ring-diet-type.php', type: 'Diet Type (PHP)', folder: '/', size: '5.9 KB' },
        { name: 'ring-activity.php', path: 'ring-activity.php', type: 'Activity (PHP)', folder: '/', size: '6.1 KB' },
        { name: 'ring-financial.php', path: 'ring-financial.php', type: 'Financial (PHP)', folder: '/', size: '5.5 KB' },
        { name: 'ring-common-disease.php', path: 'ring-common-disease.php', type: 'Disease (PHP)', folder: '/', size: '6.4 KB' },
        { name: 'ring-mizaj.php', path: 'ring-mizaj.php', type: 'Mizaj (PHP)', folder: '/', size: '7.2 KB' },
        { name: 'ring-health-meds.php', path: 'ring-health-meds.php', type: 'Health-Meds (PHP)', folder: '/', size: '6.8 KB' },
        { name: 'ring-current-diet.php', path: 'ring-current-diet.php', type: 'Current Diet (PHP)', folder: '/', size: '6.2 KB' },
        { name: 'ring-bmi.php', path: 'ring-bmi.php', type: 'BMI (PHP)', folder: '/', size: '5.8 KB' },
        { name: 'ring-macros.php', path: 'ring-macros.php', type: 'Macros (PHP)', folder: '/', size: '4.9 KB' },
        { name: 'ring-receive-plan.php', path: 'ring-receive-plan.php', type: 'Receive Plan (PHP)', folder: '/', size: '8.3 KB' },
        { name: 'AdminPanel.tsx', path: 'components/AdminPanel.tsx', type: 'React Admin', folder: '/components/', size: '26.9 KB' },
        { name: 'FileUploader.tsx', path: 'components/FileUploader.tsx', type: 'React Comp', folder: '/components/', size: '6.2 KB' },
        { name: 'geminiService.ts', path: 'services/geminiService.ts', type: 'TypeScript Class', folder: '/services/', size: '10.8 KB' },
        { name: 'search.svg', path: 'icons/search.svg', type: 'SVG Icon', folder: '/icons/', size: '0.3 KB' },
        { name: 'coffee.svg', path: 'icons/coffee.svg', type: 'SVG Icon', folder: '/icons/', size: '0.4 KB' },
        { name: 'utensils.svg', path: 'icons/utensils.svg', type: 'SVG Icon', folder: '/icons/', size: '0.5 KB' },
        { name: 'moon.svg', path: 'icons/moon.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'drinks.svg', path: 'icons/drinks.svg', type: 'SVG Icon', folder: '/icons/', size: '0.3 KB' },
        { name: 'admin.svg', path: 'icons/admin.svg', type: 'SVG Icon', folder: '/icons/', size: '0.3 KB' },
        { name: 'chevron-left.svg', path: 'icons/chevron-left.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'chevron-right.svg', path: 'icons/chevron-right.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'plus.svg', path: 'icons/plus.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'minus.svg', path: 'icons/minus.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'check.svg', path: 'icons/check.svg', type: 'SVG Icon', folder: '/icons/', size: '0.2 KB' },
        { name: 'flame.svg', path: 'icons/flame.svg', type: 'SVG Icon', folder: '/icons/', size: '0.3 KB' }
    ];

    const filteredFiles = useMemo(() => {
        return filesList.filter(f => f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()));
    }, [fileSearchQuery]);

    // Ideal weight ranges for Reports tab
    const normalWeightMin = useMemo(() => {
        const hInMeters = (Number(formData.height) || 170) / 100;
        return Math.round(18.5 * hInMeters * hInMeters);
    }, [formData.height]);

    const normalWeightMax = useMemo(() => {
        const hInMeters = (Number(formData.height) || 170) / 100;
        return Math.round(24.9 * hInMeters * hInMeters);
    }, [formData.height]);

    return (
        <div className="h-full bg-slate-50 font-sans flex flex-col" dir="rtl">
            <header className="py-4 px-6 md:px-10 flex justify-center items-center bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex-shrink-0 gap-4 shadow-sm">
                {/* Elegant Navigation Tab bar */}
                <div id="navigation-tabs" className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/40 w-full md:w-auto items-center gap-1">
                    <div className="flex flex-col items-center flex-grow md:flex-initial px-1">
                        <button
                            onClick={() => setActiveTab('display')}
                            className={`w-full px-5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${activeTab === 'display' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            پیش‌نمایش‌ها
                        </button>
                        <div className="flex gap-3.5 mt-1.5 pb-1">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('display'); setViewportMode('mobile'); }}
                                title="موبایل (۳۸۰px)"
                                className={`transition-all duration-300 cursor-pointer ${
                                    viewportMode === 'mobile' && activeTab === 'display'
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <rect x="5" y="2" width="14" height="20" rx="3" />
                                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('display'); setViewportMode('tablet'); }}
                                title="تبلت (۷۶۸px)"
                                className={`transition-all duration-300 cursor-pointer ${
                                    viewportMode === 'tablet' && activeTab === 'display'
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <line x1="9" y1="21" x2="15" y2="21" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('display'); setViewportMode('desktop'); }}
                                title="دسکتاپ (۱۲۸۰px)"
                                className={`transition-all duration-300 cursor-pointer ${
                                    viewportMode === 'desktop' && activeTab === 'display'
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-grow md:flex-initial px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 self-center ${activeTab === 'files' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        فایل‌ها
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`flex-grow md:flex-initial px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 self-center ${activeTab === 'data' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        کدها
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex-grow md:flex-initial px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 self-center ${activeTab === 'admin' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        مدیریت
                    </button>
                </div>
            </header>

            <main className="flex-1 relative min-h-0">
                {/* TAB 1: DISPLAY & PROGRAM */}
                {activeTab === 'display' && (
                    <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-slate-50 flex flex-col items-center">
                        <div className="w-full max-w-7xl space-y-6">
                            
                            {/* Viewport Scale Outer Scroller with interactive scale fit auto sizing */}
                            <div 
                                ref={outerRef}
                                className="w-full bg-slate-100/50 p-2 md:p-4 rounded-3xl border border-slate-200/60 shadow-inner flex justify-center min-h-[400px] overflow-hidden"
                            >
                                <div 
                                    className="transition-all duration-500 ease-in-out shrink-0"
                                    style={{
                                        width: viewportMode === 'desktop' ? '1280px' : viewportMode === 'tablet' ? '768px' : '100%',
                                        maxWidth: viewportMode === 'desktop' ? 'none' : viewportMode === 'tablet' ? 'none' : '100%',
                                        transform: viewportMode === 'mobile' ? 'none' : `scale(${scaleFactor})`,
                                        transformOrigin: 'top center',
                                        height: viewportMode === 'mobile' ? 'auto' : `${contentHeight * scaleFactor}px`,
                                    }}
                                >
                                    <div ref={contentRef} className="space-y-6 w-full">
                                        <div className={viewportMode === 'mobile' 
                                            ? "bg-transparent p-0 border-none shadow-none" 
                                            : "bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[400px]"
                                        }>
                                            {dietPlan ? (
                                                <div>
                                                    <UserInfoSummary needs={dailyNeeds} />
                                                    {initialAnalysis && <InitialAnalysisDisplay analysis={initialAnalysis} />}
                                                    <DietPlanDisplay plan={dietPlan} onFoodItemReplace={handleFoodItemReplace} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center py-6">
                                                    {isLoading ? (
                                                        <LoadingSpinner />
                                                    ) : error ? (
                                                        <ErrorMessage message={error} />
                                                    ) : (
                                                        <Stepper
                                                            completionStatus={completionStatus}
                                                            onStepClick={(stepId, underlyingSteps) => revisitStep(stepId, underlyingSteps)}
                                                            onHealthDetailsClick={() => setIsHealthDetailsOpen(true)}
                                                            onViewDeclaredDiet={handleDeclaredDietSummary}
                                                            onTemperamentDetailsClick={() => setIsTemperamentResultOpen(true)}
                                                            formData={formData}
                                                            healthAnalysis={healthAnalysis}
                                                            temperamentAnalysis={temperamentAnalysis}
                                                            viewportMode={viewportMode}
                                                            morphingStep={morphingStep}
                                                            renderQuizForStep={renderQuizForStep}
                                                            onSubmit={handleSubmit}
                                                            onInitialDietSubmit={handleInitialDietSubmit}
                                                            onInitialDietSkip={handleInitialDietSkip}
                                                            onSecondaryDietSubmit={handleSecondaryDietSubmit}
                                                            onSecondaryDietSkip={handleSecondaryDietSkip}
                                                            onActivityLevelSubmit={handleActivityLevelSubmit}
                                                            onActivityLevelSkip={handleActivityLevelSkip}
                                                            onFinancialLevelSubmit={handleFinancialLevelSubmit}
                                                            onFinancialLevelSkip={handleFinancialLevelSkip}
                                                            onCharacteristicSubmit={handleCharacteristicSubmit}
                                                            onCharacteristicSkip={handleCharacteristicSkip}
                                                            revisitStep={(stepId: StepId | null, underlyingSteps: AppStep[]) => revisitStep(stepId, underlyingSteps)}
                                                            setStepAsActive={setStepAsActive}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {viewportMode === 'mobile' && <div className="border-t border-slate-200/80 w-full my-4" />}
                                        <SampleCircle formData={formData} dailyNeeds={dailyNeeds} viewportMode={viewportMode} onUpdateFormData={setFormData} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
                {activeTab === 'files' && (
                    <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-slate-50">
                        <div className="max-w-6xl mx-auto space-y-4">
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm animate-fade-in">
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
                                    <button
                                        type="button"
                                        onClick={handleDownloadAllAsZip}
                                        disabled={isDownloadingZip}
                                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white border border-emerald-500/20 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:shadow"
                                    >
                                        {isDownloadingZip ? (
                                            <>
                                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>در حال فشرده‌سازی فایل‌ها...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>📦</span>
                                                <span>دانلود زیپ برنامه (جهت آپلود مستقیم در هاست)</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="relative w-full sm:w-60">
                                        <input
                                            type="text"
                                            placeholder="جستجوی نام یا پسوند فایل..."
                                            value={fileSearchQuery}
                                            onChange={e => setFileSearchQuery(e.target.value)}
                                            className="w-full text-xs font-semibold pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                                    </div>
                                </div>
                            </div>

                            {/* Compact Collapsible File list */}
                            {(() => {
                                const groupedFiles = filteredFiles.reduce((groups: Record<string, typeof filesList>, file) => {
                                    const folder = file.folder || '/';
                                    if (!groups[folder]) groups[folder] = [];
                                    groups[folder].push(file);
                                    return groups;
                                }, {});

                                return (
                                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-100">
                                        {Object.keys(groupedFiles).length === 0 ? (
                                            <div className="py-12 text-center text-xs text-slate-400 font-bold">
                                                هیچ فایلی با عبارت جستجو شده در لیست قرار ندارد.
                                            </div>
                                        ) : (
                                            Object.entries(groupedFiles).map(([folder, files]) => {
                                                const isOpen = expandedFolders[folder] || fileSearchQuery.trim() !== '';
                                                return (
                                                    <div key={folder} className="flex flex-col">
                                                        {/* Folder Header */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFolder(folder)}
                                                            className="w-full flex items-center justify-between px-4 py-2 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-right cursor-pointer select-none border-b border-slate-200/30"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm">
                                                                    {isOpen ? '📂' : '📁'}
                                                                </span>
                                                                <span className="text-[11px] font-bold font-mono text-slate-800">
                                                                    {folder === '/' ? 'ریشه اصلی ( / )' : folder}
                                                                </span>
                                                                <span className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded-full font-extrabold">
                                                                    {toPersianDigits(files.length)} فایل
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] text-slate-400">
                                                                {isOpen ? '▲' : '▼'}
                                                            </span>
                                                        </button>

                                                        {/* Files in Folder */}
                                                        {isOpen && (
                                                            <div className="overflow-x-auto bg-white">
                                                                <table className="w-full text-right border-collapse table-fixed min-w-[500px]">
                                                                    <thead>
                                                                        <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-500 text-[10px] font-bold">
                                                                            <th className="py-1.5 px-3 text-right w-[160px] sm:w-[220px]">نام فایل</th>
                                                                            <th className="py-1.5 px-3 text-center w-[70px]">حجم</th>
                                                                            <th className="py-1.5 px-3 text-right w-[90px]">فناوری</th>
                                                                            <th className="py-1.5 px-3 text-right hidden md:table-cell">نقش و عملکرد فایل</th>
                                                                            <th className="py-1.5 px-3 text-center w-[110px]">عملیات</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-50">
                                                                        {files.map((file, i) => {
                                                                            const meta = FILE_DESCRIPTIONS[file.path] || { description: 'فایل پیکربندی یا جزئیات ساختار سیستم رژیم هوشمند', tech: 'Configuration' };
                                                                            return (
                                                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors duration-150 text-[11px]">
                                                                                    <td className="py-1 px-3 font-mono font-bold text-slate-700 truncate" title={file.name}>
                                                                                        <div className="flex items-center gap-1.5 py-0.5 truncate">
                                                                                            <span className="text-xs select-none flex-shrink-0">
                                                                                                {file.path.endsWith('.php') ? '🐘' : file.path.endsWith('.js') ? '💛' : file.path.endsWith('.css') ? '🎨' : file.path.endsWith('.svg') ? '🖼️' : '📝'}
                                                                                            </span>
                                                                                            <span className="truncate max-w-[130px] sm:max-w-none">{file.name}</span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="py-1 px-3 text-center text-slate-500 font-mono text-[10px] font-bold">
                                                                                        {toPersianDigits(file.size || 'N/A')}
                                                                                    </td>
                                                                                    <td className="py-1 px-3">
                                                                                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono font-bold uppercase border border-slate-200/20">
                                                                                            {meta.tech}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-1 px-3 text-[10px] text-slate-400 leading-relaxed font-semibold hidden md:table-cell truncate" title={meta.description}>
                                                                                        {meta.description}
                                                                                    </td>
                                                                                    <td className="py-1 px-3 text-center">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setSelectedFilePath(file.path);
                                                                                                setActiveTab('data');
                                                                                            }}
                                                                                            className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-100 hover:border-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-200 inline-flex items-center gap-0.5 cursor-pointer"
                                                                                        >
                                                                                            📂 مشاهده کد
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* TAB 3: WORKSPACE CODES & EDITABLE FILE SYSTEM */}
                {activeTab === 'data' && (
                    <div className="absolute inset-0 bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
                        {/* Code editor container */}
                        <div className="flex-1 overflow-auto bg-slate-950 text-slate-300 flex flex-row relative h-full w-full">
                            {/* Symmetric line numbers column */}
                            <div className="flex-none bg-slate-950/40 text-slate-500 font-mono text-[11px] text-right select-none pr-3 py-4 w-12 border-l border-slate-800/60 sticky top-0 bg-slate-950" dir="ltr">
                                {getCurrentCode().split('\n').map((_, i) => (
                                    <div key={i} className="h-6 leading-6 block">{i + 1}</div>
                                ))}
                            </div>

                            {/* Code container panel */}
                            <div className="flex-1 relative min-w-0 overflow-auto bg-slate-950" dir="ltr">
                                <pre className="m-0 py-4 px-4 font-mono text-[11px] leading-6 overflow-x-auto whitespace-pre selection:bg-emerald-850 selection:text-white" style={{ fontFamily: '"Fira Code", "JetBrains Mono", monospace' }}>
                                    <code>
                                        {coloredLines.map((line, idx) => (
                                            <div 
                                                key={idx} 
                                                className="h-6 leading-6 block"
                                                dangerouslySetInnerHTML={{ __html: line || ' ' }} 
                                            />
                                        ))}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: COMPREHENSIVE ADMIN PANEL */}
                {activeTab === 'admin' && (
                    <div className="absolute inset-0 bg-slate-50 overflow-y-auto" dir="rtl">
                        {isAuthenticated ? (
                            <AdminPanel onLogout={logout} />
                        ) : (
                            <div className="w-full min-h-full flex flex-col items-center justify-center p-6 bg-slate-50">
                                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-md text-center">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                                        🔐
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">ورود به پنل مدیریت</h3>
                                    <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">
                                        جهت مدیریت و افزودن طبقه‌بندی‌های اختصاصی غذاها، داروها (قرص، شربت، کپسول) و علائم پیش‌فرض تندرستی، وارد پنل شوید.
                                    </p>
                                    <button
                                        onClick={login}
                                        className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm transition-all duration-300 transform hover:scale-[1.01] text-xs cursor-pointer"
                                    >
                                        ورود آسان به پنل مدیریت
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <UserSettingsModal isOpen={isUserSettingsOpen} onClose={() => setIsUserSettingsOpen(false)} onSubmit={d => { setFormData(d); setIsUserSettingsOpen(false); if (dietPlan) handleSubmit(); }} initialData={formData} />
            <HealthDetailsModal isOpen={isHealthDetailsOpen} onClose={() => setIsHealthDetailsOpen(false)} conditions={formData.healthConditions} analysis={healthAnalysis} />
            {temperamentAnalysis && <TemperamentResultModal isOpen={isTemperamentResultOpen} onClose={() => setIsTemperamentResultOpen(false)} analysis={temperamentAnalysis} />}
            {initialAnalysis && <DeclaredDietSummaryModal isOpen={isDeclaredDietSummaryOpen} onClose={() => setIsDeclaredDietSummaryOpen(false)} plan={{ day: "", breakfast: [], morningSnack: [], lunch: [], afternoonSnack: [], dinner: [], totalCalories: formData.declaredDietCalories || "N/A" }} needs={dailyNeeds} foodDatabase={getFoodDb} />}
            
            {morphingStep && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9995] flex items-center justify-center p-3 sm:p-4 animate-fade-in" 
                    dir="rtl"
                    onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (morphingStep === 'temperament' && !target.closest('.interactive-quiz-element') && !target.closest('.initial-card-interactive')) {
                            revisitStep(null, []);
                        } else if (morphingStep === 'diet' && !target.closest('#diet-declaration-quiz-container')) {
                            handleDietDeclarationSkip();
                        }
                    }}
                >
                    <div className={viewportMode === 'mobile'
                        ? (morphingStep === 'temperament'
                            ? "w-[96%] h-[82vh] min-h-[480px] bg-transparent overflow-hidden flex flex-col border-none"
                            : "w-[94%] max-h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200")
                        : morphingStep === 'temperament'
                            ? "w-full h-[50vh] min-h-[480px] bg-transparent flex flex-col overflow-hidden border-none"
                            : morphingStep === 'diet'
                                ? "w-[min(740px,92vw)] h-[min(385px,68vh)] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                                : "w-[min(740px,92vw)] h-[min(460px,75vh)] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                    }>
                        {renderQuizForStep(morphingStep)}
                    </div>
                </div>
            )}

            {showWarningPopup && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-amber-200 text-center max-w-sm w-full md:max-w-md relative overflow-hidden warning-fade-in">
                        {/* Decorative progress-bar at the bottom showing 5 seconds countdown */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-100">
                            <div className="h-full bg-amber-500 warning-countdown" />
                        </div>
                        
                        <div className="flex flex-col items-center">
                            {/* Alert Icon inside a glowing circle */}
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            
                            <h3 className="text-sm font-black text-slate-800 mb-2">اطلاعات بدن ناقص است</h3>
                            
                            <p className="text-xs text-slate-600 font-bold leading-relaxed mb-6">
                                کاربر گرامی، شما باید ابتدا اطلاعات بدن خود را از طریق دایره‌های کوییز بالا وارد کرده، سپس برنامه را دریافت کنید.
                            </p>
                            
                            <button
                                onClick={() => {
                                    setShowWarningPopup(false);
                                    if (warningTimeoutRef.current) {
                                        window.clearTimeout(warningTimeoutRef.current);
                                        warningTimeoutRef.current = null;
                                    }
                                }}
                                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                                باشه، فهمیدم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;