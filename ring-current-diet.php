<?php
/**
 * Smart Diet Planner - Current Diet habits analyzer
 * Evaluates dietary behavior risk scores and highlights structural bad habits.
 */

function analyzeCurrentDiet($fastfoodFreq = 'کم', $sodaFreq = 'کم', $snacksFreq = 'کم') {
    $points = 0;
    $notes = [];

    // Fastfood evaluation
    if ($fastfoodFreq === 'زیاد') {
        $points += 10;
        $notes[] = "بسامد بالای مصرف غذاهای فرآوری‌شده سریع (فست فود) دلیلی بزرگ بر تجمع چربی دور شکمی و کبد چرب است.";
    } elseif ($fastfoodFreq === 'متوسط') {
        $points += 5;
        $notes[] = "مصرف گهگاهی فست فود چربی‌های اشباع را نامتعادل می‌کند؛ تلاش برای جایگزینی ساندویچ‌های خانگی مفید اهمیت دارد.";
    }

    // Soda evaluation
    if ($sodaFreq === 'زیاد') {
        $points += 10;
        $notes[] = "نوشابه گازدار و آبمیوه‌های شربتی غنی از قند مایع فروکتوز باعث سقوط سریع حساسیت انسولینی و افت سوخت‌وساز می‌شوند.";
    } elseif ($sodaFreq === 'متوسط') {
        $points += 5;
    }

    // Snacks evaluation
    if ($snacksFreq === 'زیاد') {
        $points += 8;
        $notes[] = "ریزه‌خواری مداوم چیپس و پفک چربی اشباع را بالا برده و ریتم سیری بیولوژیک مغز شما را تخریب می‌کند.";
    }

    $riskGrade = 'سالم / ایده آل';
    $color = '#10b981'; // Green
    if ($points >= 18) {
        $riskGrade = 'پرخطر و نامتعادل';
        $color = '#ef4444'; // Red
    } elseif ($points >= 8) {
        $riskGrade = 'نیازمند اصلاح متوسط';
        $color = '#f59e0b'; // Amber
    }

    if (empty($notes)) {
        $notes[] = "عادات کلی غذایی فعلی شما بسیار سالم و ستودنی است؛ رژیم جدید را برای بهینه‌سازی نهایی دریافت خواهید کرد.";
    }

    return [
        'risk_score' => $points,
        'risk_grade' => $riskGrade,
        'badge_color' => $color,
        'recommendation_notes' => $notes
    ];
}

// standalone REST response
if (isset($_GET['fastfood']) || isset($_GET['soda'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(analyzeCurrentDiet(
        $_GET['fastfood'] ?? 'کم',
        $_GET['soda'] ?? 'کم',
        $_GET['snacks'] ?? 'کم'
    ), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
