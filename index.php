<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رژیم درمانگر هوشمند - پنل مدیریت PHP موازین بالینی</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Vazirmatn', Tahoma, sans-serif;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
<?php
// تعریف و بررسی متغیرهای پیش‌فرض جهت ممانعت از بروز خطاهای PHP Notice
$height = isset($_GET['height']) ? intval($_GET['height']) : 178;
$weight = isset($_GET['weight']) ? intval($_GET['weight']) : 75;
$age = isset($_GET['age']) ? intval($_GET['age']) : 28;

// بارگیری حلقه‌ها و پی‌اچ‌پی‌های تخصصی بالینی
require_once __DIR__ . '/ring-goal.php';
require_once __DIR__ . '/ring-diet-type.php';
require_once __DIR__ . '/ring-activity.php';
require_once __DIR__ . '/ring-financial.php';
require_once __DIR__ . '/ring-common-disease.php';
require_once __DIR__ . '/ring-mizaj.php';
require_once __DIR__ . '/ring-health-meds.php';
require_once __DIR__ . '/ring-current-diet.php';
require_once __DIR__ . '/ring-bmi.php';
require_once __DIR__ . '/ring-macros.php';
require_once __DIR__ . '/ring-receive-plan.php';
?>

    <!-- Top Elegant Header -->
    <header class="bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <span class="bg-teal-900/40 text-teal-200 text-xs px-2.5 py-1 rounded-full font-bold border border-teal-500/30">محیط بومی PHP</span>
                <h1 class="text-xl font-black tracking-tight">پنل موازین بالینی و حلقه‌های رژیم هوشمند</h1>
            </div>
            <div class="text-xs text-teal-100 opacity-90 font-medium">
                نسخه سرور اختصاصی رژیم‌درمانی سازگار با هاست لینوکس
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Form: For interactive dynamic testing -->
        <aside class="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div class="border-b border-slate-100 pb-3">
                <h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    ⚙ دیتای کالیبره‌سازی زیستی
                </h2>
                <p class="text-[10px] text-slate-550 mt-1">تغییر مقادیر زیر موازین را در هریک از ۱۱ پنجره زیر به سرعت پردازش می‌کند:</p>
            </div>
            <form method="GET" action="" class="space-y-4 text-xs font-medium text-slate-700">
                <div>
                    <label class="block mb-1">قد (سانتی‌متر):</label>
                    <input type="number" name="height" value="<?php echo htmlspecialchars($height); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                </div>
                <div>
                    <label class="block mb-1">وزن (کیلوگرم):</label>
                    <input type="number" name="weight" value="<?php echo htmlspecialchars($weight); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                </div>
                <div>
                    <label class="block mb-1">سن (سال):</label>
                    <input type="number" name="age" value="<?php echo htmlspecialchars($age); ?>" class="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800">
                </div>
            </form>
        </aside>

        <!-- Grid Panel: Displays all 11 active PHP rings / calculators -->
        <main class="lg:col-span-3 space-y-6">
            <!-- Grid items displaying all 11 ring files dynamically -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Dynamic rendering of compute outcomes for ring-bmi.php, ring-goal.php, ring-diet-type.php, etc. -->
            </div>
        </main>
    </div>
</body>
</html>
