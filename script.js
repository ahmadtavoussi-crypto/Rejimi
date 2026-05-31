/**
 * Smart Diet Planner - jQuery Page Controller
 * Highly optimized, interactive, and completely responsive client logic.
 * Translates React states and modular hooks into modular, performant jQuery procedures.
 */

$(document).ready(function() {
    // -----------------------------------------------------
    // 1. Core State Definition & Initial Constants
    // -----------------------------------------------------
    let currentTab = 'display';
    let currentStepIndex = 0;
    const steps = ['gender', 'physical', 'bmi', 'activity', 'goal', 'history'];
    
    const userInput = {
        age: '',
        height: '',
        weight: '',
        wristCircumference: '',
        gender: 'مرد',
        activityLevel: 'متوسط',
        goal: 'حفظ وزن',
        secondaryDiet: 'معمولی',
        financialLevel: 'متوسط',
        healthConditions: [],
        temperament: '',
        temperamentAnswers: {}
    };

    // -----------------------------------------------------
    // 2. Persian Currency & Numeric Utilities
    // -----------------------------------------------------
    function toPersianDigits(num) {
        if (num === null || num === undefined) return '';
        const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/[0-9]/g, function(w) {
            return id[+w];
        });
    }

    // -----------------------------------------------------
    // 3. Tab Navigation Controller
    // -----------------------------------------------------
    function switchTab(tabId) {
        currentTab = tabId;
        
        // Active Styling on Buttons
        $('#navigation-tabs button').removeClass('bg-white text-emerald-600 shadow-sm border border-slate-100').addClass('text-slate-500 hover:text-slate-800');
        $(`#tab-btn-${tabId}`).addClass('bg-white text-emerald-600 shadow-sm border border-slate-100').removeClass('text-slate-500 hover:text-slate-800');
        
        // Toggle view containers
        $('.tab-content-panel').addClass('hidden');
        $(`#tab-content-${tabId}`).removeClass('hidden');

        if (tabId === 'files') {
            loadSourceCode('index.php');
        }
    }

    // Attach Event Listeners to Tabs
    $('#navigation-tabs button').on('click', function() {
        const targetTab = $(this).data('tab');
        switchTab(targetTab);
    });

    // -----------------------------------------------------
    // 4. Biometric Calibration & Rings Render
    // -----------------------------------------------------
    function calculateDailyNeeds() {
        const height = parseFloat(userInput.height) || 170;
        const weight = parseFloat(userInput.weight) || 70;
        const age = parseInt(userInput.age) || 30;
        const gender = userInput.gender;
        const activityLevel = userInput.activityLevel;
        const goal = userInput.goal;

        // BMI Calculation
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        let bmiCategory = 'نرمال';
        if (bmi < 18.5) bmiCategory = 'کمبود وزن';
        else if (bmi < 25) bmiCategory = 'وزن ایده آل';
        else if (bmi < 30) bmiCategory = 'اضافه وزن';
        else bmiCategory = 'چاقی مفرط';

        // Harris-Benedict Formula Calibration
        let bmr = 0;
        if (gender === 'مرد') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Apply activity coefficients
        let multiplier = 1.2;
        if (activityLevel === 'کم') multiplier = 1.375;
        else if (activityLevel === 'متوسط') multiplier = 1.55;
        else if (activityLevel === 'زیاد') multiplier = 1.725;

        let calories = bmr * multiplier;

        // Customize based on goals
        if (goal === 'کاهش وزن') calories -= 500;
        else if (goal === 'افزایش وزن') calories += 400;

        return {
            bmi: bmi,
            bmiCategory: bmiCategory,
            dailyCalories: Math.round(calories)
        };
    }

    function renderBioRings() {
        const needs = calculateDailyNeeds();
        const weight = parseFloat(userInput.weight) || 70;
        const height = parseFloat(userInput.height) || 170;
        const calories = needs.dailyCalories;

        // 1. BMI Dashboard Values
        $('#bmi-value-text').text(toPersianDigits(needs.bmi.toFixed(1)));
        $('#bmi-category-badge').text(needs.bmiCategory);
        $('#calorie-intake-text').text(toPersianDigits(calories));

        // BMI ring offset calculation (Radius: 36, Circumference: 226)
        const bmiPercent = Math.min(100, Math.max(10, (needs.bmi / 40) * 100));
        const bmiOffset = 226 - (bmiPercent / 100) * 226;
        $('#bmi-ring-svg').css('stroke-dashoffset', bmiOffset);

        // Customize ring color based on status
        let strokeColor = '#10b981';
        if (needs.bmi < 18.5) strokeColor = '#38bdf8';
        else if (needs.bmi >= 25 && needs.bmi < 30) strokeColor = '#f59e0b';
        else if (needs.bmi >= 30) strokeColor = '#ef4444';
        $('#bmi-ring-svg').attr('stroke', strokeColor);

        // Calorie inner ring calculation (Radius: 21, Circumference: 131.9)
        const calPercent = Math.min(100, (calories / 4000) * 100);
        const calOffset = 131.9 - (calPercent / 100) * 131.9;
        $('#calorie-ring-svg').css('stroke-dashoffset', calOffset);

        // 2. Macronutrients Stack Calculations (Carbs 50%, Protein 25%, Fats 25%)
        const carbsGrams = Math.round((calories * 0.50) / 4);
        const proteinGrams = Math.round((calories * 0.25) / 4);
        const fatsGrams = Math.round((calories * 0.25) / 9);

        $('#macro-carb-grams').text(toPersianDigits(carbsGrams));
        $('#macro-protein-grams').text(toPersianDigits(proteinGrams));
        $('#macro-fat-grams').text(toPersianDigits(fatsGrams));

        // 3. Temperament Constitutional Circle
        const mizaj = userInput.temperament || 'سودایی';
        $('#mizaj-center-label').text(mizaj);

        let colorsSpec = '#ef4444 0% 25%, #3b82f6 25% 50%, #f59e0b 50% 75%, #10b981 75% 100%';
        if (mizaj === 'سودایی') {
            colorsSpec = '#ef4444 0% 50%, #3b82f6 50% 66%, #f59e0b 66% 83%, #10b981 83% 100%';
        } else if (mizaj === 'بلغمی') {
            colorsSpec = '#ef4444 0% 16%, #3b82f6 16% 66%, #f59e0b 66% 83%, #10b981 83% 100%';
        } else if (mizaj === 'صفرایی') {
            colorsSpec = '#ef4444 0% 16%, #3b82f6 16% 33%, #f59e0b 33% 83%, #10b981 83% 100%';
        } else if (mizaj === 'دموی') {
            colorsSpec = '#ef4444 0% 16%, #3b82f6 16% 33%, #f59e0b 33% 50%, #10b981 50% 100%';
        }
        $('#mizaj-conic-ring').css('background', `conic-gradient(${colorsSpec})`);

        // 4. Clinical Reports compilation
        updateClinicalReports(needs);
    }

    // -----------------------------------------------------
    // 5. Clinical Reports Generator
    // -----------------------------------------------------
    function updateClinicalReports(needs) {
        $('#rep-gender').text(userInput.gender);
        $('#rep-age').text(toPersianDigits(userInput.age || '۳۰'));
        $('#rep-height').text(toPersianDigits(userInput.height || '۱۷۰'));
        $('#rep-weight').text(toPersianDigits(userInput.weight || '۷۰'));
        $('#rep-bmi').text(`${toPersianDigits(needs.bmi.toFixed(1))} (${needs.bmiCategory})`);

        $('#rep-activity').text(userInput.activityLevel);
        $('#rep-goal').text(userInput.goal);
        
        // Calculate normal scale range
        const hm = (parseFloat(userInput.height) || 170) / 100;
        const minW = Math.round(18.5 * hm * hm);
        const maxW = Math.round(24.9 * hm * hm);
        $('#rep-normal-weight').text(`${toPersianDigits(minW)} الی ${toPersianDigits(maxW)} کیلوگرم`);
        $('#rep-calories').text(`${toPersianDigits(needs.dailyCalories)} کیلوکالری`);

        // Temperament advice text
        const m = userInput.temperament || 'سودایی';
        $('#rep-temperament-type').text(m);
        
        $('.rep-mizaj-advices').addClass('hidden');
        $(`#advice-${m}`).removeClass('hidden');

        // Health condition alerts
        const alertsContainer = $('#rep-health-warnings');
        alertsContainer.empty();
        if (userInput.healthConditions.length > 0) {
            alertsContainer.append(`<p class="text-xs text-slate-600 mb-2">محدودیت پیش‌های درمانی به شرح زیر تعدیل شدند:</p>`);
            const chips = userInput.healthConditions.map(c => `<span class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md ml-1.5 mb-1.5 inline-block">${c}</span>`).join('');
            alertsContainer.append(`<div class="flex flex-wrap">${chips}</div>`);
        } else {
            alertsContainer.append(`<p class="text-xs text-slate-400 italic">مورد بالینی حادی ثبت نشده است. رژیم با مقیاس‌های آزاد کالیبره می‌شود.</p>`);
        }
    }

    // -----------------------------------------------------
    // 6. Source Code Viewer Tab Logic
    // -----------------------------------------------------
    const actualFilesContent = {
        'index.php': `<?php\n/**\n * Smart Diet Planner - PHP Web Starter\n */\ninclude_once __DIR__ . '/index.html';`,
        'api.php': `<?php\n/**\n * Smart Diet Planner - PHP API Gateway\n */\nheader('Content-Type: application/json; charset=utf-8');\n$apiKey = getenv('GEMINI_API_KEY');\n...\n// Handles AJAX requests and calls Gemini models with structured response schemas.`,
        'script.js': `/**\n * Smart Diet Planner - Core jQuery logic\n * Tracks interactive multi-step wizard state, performs biometric calculations,\n * coordinates API queries, and renders circular SVG indicator nodes.\n */\n$(document).ready(function() {\n  // Pure client state logic\n});`,
        'style.css': `/**\n * Smart Diet Planner - Layout Custom Animations\n */\n@import 'tailwindcss';\n.halo-pulse { animation: halo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`,
        'constants.js': `const seedData = {\n  breakfast: [ { name: "تخم مرغ آبپز", calories: 155, servingUnit: "عدد" } ],\n  ...\n};\nconst DISEASE_CATEGORIES = {\n  "بیماری‌ها": [ "دیابت", "فشار خون بالا" ]\n};`
    };

    function loadSourceCode(filePath) {
        $('#file-path-display').text('/' + filePath);
        $('#workspace-files-tree button').removeClass('bg-emerald-600 text-white').addClass('text-slate-400 hover:bg-slate-900');
        $(`button[data-file="${filePath}"]`).addClass('bg-emerald-600 text-white').removeClass('text-slate-400 hover:bg-slate-900');

        $('#code-pre-box').text(actualFilesContent[filePath] || '// کدهای انتخاب شده وجود ندارند.');
    }

    $('#workspace-files-tree button').on('click', function() {
        const filePath = $(this).data('file');
        loadSourceCode(filePath);
    });

    // -----------------------------------------------------
    // 7. Initialize default active layouts
    // -----------------------------------------------------
    renderBioRings();
    switchTab('display');
});
