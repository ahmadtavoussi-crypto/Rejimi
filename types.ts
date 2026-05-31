// Fix: Removed circular dependency. AppStep is defined in this file.
export type AppStep = 'temperament' | 'initial_diet' | 'activity_level' | 'financial_level' | 'secondary_diet' | 'health' | 'diet' | 'generate' | 'bmi' | 'characteristic';
export type StepState = 'locked' | 'incomplete' | 'active' | 'completed';


export interface UserInput {
  age: number | '';
  height: number | '';
  weight: number | '';
  wristCircumference: number | '';
  gender: 'مرد' | 'زن' | '';
  activityLevel: 'کم' | 'متوسط' | 'زیاد' | '';
  goal: 'کاهش وزن' | 'حفظ وزن' | 'افزایش وزن' | '';
  secondaryDiet: string;
  financialLevel: 'اقتصادی' | 'متوسط' | 'گران' | '';
  healthConditions: string[];
  // Fix: The logic in geminiService.ts checks for 'نمیدانم', so this type needs to be updated to allow it.
  temperament: Temperament | 'نمیدانم' | '';
  temperamentAnswers?: { [key: number]: number };
  currentDiet: string;
  consumedDrugs: string[];
  declaredDietCalories?: string;
  skippedSteps: Set<AppStep>;
}

export interface FoodItem {
  name: string;
  amount: string;
}

export interface DailyPlan {
  day: string;
  breakfast: FoodItem[];
  morningSnack: FoodItem[];
  lunch: FoodItem[];
  afternoonSnack: FoodItem[];
  dinner: FoodItem[];
  totalCalories: string;
}

export interface DietPlan {
  dailyPlans: DailyPlan[];
}

export type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';

// Initial diet analysis types
export interface AnalysisItem {
  nutrient: string;
  status: 'deficiency' | 'excess' | 'adequate';
  reasoning: string;
  suggestions: string[];
}

export interface InitialAnalysis {
  analysis: AnalysisItem[];
}

// Admin Panel Types
export type Temperament = 'سودایی' | 'بلغمی' | 'صفرایی' | 'دموی' | 'معتدل';
export const TEMPERAMENTS: Temperament[] = ['سودایی', 'بلغمی', 'صفرایی', 'دموی', 'معتدل'];

export type Season = 'بهاری' | 'تابستانی' | 'پاییزی' | 'زمستانی';
export const SEASONS: Season[] = ['بهاری', 'تابستانی', 'پاییزی', 'زمستانی'];

export interface ManagedFoodItem {
    id: string;
    name: string;
    servingUnit: string;
    isSnack: boolean;
    temperaments: Partial<Record<Temperament, boolean>>;
    seasons: Partial<Record<Season, boolean>>;
    specialDiets: { [key: string]: boolean };

    // Nutritional Info
    calories: number;
    protein: number;
    essentialAminoAcids: number;
    totalFat: number;
    saturatedFat: number;
    monounsaturatedFat: number;
    polyunsaturatedFat: number;
    transFat: number;
    totalCarbs: number;
    simpleSugars: number;
    starch: number;
    dietaryFiber: number;
    solubleFiber: number;
    insolubleFiber: number;
    water: number;
    alcohol: number;
    cholesterol: number;
    glycemicIndex: number;
    glycemicLoad: number;

    // Vitamins (µg or mg)
    vitaminA: number; vitaminD: number; vitaminE: number; vitaminK: number;
    vitaminC: number; b1: number; b2: number; b3: number; b5: number;
    b6: number; b7: number; b9: number; b12: number;

    // Minerals (mg or µg)
    calcium: number; iron: number; magnesium: number; phosphorus: number;
    potassium: number; sodium: number; zinc: number; copper: number;
    manganese: number; selenium: number; iodine: number;
    chromium: number;
    molybdenum: number;
    fluoride: number;

    // Fats (g)
    omega3: number;
    omega6: number;

    // Other Compounds
    probiotics: number;
    creatine: number;
    carnitine: number;
    coenzymeQ10: number;
    carotenoids: number;
    isoflavones: number;

    // Availability
    availableFor: {
        poor: boolean;
        middle: boolean;
        wealthy: boolean;
    };
}


export type AdminDataCategory = string;

// Maps user input to the keys in `availableFor`
export const financialLevelMapping: { [key in UserInput['financialLevel']]: keyof ManagedFoodItem['availableFor'] } = {
    'اقتصادی': 'poor',
    'متوسط': 'middle',
    'گران': 'wealthy'
};

export interface AdminData {
    [key: AdminDataCategory]: ManagedFoodItem[];
}

// Nutritional Analysis Types
export interface NutrientDRI {
    name: string;
    unit: string;
    rda?: number; // Recommended Dietary Allowance
    ai?: number;  // Adequate Intake
    ul?: number;  // Tolerable Upper Intake Level
}

export interface DRIProfile {
    [key: string]: NutrientDRI | undefined;
}

export interface NutrientAnalysis {
    nutrient: keyof ManagedFoodItem;
    name: string;
    intake: number;
    target: number;
    unit: string;
    adequacy: number; // intake / target
    status: 'low' | 'adequate' | 'high' | 'excess';
    ul?: number;
}

export interface AnalysisResult {
    report: NutrientAnalysis[];
    notes: {
        deficiencies: { nutrient: keyof ManagedFoodItem, name: string, suggestions: string[] }[];
        excesses: { nutrient: keyof ManagedFoodItem, name: string, message: string }[];
    };
}

// Disease Management Types
export interface DiseaseInfo {
  id: string;
  name: string;
  severity: string;
  symptoms: string;
  deficiency_abundance: string;
  beneficial_foods: string;
  harmful_foods: string;
  common_drugs: string;
}

export type DiseaseCategory = string;

export interface DiseaseData {
  [key: DiseaseCategory]: DiseaseInfo[];
}

// Drug Management Types
export interface ManagedDrugItem {
    id: string;
    name: string;
    // Nutritional Info
    calories: number;
    protein: number;
    totalFat: number;
    totalCarbs: number;
    vitaminA: number; vitaminD: number; vitaminE: number; vitaminK: number;
    vitaminC: number; b1: number; b2: number; b3: number; b5: number;
    b6: number; b7: number; b9: number; b12: number;
    calcium: number; iron: number; magnesium: number; phosphorus: number;
    potassium: number; sodium: number; zinc: number; copper: number;
    manganese: number; selenium: number; iodine: number;
    chromium: number;
    molybdenum: number;
    fluoride: number;
    omega3: number;
    omega6: number;
}
export type DrugDataCategory = string;
export interface DrugData {
    [key: DrugDataCategory]: ManagedDrugItem[];
}

export interface UserProfile {
    phone: string;
    fullName?: string;
    age?: number | '';
    gender?: 'مرد' | 'زن' | '';
    height?: number | '';
    weight?: number | '';
    activityLevel?: 'کم' | 'متوسط' | 'زیاد' | '';
    goal?: 'کاهش وزن' | 'حفظ وزن' | 'افزایش وزن' | '';
    financialLevel?: 'اقتصادی' | 'متوسط' | 'گران' | '';
    secondaryDiet?: string;
    characteristic?: string;
    avatar?: string;
}
