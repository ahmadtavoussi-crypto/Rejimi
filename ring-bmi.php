<?php
/**
 * Smart Diet Planner - BMI & Calorie Concentric Circular Rings
 * Calculates BMI, BMR, and TDEE, then prepares dynamic variables, or can be included to render the component.
 */

function calculateBmiAndCalories($weight = 70, $height = 170, $age = 30, $gender = 'مرد', $activityLevel = 'متوسط', $goal = 'حفظ وزن') {
    $w = floatval($weight) ?: 70.0;
    $h = floatval($height) ?: 170.0;
    $a = intval($age) ?: 30;

    // BMI Calculation
    $hM = $h / 100.0;
    $bmi = $w / ($hM * $hM);

    $category = 'نرمال';
    $ringColor = '#10b981'; // Green
    if ($bmi < 18.5) {
        $category = 'کمبود وزن';
        $ringColor = '#38bdf8'; // Blue
    } else if ($bmi < 25) {
        $category = 'ایده‌آل';
        $ringColor = '#10b981'; // Emerald
    } else if ($bmi < 30) {
        $category = 'اضافه وزن';
        $ringColor = '#f59e0b'; // Amber
    } else {
        $category = 'چاقی مفرط';
        $ringColor = '#ef4444'; // Red
    }

    // Basal Metabolic Rate using Harris-Benedict formula (BMR)
    if ($gender === 'زن') {
        $bmr = 447.593 + (9.247 * $w) + (3.098 * $h) - (4.330 * $a);
    } else {
        $bmr = 88.362 + (13.397 * $w) + (4.799 * $h) - (5.677 * $a);
    }

    // Activity conversion multipliers
    $coefficient = 1.2;
    if ($activityLevel === 'کم') {
        $coefficient = 1.375;
    } elseif ($activityLevel === 'متوسط') {
        $coefficient = 1.55;
    } elseif ($activityLevel === 'زیاد') {
        $coefficient = 1.725;
    }

    $dailyCalories = $bmr * $coefficient;

    // Apply primary goals offset
    if ($goal === 'کاهش وزن') {
        $dailyCalories -= 500;
    } elseif ($goal === 'افزایش وزن') {
        $dailyCalories += 420;
    }

    $roundedCalories = round($dailyCalories);

    return [
        'bmi' => round($bmi, 1),
        'bmiCategory' => $category,
        'ringColor' => $ringColor,
        'dailyCalories' => $roundedCalories
    ];
}

// Standalone dynamic request processing
if (isset($_GET['weight']) && isset($_GET['height'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(calculateBmiAndCalories(
        $_GET['weight'],
        $_GET['height'],
        $_GET['age'] ?? 30,
        $_GET['gender'] ?? 'مرد',
        $_GET['activity_level'] ?? 'متوسط',
        $_GET['goal'] ?? 'حفظ وزن'
    ));
    exit;
}
?>
