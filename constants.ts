import { UserInput, Temperament, AdminData, ManagedFoodItem, DiseaseData, Season, DrugData, ManagedDrugItem } from './types';

export const GENDERS: UserInput['gender'][] = ['مرد', 'زن'];
export const ACTIVITY_LEVELS: UserInput['activityLevel'][] = ['کم', 'متوسط', 'زیاد'];
export const GOALS: UserInput['goal'][] = ['کاهش وزن', 'حفظ وزن', 'افزایش وزن'];
export const FINANCIAL_LEVELS: UserInput['financialLevel'][] = ['اقتصادی', 'متوسط', 'گران'];
export const TEMPERAMENTS_OPTIONS: Temperament[] = ['سودایی', 'بلغمی', 'صفرایی', 'دموی', 'معتدل'];
export const NEW_DIETS: string[] = ['معمولی', 'رژیم گیاه خواری', 'رژیم گیاه خواری با لبنیات', 'ورزشکاری', 'مادر شیرده', 'مادر باردار'];

export const DISEASE_CATEGORIES: { [key: string]: string[] } = {
    'بیماری‌های متابولیک': ['دیابت نوع ۱', 'دیابت نوع ۲', 'چربی خون بالا', 'کبد چرب'],
    'بیماری‌های قلب و عروق': ['فشار خون بالا', 'گرفتگی عروق', 'سابقه سکته قلبی'],
    'بیماری‌های گوارشی': ['زخم معده', 'ورم روده (کولیت)', 'sندروم روده تحریک‌پذیر (IBS)', 'یبوست مزمن'],
    'بیماری‌های غدد درون‌ریز': ['کم‌کاری تیروئید', 'پرکاری تیروئید', 'sندروم تخمدان پلی‌کیستیک (PCOS)'],
    'بیماری‌های استخوان و مفاصل': ['پوکی استخوان', 'آرتروز', 'روماتیسم مفصلی'],
    'بیماری‌های خونی': ['کم‌خونی فقر آهن', 'تالاسمی مینور'],
    'بیماری‌های کلیوی': ['سنگ کلیه', 'نارسایی کلیوی'],
    'بیماری‌های ایمنی و التهابی': ['سلیاک', 'آلرژی‌های غذایی خاص'],
    'بیماری‌های پوست و مو': ['آکنه شدید', 'ریزش موی ناشی از تغذیه'],
    'بیماری‌های عصبی و روانی': ['افسردگی', 'اضطراب (مرتبط با تغذیه)'],
    'بیماری‌های حاد و موقت': ['سرماخوردگی']
};

export const SPECIAL_DIETS: readonly string[] = Object.values(DISEASE_CATEGORIES).flat();

export const HEALTH_CONDITIONS: readonly string[] = [
    'هیچکدام',
    ...Object.values(DISEASE_CATEGORIES).flat()
];

const COMMON_DISEASES = ['دیابت نوع ۱', 'دیابت نوع ۲', 'فشار خون بالا', 'چربی خون بالا'];
export const CHARACTERISTIC_OPTIONS = [...COMMON_DISEASES, 'هیچکدام'];


const createFoodItem = (
    id: string,
    name: string,
    calories: number,
    servingUnit: string,
    temperaments: Partial<Record<Temperament, boolean>>,
    isSnack: boolean = false,
    seasons: Partial<Record<Season, boolean>> = {},
    protein: number = 0,
    totalFat: number = 0,
    totalCarbs: number = 0,
    dietaryFiber: number = 0,
    calcium: number = 0,
    iron: number = 0,
    sodium: number = 0,
    vitaminA: number = 0,
    vitaminC: number = 0,
    vitaminD: number = 0,
): ManagedFoodItem => ({
    id, name, servingUnit, isSnack, temperaments, seasons, calories, protein, totalFat, totalCarbs,
    specialDiets: {}, dietaryFiber, calcium, iron, sodium, vitaminA, vitaminC, vitaminD,
    availableFor: { poor: true, middle: true, wealthy: true },
    essentialAminoAcids: 0, saturatedFat: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0, transFat: 0, simpleSugars: 0,
    starch: 0, solubleFiber: 0, insolubleFiber: 0, water: 0, alcohol: 0, cholesterol: 0, glycemicIndex: 0,
    glycemicLoad: 0, vitaminE: 0, vitaminK: 0, b1: 0, b2: 0, b3: 0, b5: 0, b6: 0,
    b7: 0, b9: 0, b12: 0, magnesium: 0, phosphorus: 0, potassium: 0, zinc: 0, copper: 0,
    manganese: 0, selenium: 0, iodine: 0, chromium: 0, molybdenum: 0, fluoride: 0, omega3: 0, omega6: 0, probiotics: 0,
    creatine: 0, carnitine: 0, coenzymeQ10: 0, carotenoids: 0, isoflavones: 0
});

export const seedData: AdminData = {
    breakfast: [
        createFoodItem('bf1', 'نان سنگک', 80, 'یک کف دست', { 'معتدل': true }, false, {}, 3, 0.5, 16, 1.5, 20, 0.8, 150),
        createFoodItem('bf2', 'نان بربری', 75, 'یک کف دست', { 'معتدل': true }, false, {}, 2.5, 0.4, 15, 1, 15, 0.7, 140),
        createFoodItem('bf3', 'نان تافتون', 70, 'یک کف دست', { 'معتدل': true }, false, {}, 2.2, 0.3, 14, 0.8, 18, 0.6, 130),
        createFoodItem('bf4', 'نان لواش', 30, 'یک کف دست', { 'معتدل': true }, false, {}, 1, 0.2, 6, 0.5, 10, 0.3, 70),
        createFoodItem('bf5', 'نان تست', 80, 'یک ورق', { 'معتدل': true }, false, {}, 3, 1, 14, 1, 30, 0.9, 160),
        createFoodItem('bf6', 'پنیر لیقوان', 90, 'قوطی کبریت (۳۰ گرم)', { 'بلغمی': true }, false, {}, 5, 7, 1, 0, 200, 0.2, 400, 80, 0, 0.1),
        createFoodItem('bf7', 'پنیر فتا (سفید)', 75, 'قوطی کبریت (۳۰ گرم)', { 'بلغمی': true }, false, {}, 4, 6, 1, 0, 140, 0.2, 310, 70, 0, 0.1),
        createFoodItem('bf8', 'پنیر خامه ای', 100, 'قوطی کبریت (۳۰ گرم)', { 'بلغمی': true }, false, {}, 2, 10, 1, 0, 25, 0.1, 85, 90, 0, 0),
        createFoodItem('bf9', 'گردو', 65, 'یک عدد کامل', { 'دموی': true }, false, {}, 1.5, 6.5, 1.4, 0.7, 10, 0.3, 0),
        createFoodItem('bf10', 'کره حیوانی', 72, 'یک قاشق چایخوری (۱۰ گرم)', { 'دموی': true }, false, {}, 0.1, 8, 0, 0, 3, 0, 80, 90, 0, 0.1),
        createFoodItem('bf11', 'خامه صبحانه', 60, 'یک قاشق غذاخوری', { 'بلغمی': true }, false, {}, 0.5, 6, 0.6, 0, 15, 0, 10, 50),
        createFoodItem('bf12', 'سرشیر', 80, 'یک قاشق غذاخوری', { 'دموی': true }, false, {}, 0.4, 8.5, 0.5, 0, 12, 0, 8, 60),
        createFoodItem('bf13', 'عسل', 64, 'یک قاشق غذاخوری', { 'صفرایی': true }, false, {}, 0.1, 0, 17, 0, 1, 0.1, 1),
        createFoodItem('bf14', 'مربای آلبالو', 55, 'یک قاشق غذاخوری', { 'سودایی': true }, false, {}, 0.1, 0, 14, 0.2, 4, 0.1, 2, 20, 2),
        createFoodItem('bf15', 'مربای هویج', 50, 'یک قاشق غذاخوری', { 'صفرایی': true }, false, {}, 0.1, 0, 13, 0.3, 5, 0.1, 10, 1500, 1),
        createFoodItem('bf16', 'شیره انگور', 60, 'یک قاشق غذاخوری', { 'دموی': true }, false, {}, 0.2, 0, 15, 0.1, 15, 0.5, 2),
        createFoodItem('bf17', 'شیره خرما', 58, 'یک قاشق غذاخوری', { 'دموی': true }, false, {}, 0.3, 0, 14, 0.2, 12, 0.6, 2),
        createFoodItem('bf18', 'ارده', 90, 'یک قاشق غذاخوری', { 'دموی': true }, false, {}, 2.5, 8, 3, 1.5, 63, 1.4, 2),
        createFoodItem('bf19', 'تخم مرغ آبپز', 78, 'یک عدد بزرگ', { 'دموی': true }, false, {}, 6.3, 5.3, 0.6, 0, 25, 0.9, 62, 75, 0, 0.5),
        createFoodItem('bf20', 'تخم مرغ نیمرو', 90, 'یک عدد بزرگ', { 'دموی': true }, false, {}, 6.2, 7, 0.6, 0, 24, 0.9, 80, 80, 0, 0.5),
        createFoodItem('bf21', 'املت گوجه فرنگی', 150, 'یک وعده کوچک', { 'صفرایی': true }, false, {}, 7, 11, 4, 1, 40, 1.2, 250, 1000, 15),
        createFoodItem('bf22', 'خاگینه', 180, 'یک وعده کوچک', { 'صفرایی': true }, false, {}, 8, 12, 10, 0.5, 50, 1, 150),
        createFoodItem('bf23', 'عدسی', 230, 'یک کاسه کوچک', { 'سودایی': true }, false, {}, 12, 5, 35, 8, 50, 4, 400),
        createFoodItem('bf24', 'حلیم گندم با گوشت', 350, 'یک کاسه', { 'دموی': true }, false, {}, 18, 12, 42, 5, 60, 3, 500),
        createFoodItem('bf25', 'شیر (کم چرب)', 102, 'یک لیوان', { 'بلغمی': true }, false, {}, 8, 2.5, 12, 0, 300, 0.1, 100, 150, 0, 2.5),
        createFoodItem('bf26', 'چای سیاه', 2, 'یک فنجان', { 'سودایی': true }, false, {}, 0.3, 0, 0, 0, 0, 0, 1),
        createFoodItem('bf27', 'گوجه فرنگی', 22, 'یک عدد متوسط', { 'بلغمی': true }, false, {}, 1, 0.2, 5, 1.5, 12, 0.3, 6, 800, 17),
        createFoodItem('bf28', 'خیار', 16, 'یک عدد متوسط', { 'بلغمی': true }, false, {}, 0.7, 0.1, 4, 0.5, 16, 0.3, 2, 50, 3),
        createFoodItem('bf29', 'نان و پنیر و گردو', 235, 'یک وعده', { 'معتدل': true }, false, {}, 9.5, 14, 18, 2, 230, 1.3, 550),
        createFoodItem('bf30', 'نان و پنیر و سبزی', 160, 'یک وعده', { 'معتدل': true }, false, {}, 7, 7, 18, 2.5, 180, 1.5, 450, 1000, 20),
        createFoodItem('bf31', 'نان و کره و مربا', 200, 'یک وعده', { 'صفرایی': true }, false, {}, 3, 9, 28, 1.2, 20, 0.8, 230),
        createFoodItem('bf32', 'نان و کره و عسل', 215, 'یک وعده', { 'صفرایی': true }, false, {}, 3, 9, 32, 1, 20, 0.8, 230),
        createFoodItem('bf33', 'نان و خامه و عسل', 205, 'یک وعده', { 'بلغمی': true }, false, {}, 3.5, 13, 20, 1, 35, 0.8, 150),
        createFoodItem('bf34', 'ارده و شیره', 150, 'دو قاشق غذاخوری', { 'دموی': true }, false, {}, 2.7, 8, 18, 1.6, 70, 1.9, 4),
        createFoodItem('bf35', 'نان تست و کره بادام زمینی', 270, 'یک وعده', { 'دموی': true }, false, {}, 11, 17, 21, 4, 50, 1.2, 310),
        createFoodItem('bf36', 'فرنی', 150, 'یک کاسه کوچک', { 'معتدل': true }, false, {}, 4, 4, 25, 0.5, 150, 0.2, 80),
        createFoodItem('bf37', 'شیر برنج', 180, 'یک کاسه کوچک', { 'بلغمی': true }, false, {}, 5, 3, 33, 0.8, 160, 0.3, 90),
        createFoodItem('bf38', 'حلوا ارده', 150, 'قوطی کبریت (۳۰ گرم)', { 'دموی': true }, false, {}, 4, 11, 10, 2, 70, 1.5, 20),
        createFoodItem('bf39', 'لوبیا چیتی پخته', 210, 'یک کاسه کوچک', { 'معتدل': true }, false, {}, 10, 4, 34, 9, 60, 3, 350),
        createFoodItem('bf40', 'زبان گوسفند', 250, '۱۰۰ گرم', { 'دموی': true }, false, {}, 18, 19, 0, 0, 10, 2.5, 80),
        createFoodItem('bf41', 'املت اسفناج و پنیر', 220, 'یک وعده', { 'معتدل': true }, false, {}, 15, 16, 4, 2, 250, 2.5, 450, 4000, 10, 0.5),
        createFoodItem('bf42', 'جو دوسر پرک با شیر', 250, 'یک کاسه', { 'معتدل': true }, false, {}, 12, 6, 40, 6, 350, 2, 110),
        createFoodItem('bf43', 'پنکیک ساده', 180, 'دو عدد متوسط', { 'صفرایی': true }, false, {}, 6, 7, 24, 1, 100, 1, 300),
        createFoodItem('bf44', 'نان شیرمال', 150, 'یک تکه متوسط', { 'معتدل': true }, false, {}, 4, 4, 25, 1, 40, 1, 180),
        createFoodItem('bf45', 'قهوه دمی', 5, 'یک فنجان', { 'سودایی': true }, false, {}, 0.3, 0, 0, 0, 0, 0, 2),
        createFoodItem('bf46', 'آب پرتقال طبیعی', 112, 'یک لیوان', { 'بلغمی': true }, false, {}, 1.7, 0.5, 26, 0.5, 27, 0.2, 2, 0, 124),
        createFoodItem('bf47', 'دمنوش بابونه', 2, 'یک فنجان', { 'صفرایی': true }, false, {}, 0, 0, 0.5, 0, 2, 0, 1),
        createFoodItem('bf48', 'نان و پنیر و گوجه و خیار', 180, 'یک وعده', { 'بلغمی': true }, false, {}, 8, 7, 22, 3, 170, 1, 480, 850, 20),
        createFoodItem('bf49', 'املت قارچ', 170, 'یک وعده', { 'سودایی': true }, false, {}, 10, 13, 4, 1.5, 30, 1.5, 300),
        createFoodItem('bf50', 'کره گیاهی (مارگارین)', 70, 'یک قاشق چایخوری (۱۰ گرم)', { 'معتدل': true }, false, {}, 0.1, 8, 0, 0, 2, 0, 85, 90, 0, 0.1),
    ],
    morningSnack: [
        createFoodItem('ms1', 'سیب', 95, 'عدد', { 'معتدل': true }, true, { 'پاییزی': true, 'زمستانی': true }, 0.5, 0.3, 25),
        createFoodItem('ms2', 'بادام درختی', 100, '15 عدد', { 'دموی': true }, true, {}, 4, 9, 4),
        createFoodItem('ms3', 'ماست میوه‌ای', 120, 'یک لیوان', { 'بلغمی': true }, true, {}, 6, 2, 20),
        createFoodItem('ms4', 'بیسکوییت ساقه طلایی', 70, '2 عدد', { 'معتدل': true }, true, {}, 1, 3, 10),
        createFoodItem('ms5', 'شکلات تلخ', 170, '30 گرم', { 'سودایی': true }, true, {}, 2, 12, 13),
        createFoodItem('ms6', 'شیرکاکائو', 150, 'یک لیوان', { 'دموی': true }, true, {}, 8, 5, 20),
        createFoodItem('ms7', 'آجیل مخلوط', 180, 'یک مشت', { 'دموی': true }, true, {}, 6, 15, 8),
    ],
    lunch: [
        createFoodItem('lu1', 'برنج سفید', 200, 'یک کفگیر', { 'معتدل': true }, false, {}, 4, 0.5, 45),
        createFoodItem('lu2', 'خورشت قورمه سبزی', 350, 'یک ملاقه', { 'دموی': true }, false, {}, 20, 25, 15),
        createFoodItem('lu3', 'خورشت قیمه', 300, 'یک ملاقه', { 'صفرایی': true }, false, {}, 22, 20, 10),
        createFoodItem('lu4', 'ران مرغ پخته', 250, 'یک تکه', { 'دموی': true }, false, {}, 30, 14, 0),
        createFoodItem('lu5', 'ماهی قزل آلا کبابی', 200, 'یک تکه', { 'بلغمی': true }, false, {}, 22, 12, 0),
        createFoodItem('lu6', 'سالاد فصل', 50, 'یک کاسه', { 'بلغمی': true }, false, {}, 1, 0, 10),
        createFoodItem('lu7', 'کباب کوبیده', 280, 'یک سیخ', { 'صفرایی': true }, false, {}, 25, 20, 2),
        createFoodItem('lu8', 'جوجه کباب', 240, 'یک سیخ', { 'دموی': true }, false, {}, 30, 12, 1),
        createFoodItem('lu9', 'خورشت فسنجان', 450, 'یک ملاقه', { 'دموی': true }, false, {}, 20, 35, 15),
        createFoodItem('lu10', 'خورشت بادمجان', 280, 'یک ملاقه', { 'سودایی': true }, false, {}, 10, 22, 12),
        createFoodItem('lu11', 'آش رشته', 320, 'یک کاسه بزرگ', { 'معتدل': true }, false, {}, 15, 10, 45),
        createFoodItem('lu12', 'لوبیا پلو', 400, 'یک کفگیر', { 'معتدل': true }, false, {}, 12, 15, 55),
        createFoodItem('lu13', 'کتلت گوشت', 150, 'یک عدد', { 'صفرایی': true }, false, {}, 10, 10, 5),
        createFoodItem('lu14', 'کشک بادمجان', 250, 'یک کاسه', { 'سودایی': true }, false, {}, 8, 18, 15),
        createFoodItem('lu15', 'خورشت کرفس', 270, 'یک ملاقه', { 'صفرایی': true }, false, {}, 18, 20, 8),
        createFoodItem('lu16', 'عدس پلو با گوشت', 450, 'یک کفگیر', { 'معتدل': true }, false, {}, 25, 15, 60),
        createFoodItem('lu17', 'زرشک پلو', 480, 'یک کفگیر', { 'صفرایی': true }, false, {}, 10, 12, 80),
        createFoodItem('lu18', 'دیزی', 500, 'یک کاسه', { 'دموی': true }, false, {}, 30, 30, 35),
        createFoodItem('lu19', 'کباب برگ', 300, 'یک سیخ', { 'دموی': true }, false, {}, 40, 15, 2),
        createFoodItem('lu20', 'سالاد شیرازی', 30, 'یک کاسه کوچک', { 'بلغمی': true }, false, {}, 1, 0, 7),
        createFoodItem('lu21', 'ماست و خیار', 80, 'یک کاسه', { 'بلغمی': true }, false, {}, 4, 3, 8),
        createFoodItem('lu22', 'ته چین مرغ', 550, 'یک تکه', { 'صفرایی': true }, false, {}, 30, 25, 50),
        createFoodItem('lu23', 'باقالی پلو با گوشت', 600, 'یک بشقاب', { 'دموی': true }, false, {}, 40, 25, 55),
    ],
    afternoonSnack: [
        createFoodItem('as1', 'موز', 105, 'عدد', { 'دموی': true }, true, {}, 1.3, 0.4, 27),
        createFoodItem('as2', 'خرما', 23, 'عدد', { 'دموی': true }, true, {}, 0.2, 0, 6),
        createFoodItem('as3', 'کیک یزدی', 150, 'یک عدد', { 'صفرایی': true }, true, {}, 2, 8, 18),
        createFoodItem('as4', 'خیار', 15, 'عدد', { 'بلغمی': true }, true, { 'تابستانی': true }, 0.7, 0.1, 4),
        createFoodItem('as5', 'چای و بیسکوییت', 100, 'یک فنجان', { 'معتدل': true }, true, {}, 1, 4, 15),
        createFoodItem('as6', 'ژله', 80, 'یک کاسه', { 'بلغمی': true }, true, {}, 1.5, 0, 19),
        createFoodItem('as7', 'پاپ کورن', 100, 'یک کاسه', { 'صفرایی': true }, true, {}, 3, 1, 19),
    ],
    dinner: [
        createFoodItem('di1', 'نان لواش', 60, 'یک عدد', { 'معتدل': true }, false, {}, 2, 0.5, 12),
        createFoodItem('di2', 'سوپ جو', 150, 'یک کاسه', { 'بلغمی': true }, false, {}, 5, 3, 25),
        createFoodItem('di3', 'کوکو سبزی', 200, 'یک تکه', { 'صفرایی': true }, false, {}, 8, 15, 8),
        createFoodItem('di4', 'ماست کم چرب', 60, 'یک کاسه', { 'بلغمی': true }, false, {}, 3.5, 3.3, 5),
        createFoodItem('di5', 'میرزاقاسمی', 180, 'یک کاسه', { 'سودایی': true }, false, {}, 5, 14, 10),
        createFoodItem('di6', 'ماکارونی', 450, 'یک بشقاب', { 'معتدل': true }, false, {}, 15, 15, 65),
        createFoodItem('di7', 'سبزی پلو با ماهی', 500, 'یک بشقاب', { 'بلغمی': true }, false, {}, 30, 20, 50),
        createFoodItem('di8', 'زرشک پلو با مرغ', 550, 'یک بشقاب', { 'صفرایی': true }, false, {}, 35, 20, 60),
        createFoodItem('di9', 'کوکو سیب زمینی', 220, 'یک تکه', { 'صفرایی': true }, false, {}, 7, 14, 18),
        createFoodItem('di10', 'سالاد الویه', 350, 'یک کاسه', { 'بلغمی': true }, false, {}, 10, 25, 20),
        createFoodItem('di11', 'آش دوغ', 250, 'یک کاسه', { 'بلغمی': true }, false, {}, 12, 8, 35),
        createFoodItem('di12', 'خوراک لوبیا', 280, 'یک کاسه', { 'معتدل': true }, false, {}, 15, 5, 45),
        createFoodItem('di13', 'پیتزا', 600, '2 اسلایس', { 'صفرایی': true }, false, {}, 25, 28, 60),
    ],
    fruits: [
        createFoodItem('fr1', 'سیب', 95, 'عدد', { 'معتدل': true }, true, { 'پاییزی': true, 'زمستانی': true }, 0.5, 0.3, 25),
        createFoodItem('fr2', 'موز', 105, 'عدد', { 'دموی': true }, true, {}, 1.3, 0.4, 27),
        createFoodItem('fr3', 'پرتقال', 60, 'عدد', { 'بلغمی': true }, true, { 'زمستانی': true }, 1.2, 0.2, 15),
        createFoodItem('fr4', 'هندوانه', 85, 'قاچ', { 'بلغمی': true }, true, { 'تابستانی': true }, 1.7, 0.4, 21),
        createFoodItem('fr5', 'انگور', 100, 'خوشه کوچک', { 'دموی': true }, true, { 'تابستانی': true }, 1, 0.2, 27),
        createFoodItem('fr6', 'گیلاس', 50, '10 عدد', { 'دموی': true }, true, { 'بهاری': true }, 0.7, 0.1, 12),
        createFoodItem('fr7', 'زردآلو', 17, 'عدد', { 'صفرایی': true }, true, { 'تابستانی': true }, 0.5, 0.1, 4),
        createFoodItem('fr8', 'هلو', 60, 'عدد', { 'معتدل': true }, true, { 'تابستانی': true }, 1.4, 0.4, 15),
        createFoodItem('fr9', 'انار', 100, 'نصف', { 'سودایی': true }, true, { 'پاییزی': true }, 2, 1.4, 22),
        createFoodItem('fr10', 'خرمالو', 120, 'عدد', { 'دموی': true }, true, { 'پاییزی': true }, 0.8, 0.3, 32),
        createFoodItem('fr11', 'کیوی', 60, 'عدد', { 'بلغمی': true }, true, {}, 1, 0.5, 15),
        createFoodItem('fr12', 'توت فرنگی', 32, 'یک فنجان', { 'معتدل': true }, true, { 'بهاری': true }, 0.7, 0.3, 8),
        createFoodItem('fr13', 'طالبی', 60, 'یک قاچ', { 'بلغمی': true }, true, { 'تابستانی': true }, 1.5, 0.3, 14),
        createFoodItem('fr14', 'آلبالو', 50, 'یک فنجان', { 'سودایی': true }, true, { 'تابستانی': true }, 1, 0.3, 12),
        createFoodItem('fr15', 'شلیل', 65, 'عدد', { 'معتدل': true }, true, { 'تابستانی': true }, 1.5, 0.5, 16),
        createFoodItem('fr16', 'خربزه', 60, 'یک قاچ', { 'دموی': true }, true, { 'تابستانی': true }, 1.5, 0.3, 14),
    ],
    nuts: [
        createFoodItem('nu1', 'بادام درختی', 7, 'عدد', { 'دموی': true }, true, {}, 0.25, 0.6, 0.25),
        createFoodItem('nu2', 'گردو', 50, 'عدد', { 'دموی': true }, true, {}, 2, 5, 1),
        createFoodItem('nu3', 'پسته', 4, 'عدد', { 'دموی': true }, true, {}, 0.25, 0.5, 0.3),
        createFoodItem('nu4', 'فندق', 10, 'عدد', { 'صفرایی': true }, true, {}, 0.15, 0.6, 0.17),
        createFoodItem('nu5', 'تخمه آفتابگردان', 165, '3 قاشق', { 'صفرایی': true }, true, {}, 6, 14, 6),
        createFoodItem('nu6', 'بادام هندی', 155, '18 عدد', { 'دموی': true }, true, {}, 5, 12, 9),
        createFoodItem('nu7', 'بادام زمینی', 170, 'یک مشت کوچک', { 'دموی': true }, true, {}, 7, 14, 6),
        createFoodItem('nu8', 'تخمه کدو', 150, '3 قاشق', { 'بلغمی': true }, true, {}, 7, 13, 5),
        createFoodItem('nu9', 'انجیر خشک', 50, '2 عدد', { 'دموی': true }, true, {}, 0.6, 0.2, 13),
    ],
    sweets: [
        createFoodItem('sw1', 'خرما', 23, 'عدد', { 'دموی': true }, true, {}, 0.2, 0, 6),
        createFoodItem('sw2', 'کشمش', 30, 'قاشق غذاخوری', { 'دموی': true }, true, {}, 0.3, 0, 8),
        createFoodItem('sw3', 'عسل', 65, 'قاشق غذاخوری', { 'صفرایی': true }, true, {}, 0, 0, 17),
        createFoodItem('sw4', 'بستنی سنتی', 200, 'یک کاسه', { 'بلغمی': true }, true, {}, 4, 10, 25),
        createFoodItem('sw5', 'باقلوا', 180, 'یک تکه', { 'صفرایی': true }, true, {}, 2, 10, 22),
        createFoodItem('sw6', 'شله زرد', 250, 'یک کاسه', { 'صفرایی': true }, true, {}, 4, 5, 48),
        createFoodItem('sw7', 'گز', 110, 'یک عدد', { 'صفرایی': true }, true, {}, 2, 4, 18),
        createFoodItem('sw8', 'سوهان', 150, 'یک تکه کوچک', { 'صفرایی': true }, true, {}, 3, 9, 15),
        createFoodItem('sw9', 'حلوا', 200, 'یک تکه', { 'دموی': true }, true, {}, 3, 12, 20),
    ],
    drinks: [
        createFoodItem('dr1', 'دوغ', 55, 'یک لیوان', { 'بلغمی': true }, false, {}, 2, 2.5, 5),
        createFoodItem('dr2', 'نوشابه', 150, 'یک لیوان', { 'سودایی': true }, false, {}, 0, 0, 39),
        createFoodItem('dr3', 'آب', 0, 'یک لیوان', { 'معتدل': true }, false, {}, 0, 0, 0),
        createFoodItem('dr4', 'شربت آبلیمو', 100, 'یک لیوان', { 'بلغمی': true }, false, {}, 0, 0, 25),
        createFoodItem('dr5', 'چای', 2, 'یک فنجان', { 'معتدل': true }, false, {}, 0, 0, 0.5),
        createFoodItem('dr6', 'قهوه', 5, 'یک فنجان', { 'سودایی': true }, false, {}, 0, 0, 1),
        createFoodItem('dr7', 'آب پرتقال طبیعی', 110, 'یک لیوان', { 'بلغمی': true }, false, {}, 1.5, 0.5, 25),
        createFoodItem('dr8', 'شیر', 110, 'یک لیوان', { 'بلغمی': true }, false, {}, 8, 5, 12),
    ]
};

// --- DISEASE SEED DATA ---
export const diseaseSeedData: DiseaseData = {
    'بیماری های متابولیک و تغذیه ای': [
        { id: 'd1-1', name: 'چاقی و اضافه وزن', severity: 'متغیر', harmful_foods: 'غذاهای پرچرب و شیرین', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: فیبر، پروتئین', symptoms: 'افزایش وزن، خستگی، کاهش تحرک', common_drugs: 'اورلیستات' },
        { id: 'd1-2', name: 'کم وزنی و سوء تغذيه', severity: 'متغیر', harmful_foods: 'نوشابه، غذاهای بی ارزش (فست فود پرنمک و کم کالری)', beneficial_foods: 'گوشت سفید و قرمز، لبنیات پرچرب، مغزها، خرما، شیر', deficiency_abundance: 'کمبود پروتئین، ویتامینها، مینرالها', symptoms: 'ضعف، لاغری شدید، ریزش مو، خستگی', common_drugs: 'مکمل پروتئین/کالری، مولتی ویتامین مینرال' },
        { id: 'd1-3', name: 'دیابت نوع ۲', severity: 'متغیر', harmful_foods: 'شکر، چربی اشباع', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: منیزیم، کروم، ویتامین D, فیبر', symptoms: 'افزایش قند خون، خستگی، افزایش وزن', common_drugs: 'متفورمین، سولفونیل اوره' },
        { id: 'd1-4', name: 'هیپوگلیسمی (افت قند خون)', severity: 'متغیر', harmful_foods: 'قهوه زیاد، قند زیاد (باعث نوسان قند خون میشود)', beneficial_foods: 'میان وعده سالم، میوه کم قند، غلات کامل، لبنيات', deficiency_abundance: 'کمبود قند خون در زمان طولانی', symptoms: 'ضعف، لرزش، تعریق، بی حالی', common_drugs: 'گلوکز خوراکی' },
        { id: 'd3-7', name: 'چربی خون بالا', severity: 'متغیر', harmful_foods: 'چربی اشباع، ترانس، قند ساده، الکل', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: فیبر محلول، امگا-3', symptoms: 'خستگی، درد قفسه سینه، درد شکم', common_drugs: 'آتورواستاتین، فنوفیبرات' },
        { id: 'd1-7', name: 'سندرم متابولیک', severity: 'متغیر', harmful_foods: 'شکر، چربی اشباع، نمک زیاد', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: فیبر، امگا-3, منیزیم', symptoms: 'چاقی شکمی، فشار خون بالا، مقاومت به انسولین', common_drugs: 'متفورمین، داروهای فشار خون' },
        { id: 'd1-8', name: 'دیابت نوع ۱', severity: 'متغیر', harmful_foods: 'قند ساده، نوشابه‌ها', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: منیزیم، کروم، ویتامین D, امگا-3', symptoms: 'افزایش قند خون، تشنگی، تکرر ادرار', common_drugs: 'انسولین' }
    ],
    'بیماری های گوارشی و کبدی': [
        { id: 'd2-1', name: 'یبوست', severity: 'متغیر', harmful_foods: 'غذاهای فرآوری شده، نان سفید، فست فود', beneficial_foods: 'سبزیجات، میوه با پوست، حبوبات، آب فراوان، پروبیوتیک‌ها', deficiency_abundance: 'کمبود فیبر و آب', symptoms: 'مدفوع خشک و سخت، درد هنگام اجابت مزاج، نفخ', common_drugs: 'لاکتولوز' },
        { id: 'd2-2', name: 'اسهال مزمن تغذیه ای', severity: 'متغیر', harmful_foods: 'غذاهای چرب و سرخ شده، لبنیات پرچرب، نوشابه', beneficial_foods: 'موز، برنج، سیب پخته، سوپ سبزیجات', deficiency_abundance: 'کمبود آب، الکترولیتها، فيبر محلول', symptoms: 'مدفوع شل یا آبکی، ضعف، کم آبی', common_drugs: 'پروبیوتیک' },
        { id: 'd2-3', name: 'سندروم روده تحریک پذیر (IBS)', severity: 'متغیر', harmful_foods: 'گلوتن زیاد، حبوبات نفاخ، لبنیات پرچرب', beneficial_foods: 'سبزیجات کم FODMAP، جو دوسر، پروبیوتیک ها', deficiency_abundance: 'حساسیت به FODMAPها، کمبود فيبر محلول', symptoms: 'درد شکم، نفخ، تغییر در اجابت مزاج', common_drugs: 'سیمتیکون' },
        { id: 'd2-4', name: 'رفلاکس معده (GERD)', severity: 'متغیر', harmful_foods: 'چربی زیاد، فست فود، شکلات، قهوه، نوشابه گازدار', beneficial_foods: 'برنج، سبزیجات بخارپز، موز، گوشت کم چرب', deficiency_abundance: 'وفور چربی و غذاهای محرک', symptoms: 'سوزش معده، ترش کردن، درد قفسه سینه', common_drugs: 'امپرازول' },
        { id: 'd2-5', name: 'زخم معده و دوازدهه', severity: 'متغیر', harmful_foods: 'فست فود، الکل، ادویه تند، قهوه زیاد', beneficial_foods: 'سبزیجات، میوه های غیرترش، ماهی، لبنیات کم چرب', deficiency_abundance: 'کمبود آنتی اکسیدانها و پروتئین', symptoms: 'درد شکم، سوزش معده، تهوع، کاهش وزن', common_drugs: 'امپرازول' },
        { id: 'd2-6', name: 'بیماری سلیاک (Gluten sensitivity)', severity: 'متغیر', harmful_foods: 'گندم، جو، چاودار و محصولات حاوی گلوتن', beneficial_foods: 'برنج، سیب زمینی، ذرت، سبزیجات', deficiency_abundance: 'حساسیت به گلوتن، کمبود ویتامین‌ها و مواد معدنی', symptoms: 'اسهال، نفخ، کاهش وزن، کم خونی', common_drugs: 'بدون داروی خاص' },
        { id: 'd2-7', name: 'کبد چرب غیرالکلی (NAFLD)', severity: 'متغیر', harmful_foods: 'قند، فست فود، غذاهای سرخ شده، نوشابه', beneficial_foods: 'سبزيجات، حبوبات، ماهی، روغن زیتون، مركبات', deficiency_abundance: 'وفور قند و چربی اشباع، کمبود آنتی اکسیدان و فیبر', symptoms: 'خستگی، افزایش آنزیم های کبد', common_drugs: 'اورسودوکسی کولیک اسید' },
        { id: 'd2-8', name: 'التهاب کبد خفیف تغذیه ای', severity: 'متغیر', harmful_foods: 'الکل، چربی اشباع، قند زیاد', beneficial_foods: 'سبزیجات برگ سبز، ماهی، مغزها، مرکبات', deficiency_abundance: 'کمبود آنتی اکسیدانها، کمبود امگا-۳', symptoms: 'درد شکم، خستگی، اختلال هضم', common_drugs: 'درمان حمایتی' }
    ],
    'بیماری های قلب و عروق': [
        { id: 'd3-1', name: 'فشار خون بالا', severity: 'متغیر', harmful_foods: 'سدیم زیاد، غذاهای فرآوری شده', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: پتاسیم، منیزیم، منگنز', symptoms: 'سردرد، سرگیجه، خستگی', common_drugs: 'لوزارتان، آملودیپین' },
        { id: 'd3-2', name: 'آترواسکلروز (تصلب شرايين)', severity: 'متغیر', harmful_foods: 'کره، گوشت پرچرب، غذاهای سرخ شده', beneficial_foods: 'روغن زیتون، سبزیجات برگ سبز، سیر، جو', deficiency_abundance: 'وفور کلسترول LDL، چربی ترانس', symptoms: 'درد قفسه سینه، گرفتگی عروق، تنگی نفس', common_drugs: 'آتورواستاتین' },
        { id: 'd3-4', name: 'بیماری عروق کرونر', severity: 'متغیر', harmful_foods: 'شیرینیجات، فست فود، نوشابه', beneficial_foods: 'ماهی، سبزیجات، غلات سبوس دار، مغزها', deficiency_abundance: 'وفور کلسترول و قند، کمبود فیبر', symptoms: 'درد قفسه سینه، تنگی نفس، خستگی', common_drugs: 'نیتروگلیسیرین' },
        { id: 'd3-5', name: 'سکته قلبی', severity: 'متغیر', harmful_foods: 'نمک زیاد، چربی ترانس، گوشت قرمز زیاد', beneficial_foods: 'رژیم مدیترانه ای، ماهی، روغنهای سالم، مکمل CoQ10', deficiency_abundance: 'همان عوامل آترواسکلروز و فشار خون', symptoms: 'درد قفسه سینه، تعریق، تهوع، تنگی نفس', common_drugs: 'آسپرین' },
        { id: 'd3-3', name: 'سکته مغزی', severity: 'متغیر', harmful_foods: 'چربی اشباع، نمک، غذاهای فرآوری شده', beneficial_foods: 'سبزیجات، میوه ها، غلات کامل، ماهی', deficiency_abundance: 'وفور چربی اشباع', symptoms: 'ضعف ناگهانی در یک طرف بدن، اختلال تکلم، سرگیجه شدید', common_drugs: 'آنتی پلاکت' },
        { id: 'd3-6', name: 'نارسایی قلبی', severity: 'متغیر', harmful_foods: 'غذاهای پرنمک، کنسروی، الکل', beneficial_foods: 'میوه و سبزی تازه، برنج قهوه ای، ماهی', deficiency_abundance: 'وفور نمک و مایعات، کمبود پتاسیم و منیزیم', symptoms: 'تنگی نفس، ورم پا، خستگی', common_drugs: 'داروهای کنترل فشار، دیورتیک ها' }
    ],
    'بیماریهای عصبی و روانی': [
        { id: 'd4-1', name: 'افسردگی تغذیه ای', severity: 'متغیر', harmful_foods: 'قند زیاد، فست فود، نوشابه، الکل', beneficial_foods: 'ماهی چرب، مغزها، سبزيجات، لبنيات، تخم مرغ', deficiency_abundance: 'كمبود ویتامین D، B12، B9 (فولات)، امگا ۳ و آهن', symptoms: 'خستگی، کاهش انگیزه، خواب آشفته، بی حوصلگی', common_drugs: 'فلوکستین (SSRI)' },
        { id: 'd4-2', name: 'اضطراب', severity: 'متغیر', harmful_foods: 'کافئین زیاد، قند ساده، غذاهای فرآوری شده', beneficial_foods: 'مغزها، سبزیجات، غلات كامل، حبوبات', deficiency_abundance: 'کمبود منیزیم و ویتامین B6', symptoms: 'نگرانی مداوم، بی خوابی، تپش قلب، لرزش', common_drugs: 'بنزودیازپین' },
        { id: 'd4-3', name: 'خستگی مزمن', severity: 'متغیر', harmful_foods: 'رژیم های خیلی محدود، قند زیاد، فست فود', beneficial_foods: 'گوشت، ماهی، تخم مرغ، سبزیجات برگ سبز، مركبات', deficiency_abundance: 'کمبود آهن، ويتامينها (D, B12)، تمرکز', symptoms: 'ضعف، خواب آلودگی، کاهش تمرکز', common_drugs: 'داروهای محرک' },
        { id: 'd4-4', name: 'اختلال حافظه', severity: 'متغیر', harmful_foods: 'الکل، قند زیاد، غذاهای فرآوری شده', beneficial_foods: 'ماهی، مغزها، تخم مرغ، سبزیجات برگ سبز', deficiency_abundance: 'کمبود ویتامین D، B12، اسید فولیک (B9)، امگا ۳', symptoms: 'فراموشی، تمرکز ضعیف، کندی یادگیری', common_drugs: 'داروهای ضد آلزایمر' },
        { id: 'd4-5', name: 'آلزایمر', severity: 'متغیر', harmful_foods: 'شکر، چربی اشباع', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: ویتامین E, B12, فولیک اسید, امگا-3', symptoms: 'فراموشی، کاهش حافظه، تغییر خلق', common_drugs: 'مهارکننده کولین استراز' },
        { id: 'd4-6', name: 'پارکینسون', severity: 'متغیر', harmful_foods: 'پروتئین زیاد هنگام مصرف دارو', beneficial_foods: '', deficiency_abundance: 'مواد مغذی مفید: کوآنزیم Q10, امگا-3, ویتامین D', symptoms: 'لرزش، کندی حرکت، سفتی عضلات', common_drugs: 'لوودوپا' }
    ],
    'بیماریهای خونی': [
        { id: 'd5-1', name: 'کم خونی فقر آهن', severity: 'متغیر', harmful_foods: 'چای و قهوه زیاد (جذب آهن را کاهش میدهند)، غذاهای فرآوری شده', beneficial_foods: 'گوشت قرمز، جگر، عدس، لوبیا، اسفناج، مركبات', deficiency_abundance: 'کمبود آهن، ویتامین C (برای جذب آهن)', symptoms: 'خستگی، رنگ پریدگی، ضعف، تنگی نفس، سردرد', common_drugs: 'سولفات آهن' },
        { id: 'd5-2', name: 'کم خونی مگالوبلاستیک', severity: 'متغیر', harmful_foods: 'رژیم های خیلی محدود و فاقد منابع حيواني، الكل زياد', beneficial_foods: 'گوشت، ماهی، تخم مرغ، لبنیات، سبزیجات برگ سبز', deficiency_abundance: 'کمبود B12 یا فولیک اسید', symptoms: 'خستگی، ضعف، بی حسی دست و پا، اختلال حافظه', common_drugs: 'ویتامین B12، فولات' },
        { id: 'd5-3', name: 'پلی سیتمی ثانویه تغذیه ای', severity: 'متغیر', harmful_foods: 'مکمل آهن اضافی، الکل، رژیم با آهن زیاد', beneficial_foods: 'کنترل آهن در رژیم، آب کافی', deficiency_abundance: 'وفور آهن، اکسیژن پایین', symptoms: 'سرگیجه، سردرد، خستگی، کبودی', common_drugs: 'فلبوتومی' }
    ],
    'بیماریهای استخوان و مفاصل': [
        { id: 'd6-1', name: 'پوکی استخوان (Osteoporosis)', severity: 'متغیر', harmful_foods: 'مصرف زیاد کافئین، نمک، نوشابه های گازدار', beneficial_foods: 'لبنیات، سبزیجات برگ سبز، ماهی، مغزها، نور آفتاب', deficiency_abundance: 'کمبود کلسیم، ویتامینD ، منیزیم، ویتامین K', symptoms: 'شکستگی های مکرر، کاهش قد، درد استخوان، ضعف', common_drugs: 'بیس فسفونات' },
        { id: 'd6-2', name: 'نرمی استخوان (Rickets/Osteomalacia)', severity: 'متغیر', harmful_foods: 'کمبود ویتامین D، مصرف زیاد فست فود و شکر', beneficial_foods: 'لبنیات، ماهی چرب، نور آفتاب، سبزیجات برگ سبز', deficiency_abundance: 'كمبود ویتامین D ، کلسیم', symptoms: 'خمیدگی استخوانها، درد استخوان، ضعف عضلانی', common_drugs: 'ویتامین D + کلسیم' },
        { id: 'd6-3', name: 'آرتروز (Osteoarthritis)', severity: 'متغیر', harmful_foods: 'غذاهای فرآوری شده، چربی ترانس، قند زیاد', beneficial_foods: 'ماهی، روغن زیتون، سبزیجات، مغزها، مکمل ویتامین E، مکمل گلوکزآمین', deficiency_abundance: 'وفور وزن و چربی بدن، کمبود ویتامین D، امگا ۳', symptoms: 'درد مفصل، خشکی مفصل، التهاب مفصل، محدودیت حرکت', common_drugs: 'NSAID' },
        { id: 'd6-4', name: 'نقرس (Gout)', severity: 'متغیر', harmful_foods: 'گوشت قرمز، دل و جگر، غذاهای دریایی پرپورین، الكل', beneficial_foods: 'آب کافی، میوه ها، سبزيجات، لبنيات کم چرب', deficiency_abundance: 'وفور پورینها، کمبود آب', symptoms: 'درد مفصل، تورم، قرمزی، التهاب', common_drugs: 'آلوپورینول' }
    ],
    'بیماریهای غدد درون ریز': [
        { id: 'd7-1', name: 'کم کاری تیروئید (Hypothyroidism)', severity: 'متغیر', harmful_foods: 'کمبود ید (نمک یددار استفاده نشه)، سویا زیاد، غذاهای فرآوری شده', beneficial_foods: 'ماهی، جلبک دریایی، تخم مرغ، مغزها، حبوبات', deficiency_abundance: 'کمبود ید، سلنیوم، روی', symptoms: 'خستگی، افزایش وزن، یبوست، ریزش مو، خشکی پوست', common_drugs: 'لووتیروکسین' },
        { id: 'd7-2', name: 'پرکاری تیروئید (Hyperthyroidism)', severity: 'متغیر', harmful_foods: 'غذاهای غنی از ید زیاد (جلبک زیاد)، محرک ها (قهوه، الكل)', beneficial_foods: 'سبزيجات، غلات کامل، لبنیات، تخم مرغ', deficiency_abundance: 'وفور ید، کمبود سلنيوم', symptoms: 'کاهش وزن، تپش قلب، اضطراب، تعریق زیاد', common_drugs: 'متی مازول' },
        { id: 'd7-3', name: 'سندروم تخمدان پلی کیستیک (PCOS)', severity: 'متغیر', harmful_foods: 'قند ساده، نوشابه، فست فود، شیرینی های پرچرب', beneficial_foods: 'سبزیجات، غلات کامل، ماهی، مغزها، پروتئین کم چرب', deficiency_abundance: 'وفور قند و انسولین، کمبود ویتامین D و منیزیم', symptoms: 'افزایش وزن، رشد موهای زائد، اختلال قاعدگی، مقاومت به انسولین', common_drugs: 'متفورمین' },
        { id: 'd7-4', name: 'نارسایی آدرنال خفیف', severity: 'متغیر', harmful_foods: 'کمبود نمک یا مصرف زیاد قهوه، الكل', beneficial_foods: 'مرکبات، مغزها، سبزیجات، تخم مرغ', deficiency_abundance: 'كمبود ویتامینC ، B5، سدیم', symptoms: 'خستگی، ضعف، فشار خون پایین، تمایل به نمک', common_drugs: 'هیدروکورتیزون' }
    ],
    'بیماریهای کلیوی': [
        { id: 'dk-1', name: 'سنگ کلیه', severity: 'متغیر', harmful_foods: 'نمک زیاد، نوشابه، پروتئین حیوانی زیاد', beneficial_foods: 'آب فراوان، لیمو، سبزیجات', deficiency_abundance: 'کمبود آب و سیترات، وفور اگزالات یا کلسیم', symptoms: 'درد شدید پهلو، خون در ادرار، تهوع', common_drugs: 'سیترات پتاسیم' },
        { id: 'dk-2', name: 'نارسایی کلیه خفیف', severity: 'متغیر', harmful_foods: 'پروتئین زیاد، فسفر زیاد، پتاسیم زیاد، نمک زیاد', beneficial_foods: 'غذاهای کم پروتئین و کم نمک طبق دستور پزشک', deficiency_abundance: 'عدم توانایی دفع مواد زائد', symptoms: 'ورم، خستگی، کاهش ادرار', common_drugs: 'داروهای کنترل فشار' },
        { id: 'dk-3', name: 'احتباس آب و سدیم', severity: 'متغیر', harmful_foods: 'نمک، غذاهای فرآوری شده، کنسرو', beneficial_foods: 'غذاهای کم سدیم، سبزیجات تازه، آب', deficiency_abundance: 'وفور سدیم', symptoms: 'ورم دست و پا، افزایش وزن ناگهانی', common_drugs: 'دیورتیک ها' }
    ],
    'بیماریهای ایمنی و التهابی': [
        { id: 'di-1', name: 'آلرژی های غذایی', severity: 'متغیر', harmful_foods: 'بسته به نوع آلرژی (شیر، تخم مرغ، بادام زمینی...)', beneficial_foods: 'غذاهای جایگزین و بدون آلرژن, پروبیوتیک‌ها', deficiency_abundance: 'واکنش ایمنی به پروتئین خاص', symptoms: 'کهیر، تورم، مشکلات تنفسی، مشکلات گوارشی', common_drugs: 'ستیریزین' },
        { id: 'di-2', name: 'بیماریهای التهابی خفیف', severity: 'متغیر', harmful_foods: 'قند زیاد، چربی ترانس، غذاهای فرآوری شده', beneficial_foods: 'ماهی، روغن زیتون، زردچوبه، سبزیجات، غذاهای غنی از ویتامین D, E, C', deficiency_abundance: 'وفور چربی امگا-۶، کمبود امگا-۳', symptoms: 'درد مفاصل، خستگی، مشکلات پوستی', common_drugs: 'NSAID' },
        { id: 'di-3', name: 'آسم', severity: 'متغیر', harmful_foods: 'غذاهای فرآوری شده، سولفیتها (در میوه خشک)', beneficial_foods: 'میوه و سبزی تازه (ویتامین C, E)، ماهی (امگا-۳)، منابع ویتامین D', deficiency_abundance: 'کمبود آنتی اکسیدانها و ویتامین D', symptoms: 'سرفه، خس خس سینه، تنگی نفس', common_drugs: 'بتا آگونیست، کورتیکوستروئید' }
    ],
    'بیماریهای پوست و مو': [
        { id: 'd8-1', name: 'آکنه (جوش)', severity: 'متغیر', harmful_foods: 'شیرینی، فست فود، غذاهای سرخ شده، لبنیات پرچرب', beneficial_foods: 'سبزیجات، میوه ها، ماهی، مغزها، تخم مرغ', deficiency_abundance: 'وفور قند و لبنيات پرچرب، کمبود ویتامین A, E, C و روی', symptoms: 'جوش، التهاب پوست، چربی زیاد پوست', common_drugs: 'رتینوئید موضعی' },
        { id: 'd8-2', name: 'ریزش موی ناشی از تغذیه', severity: 'متغیر', harmful_foods: 'قند زیاد، رژیم های غذایی بسیار کم کالری', beneficial_foods: 'گوشت قرمز، تخم مرغ، حبوبات، مغزها، سبزیجات برگ سبز', deficiency_abundance: 'کمبود آهن، روی، بیوتین (B7)، پروتئین', symptoms: 'ریزش مو، نازک شدن مو، شکنندگی مو', common_drugs: 'مکمل آهن، بیوتین، زینک' }
    ]
};

// --- DRUG SEED DATA ---
const createDrugItem = (
    id: string,
    name: string,
    calories: number = 0,
    protein: number = 0,
    totalFat: number = 0,
    totalCarbs: number = 0,
    vitaminA: number = 0, vitaminD: number = 0, vitaminE: number = 0, vitaminK: number = 0,
    vitaminC: number = 0, b1: number = 0, b2: number = 0, b3: number = 0, b5: number = 0,
    b6: number = 0, b7: number = 0, b9: number = 0, b12: number = 0,
    calcium: number = 0, iron: number = 0, magnesium: number = 0, phosphorus: number = 0,
    potassium: number = 0, sodium: number = 0, zinc: number = 0, copper: number = 0,
    manganese: number = 0, selenium: number = 0, iodine: number = 0,
    chromium: number = 0, molybdenum: number = 0, fluoride: number = 0,
    omega3: number = 0, omega6: number = 0
): ManagedDrugItem => ({
    id, name, calories, protein, totalFat, totalCarbs,
    vitaminA, vitaminD, vitaminE, vitaminK, vitaminC, b1, b2, b3, b5, b6, b7, b9, b12,
    calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, copper, manganese,
    selenium, iodine, chromium, molybdenum, fluoride, omega3, omega6
});

export const drugSeedData: DrugData = {
    pills: [
        createDrugItem('drg1', 'قرص آهن (فروس سولفات)', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27),
        createDrugItem('drg2', 'قرص کلسیم + ویتامین D', 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500),
        createDrugItem('drg3', 'قرص مولتی ویتامین مینرال'),
        createDrugItem('drg4', 'کپسول امگا-۳', 9, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
        createDrugItem('drg5', 'قرص ویتامین C (500mg)', 0, 0, 0, 0, 0, 0, 0, 0, 500),
        createDrugItem('drg6', 'متفورمین'),
        createDrugItem('drg7', 'آتورواستاتین (لیپیتور)'),
        createDrugItem('drg8', 'لوزارتان'),
        createDrugItem('drg9', 'آسپرین (81mg)'),
        createDrugItem('drg10', 'امپرازول'),
        createDrugItem('drg11', 'لووتیروکسین'),
        createDrugItem('drg12', 'قرص زینک', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15),
    ],
    syrups: [
        createDrugItem('drg13', 'شربت زینک'),
        createDrugItem('drg14', 'شربت آهن'),
        createDrugItem('drg15', 'شربت مولتی ویتامین'),
        createDrugItem('drg16', 'لاکتولوز'),
    ]
};


// --- NEW EXPORTS FOR FLOATING HEALTH QUIZ ---

const allSymptoms = new Set<string>();
Object.values(diseaseSeedData).flat().forEach(disease => {
    // Fix: Use Persian comma '،' to split symptoms correctly.
    disease.symptoms.split('،').forEach(symptom => {
        const trimmed = symptom.trim();
        if (trimmed) allSymptoms.add(trimmed);
    });
});

const characteristicDiseasesToExclude = new Set(CHARACTERISTIC_OPTIONS.filter(o => o !== 'هیچکدام'));
const availableDiseaseCategories: { [key: string]: string[] } = Object.entries(DISEASE_CATEGORIES)
    .reduce((acc, [category, diseases]) => {
        const filteredDiseases = diseases.filter(d => !characteristicDiseasesToExclude.has(d));
        if (filteredDiseases.length > 0) {
            acc[category] = filteredDiseases;
        }
        return acc;
    }, {} as { [key: string]: string[] });
const allAvailableDiseases = Object.values(availableDiseaseCategories).flat();

export const ALL_SYMPTOMS_AND_DISEASES = [...new Set([...allAvailableDiseases, ...Array.from(allSymptoms)])].sort((a, b) => a.localeCompare(b, 'fa'));

export const ALL_DRUGS = [...new Set(Object.values(drugSeedData).flat().map(d => d.name))].sort((a, b) => a.localeCompare(b, 'fa'));