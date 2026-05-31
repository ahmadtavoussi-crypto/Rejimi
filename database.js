/**
 * Smart Diet Planner - Global Reference Databases
 * Contains normalized clinical disease categories and premium nutritional food databases.
 */

const DISEASE_CATEGORIES = {
    "قلبی عروقی": [
        "فشار خون بالا",
        "چربی خون بالا (کلسترول بالا)",
        "بیماری کرونر قلب",
        "سابقه سکته قلبی/مغزی"
    ],
    "غدد و متابولیک": [
        "دیابت نوع ۲",
        "دیابت نوع ۱",
        "پیش‌دیابت (کاهش تحمل گلوکز)",
        "کم‌کاری تیروئید",
        "پرکاری تیروئید"
    ],
    "گوارشی": [
        "کبد چرب غیرالکلی (NAFLD)",
        "سندرم روده تحریک‌پذیر (IBS)",
        "رفلاکس معده (GERD)",
        "زخم معده/اثنی‌عشر",
        "یبوست مزمن"
    ],
    "کلیوی و مجاری ادرار": [
        "سنگ کلیه",
        "نارسایی مزمن کلیوی",
        "نقرس"
    ],
    "مفصلی و استخوانی": [
        "آرتروز پیشرفته",
        "پوکی استخوان"
    ]
};

const seedData = {
    breakfast: [
        { name: "نان سنگک سبوس‌دار", calories: 250, servingUnit: "برش کف دست", protein: 9, totalFat: 2 },
        { name: "پنیر کم‌چرب پاستوریزه", calories: 75, servingUnit: "قوطی کبریت (۳۰ گرم)", protein: 6, totalFat: 4 },
        { name: "گردو", calories: 90, servingUnit: "مغز کامل (۳ عدد)", protein: 2, totalFat: 9 },
        { name: "تخم مرغ آب‌پز سفت", calories: 155, servingUnit: "عدد بزرگ", protein: 13, totalFat: 11 },
        { name: "عسل طبیعی", calories: 60, servingUnit: "قاشق غذاخوری", protein: 0.5, totalFat: 0 }
    ],
    lunch: [
        { name: "سینه مرغ کبابی", calories: 165, servingUnit: "۱۰۰ گرم خالص", protein: 31, totalFat: 3.6 },
        { name: "برنج سفید کته شده با مقدار کمی روغن", calories: 130, servingUnit: "۱۰۰ گرم پخته", protein: 2.7, totalFat: 0.3 },
        { name: "ماهی قزل‌آلا پخته شده در فر", calories: 140, servingUnit: "۱۰۰ گرم خالص", protein: 22, totalFat: 6 },
        { name: "روغن زیتون فرابکر عالی", calories: 120, servingUnit: "یک قاشق غذاخوری", protein: 0, totalFat: 14 }
    ],
    dinner: [
        { name: "عدس‌پلو با کشمش کم‌روغن", calories: 160, servingUnit: "۱۰۰ گرم پخته", protein: 6, totalFat: 1.5 },
        { name: "سیب‌زمینی آب‌پز خنک شده", calories: 87, servingUnit: "۱۰۰ گرم", protein: 2, totalFat: 0.1 },
        { name: "خورشت سبزیجات خانگی بدون گوشت قرمز", calories: 95, servingUnit: "۱۰۰ گرم کاسه خانگی", protein: 3, totalFat: 4 }
    ]
};
