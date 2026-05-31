<?php
/**
 * Smart Diet Planner - Receiver / Plan Integrator Endpoint
 * Merges inputs from all previous 9 concentric rings and prepares the definitive AI payload.
 */

function generatePromptPayload($data) {
    // Collect all elements safely
    $weight = isset($data['weight']) ? intval($data['weight']) : 70;
    $height = isset($data['height']) ? intval($data['height']) : 170;
    $age = isset($data['age']) ? intval($data['age']) : 30;
    $gender = isset($data['gender']) ? $data['gender'] : 'مرد';
    
    $goal = isset($data['goal']) ? $data['goal'] : 'حفظ وزن';
    $dietType = isset($data['diet_type']) ? $data['diet_type'] : 'معمولی';
    $activityLevel = isset($data['activity_level']) ? $data['activity_level'] : 'متوسط';
    $financialLevel = isset($data['financial_level']) ? $data['financial_level'] : 'متوسط';
    $commonDisease = isset($data['disease']) ? $data['disease'] : 'هیچکدام';
    $temperament = isset($data['temperament']) ? $data['temperament'] : 'معتدل';
    $medications = isset($data['meds']) ? $data['meds'] : 'ندارد';
    $symptoms = isset($data['symptoms']) ? $data['symptoms'] : 'ندارد';
    
    // Formulate a beautiful prompt
    $prompt = "سلام. لطفاً یک برنامه رژیم غذایی علمی و اختصاصی هفتگی برای من بنویس که شرایط بدنی و سلیقه‌ای من به شرح زیر است:\n";
    $prompt .= "- مشخصات بیولوژیکی: جنسیت {$gender}، سن {$age} سال، قد {$height} سانتی‌متر، وزن {$weight} کیلوگرم.\n";
    $prompt .= "- هدف نهایی زژیم: {$goal}.\n";
    $prompt .= "- الگو تغذیه مورد علاقه: {$dietType}.\n";
    $prompt .= "- میزان تحرک در هفته: {$activityLevel}.\n";
    $prompt .= "- کلاس بودجه مالی خرید مواد: {$financialLevel}.\n";
    $prompt .= "- بیماری متابولیک یا شایع زمینه‌ای: {$commonDisease}.\n";
    $prompt .= "- طب سنتی (مزاج فعلی): {$temperament}.\n";
    $prompt .= "- داروهای مصرفی مهم: {$medications}.\n";
    $prompt .= "- علائم یا بیماری ثانویه دیگر: {$symptoms}.\n\n";
    $prompt .= "برنامه رژیم پیشنهادی شامل صبحانه، ناهار، شام و میان وعده با تخمین حدودی کالری و مصلحات طب سنتی باشد.";

    return [
        'generated_prompt' => $prompt,
        'payload_structure' => [
            'biological' => [
                'gender' => $gender,
                'age' => $age,
                'height' => $height,
                'weight' => $weight
            ],
            'preferences' => [
                'goal' => $goal,
                'diet_type' => $dietType,
                'activity_level' => $activityLevel,
                'financial_level' => $financialLevel,
                'disease' => $commonDisease,
                'temperament' => $temperament,
                'medications' => $medications,
                'symptoms' => $symptoms
            ]
        ]
    ];
}

// standalone REST interface
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['goal'])) {
    header('Content-Type: application/json; charset=utf-8');
    
    // Merge post json bodies or get arrays
    $rawBody = file_get_contents('php://input');
    $postData = json_decode($rawBody, true) ?: [];
    
    $mergedData = array_merge($_GET, $postData);
    echo json_encode(generatePromptPayload($mergedData), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
