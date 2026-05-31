<?php
/**
 * Smart Diet Planner - Financial Budget Step Calculator
 * Configures resource priorities based on financial class boundaries.
 */

function getFinancialConfig($level = 'متوسط') {
    $budgets = [
        'اقتصادی' => [
            'id' => 'economy',
            'label' => 'اقتصادی',
            'icon' => '🪙',
            'primary_proteins' => ['تخم مرغ', 'عدس', 'لوبیا سفید', 'سویا', 'سینه مرغ فله'],
            'premium_items' => false,
            'description' => 'جایگزینی پروتئین‌های گران‌قیمت با منابع گیاهی، تخم مرغ و مرغ به صرفه'
        ],
        'متوسط' => [
            'id' => 'standard',
            'label' => 'متوسط',
            'icon' => '💰',
            'primary_proteins' => ['مرغ', 'بوقلمون', 'گوشت چرخ‌کرده کم چرب', 'ماهی قزل‌آلا', 'تبخیر تخم مرغ'],
            'premium_items' => false,
            'description' => 'طرح غذایی خانگی متعادل ایرانی با گوشت مرغ، گوساله، ماهی قزل‌آلا و محصولات لبنی استاندارد'
        ],
        'گران' => [
            'id' => 'premium',
            'label' => 'بسیار مرفه (سفارشی)',
            'icon' => '💎',
            'primary_proteins' => ['سالمون نروژی', 'فیله گوسفندی', 'میگو', 'آواکادو', 'دانه کینوا', 'بادام زمینی ممتاز'],
            'premium_items' => true,
            'description' => 'جیره کاملاً لوکس همراه با پروتئین‌ها و مارک‌های ممتاز، روغن زیتون بکر فوق العاده، کینوا و سبزیجات گران‌قیمت'
        ]
    ];

    $selected = $budgets['متوسط'];
    if (isset($budgets[$level])) {
        $selected = $budgets[$level];
    }

    return [
        'selected' => $selected,
        'all_budgets' => $budgets
    ];
}

// standalone REST response
if (isset($_GET['financial_level'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getFinancialConfig($_GET['financial_level']), JSON_UNESCAPED_UNICODE);
    exit;
}
?>
