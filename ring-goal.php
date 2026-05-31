<?php
/**
 * Smart Diet Planner - Goal Setting Ring Logic
 * Evaluates the primary weight and nutrition goal and calculates caloric offsets.
 */

function getGoalConfig($goal = 'حفظ وزن') {
    $goals = [
        'کاهش وزن' => [
            'id' => 'lose_weight',
            'label' => 'کاهش وزن',
            'icon' => '📉',
            'calorie_offset' => -500,
            'description' => 'کاهش تدریجی و سالم چربی انباشته با حفظ بافت عضلانی'
        ],
        'حفظ وزن' => [
            'id' => 'maintain_weight',
            'label' => 'حفظ وزن',
            'icon' => '🟰',
            'calorie_offset' => 0,
            'description' => 'تثبیت وزن فعلی و تمرکز بر بهبود سلامت عمومی و متابولیسم'
        ],
        'افزایش وزن' => [
            'id' => 'gain_weight',
            'label' => 'افزایش وزن',
            'icon' => '📈',
            'calorie_offset' => 420,
            'description' => 'افزایش توده عضلانی خشک با تغذیه غنی و باکیفیت'
        ]
    ];

    $selected = $goals['حفظ وزن'];
    if (isset($goals[$goal])) {
        $selected = $goals[$goal];
    }

    return [
        'selected' => $selected,
        'all_goals' => $goals
    ];
}

// standalone REST response
if (isset($_GET['goal'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getGoalConfig($_GET['goal']), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
