<?php
/**
 * Smart Diet Planner - Activity Level Multipliers
 * Evaluates the activity dynamic coefficient for the energy model.
 */

function getActivityConfig($level = 'متوسط') {
    $levels = [
        'کم' => [
            'id' => 'sedentary',
            'label' => 'کم تحرک',
            'icon' => '🛋️',
            'coefficient' => 1.375,
            'description' => 'کارمندی یا زندگی پشت میز نشینی با تمرین ورزشی خیلی کم یا بدون ورزش'
        ],
        'متوسط' => [
            'id' => 'moderate',
            'label' => 'تحرک متوسط',
            'icon' => '🚶‍♂️',
            'coefficient' => 1.55,
            'description' => 'پیاده‌روی روزانه یا تمرین سبک بین ۲ الی ۴ روز در هفته'
        ],
        'زیاد' => [
            'id' => 'active',
            'label' => 'تحرک زیاد',
            'icon' => '🏃‍♀️',
            'coefficient' => 1.725,
            'description' => 'شغل‌های فعال ایستاده، دوندگی مداوم یا تمرینات فشرده ورزشی بالای ۵ بار در هفته'
        ]
    ];

    $selected = $levels['متوسط'];
    if (isset($levels[$level])) {
        $selected = $levels[$level];
    }

    return [
        'selected' => $selected,
        'all_levels' => $levels
    ];
}

// standalone REST response
if (isset($_GET['activity_level'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getActivityConfig($_GET['activity_level']), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
