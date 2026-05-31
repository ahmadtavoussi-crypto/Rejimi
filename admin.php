<?php
/**
 * Smart Diet Planner - PHP Integrated Admin Panel
 * Persistent state on disk with full tabular visualization and insertion.
 */

define('STORE_FILE', __DIR__ . '/admin_data.json');

// Initialize data if not existing
if (!file_exists(STORE_FILE)) {
    $initialData = [
        'foods' => [
            ['id' => 'f1', 'name' => 'نان سنگک سبوس‌دار', 'category' => 'breakfast', 'calories' => 250, 'unit' => 'برش کف دست'],
            ['id' => 'f2', 'name' => 'پنیر کم‌چرب سفید', 'category' => 'breakfast', 'calories' => 75, 'unit' => '۳۰ گرم'],
            ['id' => 'f3', 'name' => 'تخم مرغ آب‌پز', 'category' => 'breakfast', 'calories' => 78, 'unit' => 'عدد'],
            ['id' => 'f4', 'name' => 'سینه مرغ کبابی', 'category' => 'lunch', 'calories' => 165, 'unit' => '۱۰۰ گرم'],
            ['id' => 'f5', 'name' => 'برنج سفید پخته', 'category' => 'lunch', 'calories' => 130, 'unit' => '۱۰۰ گرم'],
            ['id' => 'f6', 'name' => 'قورمه سبزی', 'category' => 'lunch', 'calories' => 350, 'unit' => 'ملاقه'],
            ['id' => 'f7', 'name' => 'سوپ جو داغ', 'category' => 'dinner', 'calories' => 150, 'unit' => 'کاسه'],
            ['id' => 'f8', 'name' => 'کوکو سبزی', 'category' => 'dinner', 'calories' => 200, 'unit' => 'تکه'],
            ['id' => 'f9', 'name' => 'چای سیاه معطر', 'category' => 'drinks', 'calories' => 2, 'unit' => 'فنجان'],
            ['id' => 'f10', 'name' => 'دوغ نعنایی خنک', 'category' => 'drinks', 'calories' => 55, 'unit' => 'لیوان']
        ],
        'drugs' => [
            ['id' => 'd1', 'name' => 'قرص آهن فروس سولفات', 'category' => 'pill', 'instructions' => 'یک عدد روزانه بعد از غذا'],
            ['id' => 'd2', 'name' => 'کپسول امگا-۳ خالص', 'category' => 'capsule', 'instructions' => 'همراه ناهار'],
            ['id' => 'd3', 'name' => 'شربت مولتی ویتامین', 'category' => 'syrup', 'instructions' => 'دو قاشق مرباخوری بعد از صبحانه']
        ],
        'diseases' => [
            ['id' => 'ds1', 'name' => 'فشار خون بالا', 'harmful' => 'غذاهای پرنمک، کنسرو، ترشی‌ها', 'beneficial' => 'مرکبات، سبزیجات تازه، سیر و پیاز'],
            ['id' => 'ds2', 'name' => 'کبد چرب', 'harmful' => 'سرخ‌کردنی، فست فود، شیرینی مفرط', 'beneficial' => 'بروکلی، مرکبات، آرتیشو، دمنوش شاه‌تره'],
            ['id' => 'ds3', 'name' => 'دیابت نوع ۲', 'harmful' => 'قند و شکر سفید، برنج کته مفرط', 'beneficial' => 'کدو سبز، نان سبوس‌دار، شنبلیله']
        ]
    ];
    file_put_contents(STORE_FILE, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Load active datasets
$storeData = json_decode(file_get_contents(STORE_FILE), true);
$successMessage = '';
$errorMessage = '';

// Handle insertions safely
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';

    if ($action === 'add_food') {
        $name = trim($_POST['food_name'] ?? '');
        $category = trim($_POST['food_category'] ?? 'breakfast');
        $calories = intval($_POST['food_calories'] ?? 0);
        $unit = trim($_POST['food_unit'] ?? 'سهم');

        if (!empty($name) && $calories >= 0) {
            $newFood = [
                'id' => 'f_' . uniqid(),
                'name' => htmlspecialchars($name),
                'category' => htmlspecialchars($category),
                'calories' => $calories,
                'unit' => htmlspecialchars($unit)
            ];
            $storeData['foods'][] = $newFood;
            file_put_contents(STORE_FILE, json_encode($storeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $successMessage = 'غذای جدید با موفقیت به طبقه‌بندی مربوطه افزوده شد.';
        } else {
            $errorMessage = 'لطفا تمامی گزینه‌های فرم غذا را به درستی وارد نمایید.';
        }
    } 
    elseif ($action === 'add_drug') {
        $name = trim($_POST['drug_name'] ?? '');
        $category = trim($_POST['drug_category'] ?? 'pill');
        $instructions = trim($_POST['drug_instructions'] ?? '');

        if (!empty($name)) {
            $newDrug = [
                'id' => 'd_' . uniqid(),
                'name' => htmlspecialchars($name),
                'category' => htmlspecialchars($category),
                'instructions' => htmlspecialchars($instructions)
            ];
            $storeData['drugs'][] = $newDrug;
            file_put_contents(STORE_FILE, json_encode($storeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $successMessage = 'داروی جدید با موفقیت به لیست افزوده شد.';
        } else {
            $errorMessage = 'نام دارو اجباری می‌باشد.';
        }
    } 
    elseif ($action === 'add_disease') {
        $name = trim($_POST['disease_name'] ?? '');
        $harmful = trim($_POST['disease_harmful'] ?? '');
        $beneficial = trim($_POST['disease_beneficial'] ?? '');

        if (!empty($name)) {
            $newDisease = [
                'id' => 'ds_' . uniqid(),
                'name' => htmlspecialchars($name),
                'harmful' => htmlspecialchars($harmful),
                'beneficial' => htmlspecialchars($beneficial)
            ];
            $storeData['diseases'][] = $newDisease;
            file_put_contents(STORE_FILE, json_encode($storeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $successMessage = 'عارضه/سندرم جدید بالینی ثبت شد.';
        } else {
            $errorMessage = 'ارائه نام بیماری الزامی است.';
        }
    }
}

// Translations array helper
$foodCategoryLabels = [
    'breakfast' => 'صبحانه',
    'lunch' => 'ناهار',
    'dinner' => 'شام',
    'drinks' => 'نوشیدنی‌ها'
];

$drugCategoryLabels = [
    'pill' => 'قرص (Pill)',
    'capsule' => 'کپسول (Capsule)',
    'syrup' => 'شربت (Syrup)'
];
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدیریت جامع کدرمانگر - ادمین رژیم هوشمند</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Vazirmatn', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen pb-12">

    <!-- Top Branding Header -->
    <header class="bg-gradient-to-r from-emerald-800 to-emerald-950 border-b border-emerald-700/20 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <span class="bg-emerald-900/50 text-emerald-300 text-xs px-2.5 py-1.5 rounded-full font-black border border-emerald-500/30">پنل توسعه PHP</span>
                <h1 class="text-lg md:text-xl font-black tracking-tight flex items-center gap-1.5">
                    <span>⚙</span> پنل مدیریت رژیم درمانگر هوشمند
                </h1>
            </div>
            <div class="flex items-center gap-3">
                <a href="index.php" class="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-600/30">
                    ورود به پنل حلقه‌ها
                </a>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <!-- Display alert signals -->
        <?php if (!empty($successMessage)): ?>
            <div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span>✓</span> <?php echo $successMessage; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($errorMessage)): ?>
            <div class="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                <span>⚠</span> <?php echo $errorMessage; ?>
            </div>
        <?php endif; ?>

        <!-- Split Grid into Actions (Left) and Data representation tables (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- LEFT PANEL: Dynamic Insertions Forms -->
            <div class="lg:col-span-1 space-y-8">
                
                <!-- Section 1: Food Adder Form -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/65 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-2">
                        <h3 class="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>🥗</span> افزودن غذای جدید
                        </h3>
                    </div>
                    <form method="POST" action="" class="space-y-4 text-xs font-bold text-slate-700">
                        <input type="hidden" name="action" value="add_food">
                        <div>
                            <label class="block mb-1.5">نام غذا:</label>
                            <input type="text" name="food_name" required placeholder="مثلا: سینه بوقلمون کبابی" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium">
                        </div>
                        <div>
                            <label class="block mb-1.5">دسته‌بندی (وعده مربوطه):</label>
                            <select name="food_category" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium">
                                <option value="breakfast">صبحانه</option>
                                <option value="lunch">ناهار</option>
                                <option value="dinner">شام</option>
                                <option value="drinks">نوشیدنی‌ها</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block mb-1.5">کالری (Kcal):</label>
                                <input type="number" name="food_calories" required min="0" placeholder="150" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-medium">
                            </div>
                            <div>
                                <label class="block mb-1.5">واحد اندازه گیری:</label>
                                <input type="text" name="food_unit" value="۱۰۰ گرم" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-medium">
                            </div>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-black mt-2 shadow-sm cursor-pointer">
                            ثبت در دیتابیس غذاها
                        </button>
                    </form>
                </div>

                <!-- Section 2: Drug Adder Form -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/65 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-2">
                        <h3 class="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>💊</span> افزودن داروی جدید
                        </h3>
                    </div>
                    <form method="POST" action="" class="space-y-4 text-xs font-bold text-slate-700">
                        <input type="hidden" name="action" value="add_drug">
                        <div>
                            <label class="block mb-1.5">نام دارو:</label>
                            <input type="text" name="drug_name" required placeholder="مثلا: شربت آلومینیوم ام‌جی" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium">
                        </div>
                        <div>
                            <label class="block mb-1.5">گونه دارو (دسته‌بندی):</label>
                            <select name="drug_category" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium">
                                <option value="pill">قرص (Pill)</option>
                                <option value="capsule">کپسول (Capsule)</option>
                                <option value="syrup">شربت (Syrup)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1.5">دستور مصرف پیش‌فرض:</label>
                            <input type="text" name="drug_instructions" placeholder="یک قاشق قبل خواب" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium">
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-black mt-2 shadow-sm cursor-pointer">
                            ثبت در دیتابیس داروها
                        </button>
                    </form>
                </div>

                <!-- Section 3: Disease/Symptom Adder Form -->
                <div class="bg-white p-5 rounded-2xl border border-slate-200/65 shadow-sm space-y-4">
                    <div class="border-b border-slate-100 pb-2">
                        <h3 class="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>⚕</span> ثبت عارضه و علائم بالینی
                        </h3>
                    </div>
                    <form method="POST" action="" class="space-y-4 text-xs font-bold text-slate-700">
                        <input type="hidden" name="action" value="add_disease">
                        <div>
                            <label class="block mb-1.5">نام عارضه یا بیماری:</label>
                            <input type="text" name="disease_name" required placeholder="مثلا: کم‌خونی فقر آهن" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-medium">
                        </div>
                        <div>
                            <label class="block mb-1.5">مواد غذایی سودمند:</label>
                            <textarea name="disease_beneficial" rows="2" placeholder="عدس، مرکبات، گوشت قرمز" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"></textarea>
                        </div>
                        <div>
                            <label class="block mb-1.5">پرهیزهای غذایی (مضر):</label>
                            <textarea name="disease_harmful" rows="2" placeholder="چای بلافاصله بعد غذا، فرآورده‌های سویا" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"></textarea>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all font-black mt-2 shadow-sm cursor-pointer">
                            ثبت در علائم بیماری
                        </button>
                    </form>
                </div>

            </div>

            <!-- RIGHT PANEL: Master Tables of All Items -->
            <div class="lg:col-span-2 space-y-8">
                
                <!-- Table 1: Foods Listing -->
                <div class="bg-white rounded-2xl border border-slate-200/65 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>🍱</span> جدول غذاهای ثبت شده با تفکیک وعده فرستاده ادمین
                        </h3>
                        <span class="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md">حجم کل: <?php echo count($storeData['foods']); ?> آیتم</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-100">
                                    <th class="p-3 w-16 text-center">شناسه</th>
                                    <th class="p-3">نام ماده غذایی</th>
                                    <th class="p-3 text-center">طبقه‌بندی</th>
                                    <th class="p-3 text-center">کالری (سهم)</th>
                                    <th class="p-3 text-center">واحد</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                                <?php foreach ($storeData['foods'] as $food): ?>
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="p-3 text-center font-mono text-slate-400"><?php echo htmlspecialchars($food['id'] ?? ''); ?></td>
                                        <td class="p-3 font-bold text-slate-900"><?php echo htmlspecialchars($food['name'] ?? ''); ?></td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-1 select-none text-[10px] font-black rounded-lg bg-teal-50 text-teal-800 border border-teal-100/30">
                                                <?php echo $foodCategoryLabels[$food['category']] ?? htmlspecialchars($food['category'] ?? ''); ?>
                                            </span>
                                        </td>
                                        <td class="p-3 text-center font-bold text-orange-600"><?php echo intval($food['calories'] ?? 0); ?> کیلوکالری</td>
                                        <td class="p-3 text-center text-slate-500"><?php echo htmlspecialchars($food['unit'] ?? 'واحد'); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Table 2: Drugs Listing -->
                <div class="bg-white rounded-2xl border border-slate-200/65 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>💊</span> جدول داروها با دسته‌بندی و دستور مصرف
                        </h3>
                        <span class="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md">حجم کل: <?php echo count($storeData['drugs']); ?> آیتم</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-100">
                                    <th class="p-3 w-16 text-center">شناسه</th>
                                    <th class="p-3">نام علمی/تجاری دارو</th>
                                    <th class="p-3 text-center">گونه</th>
                                    <th class="p-3">راهنمای بالینی و دستور مصرف نهایی</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                                <?php foreach ($storeData['drugs'] as $drug): ?>
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="p-3 text-center font-mono text-slate-400"><?php echo htmlspecialchars($drug['id'] ?? ''); ?></td>
                                        <td class="p-3 font-bold text-slate-900"><?php echo htmlspecialchars($drug['name'] ?? ''); ?></td>
                                        <td class="p-3 text-center">
                                            <span class="px-2 py-1 text-[10px] font-black rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100/30">
                                                <?php echo $drugCategoryLabels[$drug['category']] ?? htmlspecialchars($drug['category'] ?? ''); ?>
                                            </span>
                                        </td>
                                        <td class="p-3 text-slate-500 font-medium text-xs"><?php echo htmlspecialchars($drug['instructions'] ?? 'دستور عمومی کدرمانگر'); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Table 3: Diseases Listing -->
                <div class="bg-white rounded-2xl border border-slate-200/65 shadow-sm overflow-hidden">
                    <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>⚕</span> جدول علائم و سوابق بیماری بالینی
                        </h3>
                        <span class="bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md">حجم کل: <?php echo count($storeData['diseases']); ?> آیتم</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-right border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-100">
                                    <th class="p-3 w-16 text-center">شناسه</th>
                                    <th class="p-3">نام بیماری/عارضه</th>
                                    <th class="p-3">خوراکی‌های غیرمفید (سودازا/مضر)</th>
                                    <th class="p-3">تدابیر درمانگر (خوراکی‌های مفید)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                                <?php foreach ($storeData['diseases'] as $disease): ?>
                                    <tr class="hover:bg-slate-50/50 transition-colors">
                                        <td class="p-3 text-center font-mono text-slate-400"><?php echo htmlspecialchars($disease['id'] ?? ''); ?></td>
                                        <td class="p-3 font-bold text-slate-950"><?php echo htmlspecialchars($disease['name'] ?? ''); ?></td>
                                        <td class="p-3 text-rose-600 font-semibold text-[11px] leading-relaxed"><?php echo htmlspecialchars($disease['harmful'] ?? 'موارد حاد ذکر نشده'); ?></td>
                                        <td class="p-3 text-emerald-700 font-semibold text-[11px] leading-relaxed"><?php echo htmlspecialchars($disease['beneficial'] ?? 'دستورهای تسکین عمومی'); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    </div>

</body>
</html>
