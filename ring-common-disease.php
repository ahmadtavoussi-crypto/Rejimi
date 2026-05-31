<?php
/**
 * Smart Diet Planner - Common Metabolic Diseases Filtering
 * Generates warning rules and nutrient restrictions for metabolic symptoms.
 */

function getCommonDiseaseConfig($disease = 'هیچکدام') {
    $diseases = [
        'ديابت نوع ۱' => [
            'id' => 'diabetes_type_1',
            'label' => 'دیابت نوع ۱',
            'icon' => '🩸',
            'restrictions' => ['قند ساده', 'نان سفید', 'برنج کته بدون سبوس', 'شربت‌های شیرین'],
            'sodium_cap_mg' => 2000,
            'carb_distribution' => 'کنترل شده / گلایسمی پایین',
            'alert' => 'مصرف هرگونه کربوهیدرات ساده بدون موازنه انسولین خطرناک است.'
        ],
        'ديابت نوع ۲' => [
            'id' => 'diabetes_type_2',
            'label' => 'دیابت نوع ۲',
            'icon' => '🍬',
            'restrictions' => ['نوشابه', 'شکر سفید', 'نان لواش', 'آبمیوه صنعتی'],
            'sodium_cap_mg' => 2000,
            'carb_distribution' => 'کربوهیدرات پیچیده با قند بسیار کم',
            'alert' => 'کاهش مقاومت به انسولین با جایگزینی فیبرهای غنی و نان‌های سبوس‌دار جو غلیظ.'
        ],
        'فشار خون بالا' => [
            'id' => 'hypertension',
            'label' => 'فشار خون بالا',
            'icon' => '💨',
            'restrictions' => ['نمک طعام خوراکی', 'پنیرهای شور شور شور', 'چیپس سیب‌زمینی', 'ترشی لوکس قدیمی شور'],
            'sodium_cap_mg' => 1500,
            'carb_distribution' => 'استاندارد',
            'alert' => 'سقف مصرف سدیم روزانه زیر ۱۵۰۰ میلی‌گرم نگه داشته شود. توصیه به پودر سیر یا ادویه معطر.'
        ],
        'چربی خون بالا' => [
            'id' => 'hyperlipidemia',
            'label' => 'چربی خون بالا',
            'icon' => '🍔',
            'restrictions' => ['دنبه و روغن ترانس', 'کره صنعتی فرآوری شده', 'ته دیگ چرب چرب چرب', 'سس مایونز'],
            'sodium_cap_mg' => 2300,
            'carb_distribution' => 'چربی متوسط رو به پایین',
            'alert' => 'جایگزینی چربی‌های اشباع با چربی‌های اشباع‌نشده سالم نظیر روغن زیتون یا مغزها.'
        ],
        'هیچکدام' => [
            'id' => 'none',
            'label' => 'هیچکدام',
            'icon' => '👍',
            'restrictions' => [],
            'sodium_cap_mg' => 2300,
            'carb_distribution' => 'استاندارد',
            'alert' => 'وضعیت متابولیک سالم پایه فاقد فیلتراسیون اجباری.'
        ]
    ];

    $selected = $diseases['هیچکدام'];
    // Flexible keys comparison to secure Farsi characters matching
    foreach ($diseases as $key => $val) {
        if (trim(str_replace('ی', 'ي', $key)) === trim(str_replace('ی', 'ي', $disease))) {
            $selected = $val;
            break;
        }
    }

    return [
        'selected' => $selected,
        'all_diseases' => $diseases
    ];
}

// standalone REST response
if (isset($_GET['disease'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getCommonDiseaseConfig($_GET['disease']), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
