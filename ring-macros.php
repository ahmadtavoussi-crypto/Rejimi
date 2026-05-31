<?php
/**
 * Smart Diet Planner - Macronutrients Ring Calibration Engine
 * Distributes carbohydrates (50%), proteins (25%), and dietary fats (25%) from total energy.
 */

function calibrateMacronutrients($dailyCalories = 2000) {
    $totalKcal = floatval($dailyCalories) ?: 2000.0;

    // Standard macronutrients energy allocation
    $carbsKcal = $totalKcal * 0.50;
    $proteinKcal = $totalKcal * 0.25;
    $fatKcal = $totalKcal * 0.25;

    // Grams calculations (Carbs: 4kcal/g, Protein: 4kcal/g, Fat: 9kcal/g)
    $carbsGrams = round($carbsKcal / 4);
    $proteinGrams = round($proteinKcal / 4);
    $fatGrams = round($fatKcal / 9);

    // Radii of SVGs
    $rCarbs = 40;
    $rProtein = 30;
    $rFat = 20;

    $cCarbs = 2 * M_PI * $rCarbs;
    $cProtein = 2 * M_PI * $rProtein;
    $cFat = 2 * M_PI * $rFat;

    return [
        'carbsGrams' => $carbsGrams,
        'proteinGrams' => $proteinGrams,
        'fatGrams' => $fatGrams,
        'offsets' => [
            'carbs' => $cCarbs - (0.50 * $cCarbs),
            'protein' => $cProtein - (0.25 * $cProtein),
            'fat' => $cFat - (0.25 * $cFat),
        ]
    ];
}

// REST dynamic response
if (isset($_GET['calories'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(calibrateMacronutrients($_GET['calories']));
    exit;
}
?>
