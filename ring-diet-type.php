<?php
/**
 * Smart Diet Planner - Diet Type Configuration
 * Analyzes macronutrient multiplier offsets based on the chosen diet type.
 */

function getDietTypeConfig($dietType = 'معمولی') {
    $diets = [
        'معمولی' => [
            'id' => 'balanced',
            'label' => 'معمولی',
            'icon' => '🍽️',
            'carbs_percent' => 50,
            'protein_percent' => 25,
            'fat_percent' => 25,
            'description' => 'رژیم متعارف همه‌چیزخواری با هرم غذایی استاندارد'
        ],
        'رژیم گیاه خواری' => [
            'id' => 'vegetarian',
            'label' => 'رژیم گیاه خواری',
            'icon' => '🌱',
            'carbs_percent' => 60,
            'protein_percent' => 20,
            'fat_percent' => 20,
            'description' => 'حذف کامل گوشت قرمز و سفید با تاکید بر حبوبات و سبزیجات'
        ],
        'رژیم گیاه خواری با لبنیات' => [
            'id' => 'lacto_ovo',
            'label' => 'رژیم گیاه خواری با لبنیات',
            'icon' => '🧀',
            'carbs_percent' => 55,
            'protein_percent' => 22,
            'fat_percent' => 23,
            'description' => 'رژیم گیاهی به همراه تخم‌مرغ و لبنیات طبیعی'
        ],
        'ورزشکاری' => [
            'id' => 'athletic',
            'label' => 'ورزشکاری',
            'icon' => '🏋️',
            'carbs_percent' => 45,
            'protein_percent' => 30,
            'fat_percent' => 25,
            'description' => 'پروتئین بالا جهت ریکاوری عضلانی و هیدرات کربن متعادل برای تامین انرژی کراس‌فیت و بدنسازی'
        ],
        'مادر شیرده' => [
            'id' => 'breastfeeding',
            'label' => 'مادر شیرده',
            'icon' => '🤱',
            'carbs_percent' => 50,
            'protein_percent' => 25,
            'fat_percent' => 25,
            'calorie_bonus' => 500,
            'description' => 'تامین ۵۰۰ کالری مازاد برای فرآیند طبیعی تغذیه فرزند شیرخوار با تمرکز روی امگا ۳'
        ],
        'مادر باردار' => [
            'id' => 'pregnant',
            'label' => 'مادر باردار',
            'icon' => '🤰',
            'carbs_percent' => 50,
            'protein_percent' => 25,
            'fat_percent' => 25,
            'calorie_bonus' => 350,
            'description' => 'طرح غذایی تقویت شده با اسید فولیک، آهن و کلسیم برای سه ماهه دوم و سوم بارداری'
        ]
    ];

    $selected = $diets['معمولی'];
    if (isset($diets[$dietType])) {
        $selected = $diets[$dietType];
    }

    return [
        'selected' => $selected,
        'all_diets' => $diets
    ];
}

// standalone REST response
if (isset($_GET['diet_type'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getDietTypeConfig($_GET['diet_type']), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
