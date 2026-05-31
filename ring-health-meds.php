<?php
/**
 * Smart Diet Planner - Advanced Health Condition and Medications Check
 * Identifies secondary diagnostics and drug-nutrition interference risks.
 */

function verifyMedications($medsText = '', $symptomsText = '') {
    $meds = array_filter(array_map('trim', explode(',', $medsText)));
    $symptoms = array_filter(array_map('trim', explode(',', $symptomsText)));

    $warnings = [];
    $restrictedNutrients = [];

    // Check common medication risks
    foreach ($meds as $med) {
        $medLower = mb_strtolower($med, 'UTF-8');
        if (strpos($medLower, 'وارفارین') !== false || strpos($medLower, 'warfarin') !== false) {
            $warnings[] = "تداخل دارویی شدید با ویتامین K! مصرف سبزیجات برگ سبز تیره (مانند اسفناج و کاهو) را کاملاً یکنواخت نگه دارید و خودسرانه تغییر ندهید.";
            $restrictedNutrients[] = "اسفناج خام";
            $restrictedNutrients[] = "بروکلی بیش از حد";
        }
        if (strpos($medLower, 'متفورمین') !== false || strpos($medLower, 'metformin') !== false) {
            $warnings[] = "متفورمین ممکن است جذب ویتامین B12 را کاهش دهد. مصرف تخم مرغ و منابع پروتئینی حیوانی توصیه می‌شود.";
        }
        if (strpos($medLower, 'کپتوپریل') !== false || strpos($medLower, 'captopril') !== false || strpos($medLower, 'لوزارتان') !== false) {
            $warnings[] = "داروی مهارکننده ACE (فشار خون). مراقب مصرف بیش از حد مکمل‌های پتاسیم یا نمک‌های رژیمی پتاسیمی باشید.";
        }
    }

    // Check organic disease triggers
    foreach ($symptoms as $sym) {
        $symLower = mb_strtolower($sym, 'UTF-8');
        if (strpos($symLower, 'کبد چرب') !== false || strpos($symLower, 'fatty liver') !== false) {
            $warnings[] = "رژیم کبد چرب: حذف کامل قندهای فروکتوزی مصنوعی و فست‌فودها، استفاده از زردچوبه و روغن زیتون بکر.";
            $restrictedNutrients[] = "فند فراوری شده";
            $restrictedNutrients[] = "چربی‌های اشباع ترانس";
        }
        if (strpos($symLower, 'سنگ کلیه') !== false || strpos($symLower, 'kidney stone') !== false) {
            $warnings[] = "رژیم سنگ کلیه اگزالاتی: محدود کردن مصرف اسفناج، ریواس، شکلات و قهوه‌های بسیار سنگین، مصرف آب کافی روزانه (۱۰ لیوان).";
            $restrictedNutrients[] = "شکلات تلخ بالا";
            $restrictedNutrients[] = "آجیل ها بیش از حد";
        }
    }

    if (empty($warnings)) {
        $warnings[] = "سیستم تداخل فوری بین داروها و تغذیه روتین شما شناسایی نکرد. سلامت باشید.";
    }

    return [
        'medications_submitted' => $meds,
        'symptoms_submitted' => $symptoms,
        'warnings' => $warnings,
        'restricted_nutrients' => array_unique($restrictedNutrients)
    ];
}

// standalone REST response
if (isset($_GET['meds']) || isset($_GET['symptoms'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(verifyMedications(
        $_GET['meds'] ?? '',
        $_GET['symptoms'] ?? ''
    ), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
