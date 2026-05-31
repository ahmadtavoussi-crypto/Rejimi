import React, { useMemo, useState, useEffect } from 'react';
import { UserInput, Temperament, UserProfile } from '../types';
import { toPersianDigits } from '../utils/calculations';
import { NEW_DIETS, CHARACTERISTIC_OPTIONS } from '../constants';

interface SampleCircleProps {
    formData: UserInput;
    dailyNeeds: {
        bmi: number;
        bmiCategory: string;
        dailyCalories: number;
    };
    viewportMode?: 'mobile' | 'tablet' | 'desktop';
    onUpdateFormData?: React.Dispatch<React.SetStateAction<UserInput>>;
}

const DEFAULT_USERS_SEED: UserProfile[] = [
  {
    phone: '09121111111',
    fullName: 'آرش علوی',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    financialLevel: '',
    secondaryDiet: '',
    characteristic: ''
  },
  {
    phone: '09152222222',
    fullName: 'سارا رضایی',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    financialLevel: '',
    secondaryDiet: '',
    characteristic: ''
  },
  {
    phone: '09353333333',
    fullName: 'محمد مرادی',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    financialLevel: '',
    secondaryDiet: '',
    characteristic: ''
  }
];

export const SampleCircle: React.FC<SampleCircleProps> = ({ formData, dailyNeeds, viewportMode = 'desktop', onUpdateFormData }) => {
    const { bmi, bmiCategory, dailyCalories } = dailyNeeds;
    const { age, height, weight, gender, activityLevel, temperament, healthConditions } = formData;

    const isMobile = viewportMode === 'mobile';
    const liesInFrame = !isMobile;

    // Manage visibility of the elements inside Popups as requested
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [activeWidget, setActiveWidget] = useState<'bmi' | 'macros' | 'mizaj' | null>(null);

    // Auto-dismiss the active widget popup after 5 seconds to prevent user disruption
    useEffect(() => {
        if (activeWidget) {
            const timer = setTimeout(() => {
                setActiveWidget(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [activeWidget]);

    // Profile Modal States
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentPhone, setCurrentPhone] = useState<string>('');
    const [profileForm, setProfileForm] = useState<UserProfile>({ phone: '' });
    const [loginPhone, setLoginPhone] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string>('');

    const isRequirementsMet = () => {
        return (
            profileForm.height !== undefined && profileForm.height !== '' &&
            profileForm.weight !== undefined && profileForm.weight !== '' &&
            profileForm.age !== undefined && profileForm.age !== ''
        );
    };

    // Initial load: seed default users if not present + restore login state
    useEffect(() => {
        const storedUsers = localStorage.getItem('users-profiles');
        let shouldForceReseed = false;
        if (storedUsers) {
            try {
                const list = JSON.parse(storedUsers);
                if (Array.isArray(list) && list.some(u => u.phone === '09121111111' && (u.age !== '' || u.activityLevel !== ''))) {
                    shouldForceReseed = true;
                }
            } catch (e) {
                shouldForceReseed = true;
            }
        }
        if (!storedUsers || shouldForceReseed) {
            localStorage.setItem('users-profiles', JSON.stringify(DEFAULT_USERS_SEED));
            localStorage.removeItem('current-user-phone');
        }

        const activeUserPhone = localStorage.getItem('current-user-phone');
        if (activeUserPhone) {
            setCurrentPhone(activeUserPhone);
            // Load user data
            const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('users-profiles') || '[]');
            const matched = allUsers.find(u => u.phone === activeUserPhone);
            if (matched) {
                setProfileForm(matched);
                // Synchronize parent state with restored user profile
                if (onUpdateFormData) {
                    onUpdateFormData((prev: UserInput) => {
                        const otherConditions = prev.healthConditions.filter(c => !CHARACTERISTIC_OPTIONS.includes(c));
                        const newHealthConditions = matched.characteristic ? [...otherConditions, matched.characteristic] : otherConditions;
                        return {
                            ...prev,
                            age: matched.age !== undefined && matched.age !== '' ? Number(matched.age) : '',
                            height: matched.height !== undefined && matched.height !== '' ? Number(matched.height) : '',
                            weight: matched.weight !== undefined && matched.weight !== '' ? Number(matched.weight) : '',
                            gender: matched.gender !== undefined ? matched.gender as any : '',
                            activityLevel: matched.activityLevel !== undefined ? matched.activityLevel as any : '',
                            goal: matched.goal !== undefined ? matched.goal as any : '',
                            financialLevel: matched.financialLevel !== undefined ? matched.financialLevel as any : '',
                            secondaryDiet: matched.secondaryDiet !== undefined ? matched.secondaryDiet : '',
                            healthConditions: newHealthConditions,
                        };
                    });
                }
            } else {
                setProfileForm({ phone: activeUserPhone });
            }
        }
    }, [onUpdateFormData]);

    // Bidirectional Sync: Keep parent's formData in perfect sync when user profile is updated from the profile window
    const updateProfileField = (key: keyof UserProfile, value: any) => {
        const updatedForm = { ...profileForm, [key]: value };
        setProfileForm(updatedForm);

        if (currentPhone) {
            const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('users-profiles') || '[]');
            const updatedUsers = allUsers.map(u => {
                if (u.phone === currentPhone) {
                    return updatedForm;
                }
                return u;
            });
            if (!allUsers.some(u => u.phone === currentPhone)) {
                updatedUsers.push(updatedForm);
            }
            localStorage.setItem('users-profiles', JSON.stringify(updatedUsers));
            window.dispatchEvent(new Event('storage'));
        }

        if (onUpdateFormData) {
            onUpdateFormData((prev: UserInput) => {
                const updatedInput = { ...prev };
                if (key === 'age') updatedInput.age = value !== '' ? Number(value) : '';
                if (key === 'height') updatedInput.height = value !== '' ? Number(value) : '';
                if (key === 'weight') updatedInput.weight = value !== '' ? Number(value) : '';
                if (key === 'gender') updatedInput.gender = value as any;
                if (key === 'activityLevel') updatedInput.activityLevel = value as any;
                if (key === 'goal') updatedInput.goal = value as any;
                if (key === 'financialLevel') updatedInput.financialLevel = value as any;
                if (key === 'secondaryDiet') updatedInput.secondaryDiet = value as string;
                if (key === 'characteristic') {
                    const other = prev.healthConditions.filter(c => !CHARACTERISTIC_OPTIONS.includes(c));
                    updatedInput.healthConditions = value ? [...other, value] : other;
                }
                return updatedInput;
            });
        }
    };

    // Bidirectional Sync: Keep profile window fields in sync when a quiz changes parent's formData
    useEffect(() => {
        if (!currentPhone) return;
        
        const currentCharacteristicInForm = formData.healthConditions.find(c => CHARACTERISTIC_OPTIONS.includes(c)) || '';
        const hasChanged = 
            profileForm.age !== formData.age ||
            profileForm.height !== formData.height ||
            profileForm.weight !== formData.weight ||
            profileForm.gender !== formData.gender ||
            profileForm.activityLevel !== formData.activityLevel ||
            profileForm.goal !== formData.goal ||
            profileForm.financialLevel !== formData.financialLevel ||
            profileForm.secondaryDiet !== formData.secondaryDiet ||
            profileForm.characteristic !== currentCharacteristicInForm;

        if (hasChanged) {
            const updatedForm = {
                ...profileForm,
                age: formData.age !== undefined && formData.age !== '' ? Number(formData.age) : '',
                height: formData.height !== undefined && formData.height !== '' ? Number(formData.height) : '',
                weight: formData.weight !== undefined && formData.weight !== '' ? Number(formData.weight) : '',
                gender: formData.gender ? formData.gender as any : '',
                activityLevel: formData.activityLevel ? formData.activityLevel as any : '',
                goal: formData.goal ? formData.goal as any : '',
                financialLevel: formData.financialLevel ? formData.financialLevel as any : '',
                secondaryDiet: formData.secondaryDiet ? formData.secondaryDiet as string : '',
                characteristic: currentCharacteristicInForm
            };
            setProfileForm(updatedForm);

            const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('users-profiles') || '[]');
            const updatedUsers = allUsers.map(u => {
                if (u.phone === currentPhone) {
                    return updatedForm;
                }
                return u;
            });
            if (!allUsers.some(u => u.phone === currentPhone)) {
                updatedUsers.push(updatedForm);
            }
            localStorage.setItem('users-profiles', JSON.stringify(updatedUsers));
            window.dispatchEvent(new Event('storage'));
        }
    }, [formData, currentPhone]);

    // Login action helper
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = loginPhone.trim();
        if (!cleaned) {
            setLoginError('لطفا شماره تلفن خود را وارد کنید.');
            return;
        }
        if (!cleaned.startsWith('09') || cleaned.length < 11) {
            setLoginError('قالب شماره تلفن صحیح نیست (مثال: 09121234567)');
            return;
        }

        const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('users-profiles') || '[]');
        let matched = allUsers.find(u => u.phone === cleaned);

        // Preseed simulated dummy data on first login for the demo phone
        if (!matched && cleaned === '09121234567') {
            matched = {
                phone: '09121234567',
                fullName: 'پوریا رضایی',
                age: '',
                gender: '',
                height: '',
                weight: '',
                activityLevel: '',
                goal: '',
                financialLevel: '',
                secondaryDiet: '',
                characteristic: ''
            };
            allUsers.push(matched);
            localStorage.setItem('users-profiles', JSON.stringify(allUsers));
        }

        if (!matched) {
            matched = {
                phone: cleaned,
                fullName: '',
                age: '',
                gender: '',
                height: '',
                weight: '',
                activityLevel: '',
                goal: '',
                financialLevel: '',
                secondaryDiet: '',
                characteristic: ''
            };
            allUsers.push(matched);
            localStorage.setItem('users-profiles', JSON.stringify(allUsers));
        }

        localStorage.setItem('current-user-phone', cleaned);
        setCurrentPhone(cleaned);
        setProfileForm(matched);
        setLoginPhone('');
        setLoginError('');

        // Synchronize parent state with newly logged-in user profile
        if (onUpdateFormData && matched) {
            onUpdateFormData((prev: UserInput) => {
                const otherConditions = prev.healthConditions.filter(c => !CHARACTERISTIC_OPTIONS.includes(c));
                const newHealthConditions = matched.characteristic ? [...otherConditions, matched.characteristic] : otherConditions;
                return {
                    ...prev,
                    age: matched.age !== undefined && matched.age !== '' ? Number(matched.age) : '',
                    height: matched.height !== undefined && matched.height !== '' ? Number(matched.height) : '',
                    weight: matched.weight !== undefined && matched.weight !== '' ? Number(matched.weight) : '',
                    gender: matched.gender !== undefined ? matched.gender as any : '',
                    activityLevel: matched.activityLevel !== undefined ? matched.activityLevel as any : '',
                    goal: matched.goal !== undefined ? matched.goal as any : '',
                    financialLevel: matched.financialLevel !== undefined ? matched.financialLevel as any : '',
                    secondaryDiet: matched.secondaryDiet !== undefined ? matched.secondaryDiet : '',
                    healthConditions: newHealthConditions,
                };
            });
        }
    };

    // Save profile change updates
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isRequirementsMet()) {
            setProfileError('جهت ذخیره و تکمیل، ابتدا سه الزام قد، وزن و سن را انتخاب نمایید.');
            return;
        }

        setProfileError('');
        const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('users-profiles') || '[]');
        const updatedUsers = allUsers.map(u => {
            if (u.phone === currentPhone) {
                return { ...profileForm };
            }
            return u;
        });

        if (!allUsers.some(u => u.phone === currentPhone)) {
            updatedUsers.push({ ...profileForm });
        }

        localStorage.setItem('users-profiles', JSON.stringify(updatedUsers));
        
        // Also update local copy for other tables using it in Admin
        window.dispatchEvent(new Event('storage'));

        // Final sync check
        if (onUpdateFormData) {
            onUpdateFormData((prev: UserInput) => {
                const otherConditions = prev.healthConditions.filter(c => !CHARACTERISTIC_OPTIONS.includes(c));
                const newHealthConditions = profileForm.characteristic ? [...otherConditions, profileForm.characteristic] : otherConditions;
                return {
                    ...prev,
                    age: profileForm.age !== undefined && profileForm.age !== '' ? Number(profileForm.age) : '',
                    height: profileForm.height !== undefined && profileForm.height !== '' ? Number(profileForm.height) : '',
                    weight: profileForm.weight !== undefined && profileForm.weight !== '' ? Number(profileForm.weight) : '',
                    gender: profileForm.gender !== undefined ? profileForm.gender as any : '',
                    activityLevel: profileForm.activityLevel !== undefined ? profileForm.activityLevel as any : '',
                    goal: profileForm.goal !== undefined ? profileForm.goal as any : '',
                    financialLevel: profileForm.financialLevel !== undefined ? profileForm.financialLevel as any : '',
                    secondaryDiet: profileForm.secondaryDiet !== undefined ? profileForm.secondaryDiet : '',
                    healthConditions: newHealthConditions,
                };
            });
        }

        setSaveSuccess(true);
        setTimeout(() => {
            setSaveSuccess(false);
            setIsProfileOpen(false);
        }, 1200);
    };

    const handleLogout = () => {
        localStorage.removeItem('current-user-phone');
        setCurrentPhone('');
        setProfileForm({ phone: '' });
    };

    // Standard macronutrient distribution calculation
    const macros = useMemo(() => {
        if (!dailyCalories) {
            return { carbs: 0, protein: 0, fat: 0 };
        }
        // Let's assume a balanced active ratio (50% Carbs, 25% Protein, 25% Fat)
        const carbsKcal = dailyCalories * 0.50;
        const proteinKcal = dailyCalories * 0.25;
        const fatKcal = dailyCalories * 0.25;

        return {
            carbs: Math.round(carbsKcal / 4), // 4 kcal per gram of carbs
            protein: Math.round(proteinKcal / 4), // 4 kcal per gram of protein
            fat: Math.round(fatKcal / 9), // 9 kcal per gram of fat
        };
    }, [dailyCalories]);

    // Calculate percentage values for rendering rings
    const parsedWeight = Number(weight) || 70;
    const parsedHeight = Number(height) || 170;
    const parsedAge = Number(age) || 30;

    const bmiPercent = Math.min(100, Math.max(10, (bmi / 40) * 100));

    // Dynamic temperament circular distribution based on user answers/type
    const temperamentPercentages = useMemo(() => {
        const base = { سودایی: 20, بلغمی: 20, صفرایی: 20, دموی: 20, معتدل: 20 };
        if (temperament && temperament !== 'نمیدانم') {
            const chosen = temperament as Temperament;
            Object.keys(base).forEach(key => {
                if (key === chosen) {
                    base[key as keyof typeof base] = 50;
                } else {
                    base[key as keyof typeof base] = 12.5;
                }
            });
        }
        return base;
    }, [temperament]);

    // Radii of SVGs
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // 1. Calorie & BMI Circular Rings
    const calorieRings = (
        <div id="bmi-calorie-rings" className={`${isMobile ? 'bg-transparent border-none p-2 shadow-none' : 'bg-white p-4 rounded-xl border border-slate-100 shadow-sm'} flex flex-col items-center justify-center text-center w-full h-full`}>
            <span className="text-xs font-semibold text-slate-500 mb-3 block">شاخص کالری و BMI</span>
            <div className="relative flex items-center justify-center h-36 w-36">
                {/* Outer SVG containing multiple concentric progress rings */}
                <svg className="transform -rotate-90 h-full w-full">
                    {/* BMI Ring background */}
                    <circle
                        stroke="#f1f5f9"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="origin-center translate-x-[12px] translate-y-[12px]"
                    />
                    {/* BMI Ring foreground */}
                    <circle
                        stroke={bmi < 18.5 ? '#38bdf8' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444'}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset: circumference - (bmiPercent / 100) * circumference }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="origin-center translate-x-[12px] translate-y-[12px] transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />

                    {/* Inner Ring (Calorpies / TDEE Indicator) */}
                    <circle
                        stroke="#e2e8f0"
                        fill="transparent"
                        strokeWidth={stroke - 3}
                        r={normalizedRadius - 15}
                        cx={radius}
                        cy={radius}
                        className="origin-center translate-x-[12px] translate-y-[12px]"
                    />
                    <circle
                        stroke="#a855f7"
                        fill="transparent"
                        strokeWidth={stroke - 3}
                        strokeDasharray={(normalizedRadius - 15) * 2 * Math.PI + ' '}
                        style={{
                            strokeDashoffset: ((normalizedRadius - 15) * 2 * Math.PI) - (Math.min(100, (dailyCalories / 4000) * 100) / 100) * ((normalizedRadius - 15) * 2 * Math.PI)
                        }}
                        r={normalizedRadius - 15}
                        cx={radius}
                        cy={radius}
                        className="origin-center translate-x-[12px] translate-y-[12px] transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Value */}
                <div className="absolute text-slate-800 flex flex-col items-center">
                    <span className="text-xl font-bold">{bmi ? toPersianDigits(bmi.toFixed(1)) : '۰.۰'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">BMI</span>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-1 w-full text-right text-xs">
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />شاخص توده بدنی:</span>
                    <span className="font-bold text-slate-800">{bmiCategory}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block" />انرژی مورد نیاز خالص:</span>
                    <span className="font-bold text-slate-800">{dailyCalories ? toPersianDigits(dailyCalories) : '۰'} کالری</span>
                </div>
            </div>
        </div>
    );

    // 2. Macronutrients Distribution Dashboard
    const macroBar = (
        <div id="macro-nutrition-bar" className={`${isMobile ? 'bg-transparent border-none p-2 shadow-none' : 'bg-white p-4 rounded-xl border border-slate-100 shadow-sm'} flex flex-col items-center justify-center w-full h-full`}>
            <span className="text-xs font-semibold text-slate-500 mb-3 block text-center">دایره توزیع درشت‌مغذی‌ها</span>
            
            <div className="relative flex items-center justify-center h-36 w-36">
                {/* Interactive stacked multi-rings mapping Carb, Protein, Fats */}
                <svg className="transform -rotate-90 h-full w-full">
                    {/* Carbs ring loop */}
                    <circle stroke="#fee2e2" fill="transparent" strokeWidth={5} r={40} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px]" />
                    <circle stroke="#ef4444" fill="transparent" strokeWidth={5} strokeDasharray={40 * 2 * Math.PI} style={{ strokeDashoffset: 40 * 2 * Math.PI - 0.5 * (40 * 2 * Math.PI) }} r={40} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px] transition-all duration-1000" strokeLinecap="round" />

                    {/* Protein ring loop */}
                    <circle stroke="#dcfce7" fill="transparent" strokeWidth={5} r={30} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px]" />
                    <circle stroke="#22c55e" fill="transparent" strokeWidth={5} strokeDasharray={30 * 2 * Math.PI} style={{ strokeDashoffset: 30 * 2 * Math.PI - 0.25 * (30 * 2 * Math.PI) }} r={30} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px] transition-all duration-1000" strokeLinecap="round" />

                    {/* Fats ring loop */}
                    <circle stroke="#fef3c7" fill="transparent" strokeWidth={5} r={20} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px]" />
                    <circle stroke="#f59e0b" fill="transparent" strokeWidth={5} strokeDasharray={20 * 2 * Math.PI} style={{ strokeDashoffset: 20 * 2 * Math.PI - 0.25 * (20 * 2 * Math.PI) }} r={20} cx={radius} cy={radius} className="origin-center translate-x-[12px] translate-y-[12px] transition-all duration-1000" strokeLinecap="round" />
                </svg>
                
                <div className="absolute text-slate-800 flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-700">توزیع انرژی</span>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5 w-full text-right text-xs">
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" />کربوهیدرات (۵۰٪):</span>
                    <span className="font-bold text-slate-800">{macros.carbs ? toPersianDigits(macros.carbs) : '۰'} گرم</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" />پروتئین (۲۵٪):</span>
                    <span className="font-bold text-slate-800">{macros.protein ? toPersianDigits(macros.protein) : '۰'} گرم</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />چربی مفید (۲۵٪):</span>
                    <span className="font-bold text-slate-800">{macros.fat ? toPersianDigits(macros.fat) : '۰'} گرم</span>
                </div>
            </div>
        </div>
    );

    // 3. Temperament Constitutional Balance Flower Circle
    const mizajPanel = (
        <div id="mizaj-distribution-panel" className={`${isMobile ? 'bg-transparent border-none p-2 shadow-none' : 'bg-white p-4 rounded-xl border border-slate-100 shadow-sm'} flex flex-col items-center justify-center w-full h-full`}>
            <span className="text-xs font-semibold text-slate-500 mb-3 block text-center">دایره و نمودار دایره‌ای تعادل مزاج</span>

            <div className="relative flex items-center justify-center h-36 w-36">
                {/* Conic-gradient representation of temperament balance circles */}
                <div 
                    className="h-28 w-28 rounded-full border-4 border-white shadow-inner flex items-center justify-center transition-all duration-500"
                    style={{
                        background: `conic-gradient(
                            #ef4444 0% ${temperamentPercentages.سودایی}%, 
                            #3b82f6 ${temperamentPercentages.سودایی}% ${temperamentPercentages.سودایی + temperamentPercentages.بلغمی}%, 
                            #f59e0b ${temperamentPercentages.سودایی + temperamentPercentages.بلغمی}% ${temperamentPercentages.سودایی + temperamentPercentages.بلغمی + temperamentPercentages.صفرایی}%, 
                            #10b981 ${temperamentPercentages.سودایی + temperamentPercentages.بلغمی + temperamentPercentages.صفرایی}% 100%
                        )`
                    }}
                />
                <div className="absolute h-14 w-14 rounded-full bg-white flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-400 font-bold leading-none">توصیه پایه</span>
                    <span className="text-xs font-bold text-slate-700 leading-tight mt-0.5">{temperament || 'احرازنشده'}</span>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 w-full justify-center text-[11px] text-slate-600 font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" />سودا</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />بلغم</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />صفرا</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />دموی</span>
            </div>
        </div>
    );

    return (
        <div id="main-circles-dashboard" className="relative flex justify-end items-center gap-2">
            {/* The transparent click trap for standard dropdown dismissal */}
            {isOpenMenu && (
                <div 
                    className="fixed inset-0 z-30 bg-transparent" 
                    onClick={() => setIsOpenMenu(false)} 
                />
            )}

            {/* Profile circle button to the left of the plus button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        setIsProfileOpen(true);
                        setIsOpenMenu(false);
                    }}
                    className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-650 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 flex items-center justify-center text-lg font-bold shadow-xs transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                    title="پروفایل کاربری"
                >
                    👤
                </button>
            </div>

            {/* Plus button alone without any text/explanation at the top-right */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpenMenu(!isOpenMenu)}
                    className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 text-teal-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 flex items-center justify-center text-lg font-bold shadow-xs transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                    title="افزودن ابزار پایش"
                >
                    +
                </button>

                {/* Dropdown menu showing 3 options */}
                {isOpenMenu && (
                    <div className="absolute bottom-11 right-0 z-[100] bg-white border border-slate-200/80 rounded-2xl shadow-xl p-1.5 min-w-[210px] flex flex-col gap-1 text-right animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveWidget('bmi');
                                setIsOpenMenu(false);
                            }}
                            className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150 font-bold flex items-center gap-2 cursor-pointer"
                        >
                            <span className="text-sm">📊</span>
                            <span>شاخص کالری و BMI</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveWidget('macros');
                                setIsOpenMenu(false);
                            }}
                            className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150 font-bold flex items-center gap-2 cursor-pointer"
                        >
                            <span className="text-sm">🥗</span>
                            <span>توزیع درشت‌مغذی‌ها</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveWidget('mizaj');
                                setIsOpenMenu(false);
                            }}
                            className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150 font-bold flex items-center gap-2 cursor-pointer"
                        >
                            <span className="text-sm">🌸</span>
                            <span>تعادل مزاج و توصیه پایه</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Popup Window */}
            {isProfileOpen && (
                <div 
                    className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center z-50 p-4 animate-in fade-in duration-200 ${
                        viewportMode === 'desktop' ? 'items-start pt-32' : viewportMode === 'tablet' ? 'items-start pt-24' : 'items-center'
                    }`}
                    onClick={() => {
                        if (!currentPhone) {
                            setIsProfileOpen(false);
                            setProfileError('');
                        } else {
                            if (isRequirementsMet()) {
                                setIsProfileOpen(false);
                                setProfileError('');
                            } else {
                                setProfileError('پر کردن سه فیلد الزامی (قد، وزن و سن) برای خروج یا ذخیره الزامی است.');
                            }
                        }
                    }}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl p-5 md:p-6 max-w-sm w-full relative border border-slate-200 animate-in zoom-in-95 duration-200 text-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!currentPhone ? (
                            /* Login view with phone entry */
                            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans pt-2" dir="rtl">
                                <div className="text-right border-b border-slate-100 pb-3 mb-2">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-start">
                                        <span>📱</span>
                                        <span>ورود به حساب کاربری رژیم هوشمند</span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">جهت شخصی‌سازی، ذخیره و مشاهده رژیم، شماره همراه خود را وارد کنید.</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <input
                                        type="text"
                                        maxLength={11}
                                        placeholder="شماره موبایل خود را وارد کنید"
                                        value={loginPhone}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const pDigits = '۰۱۲۳۴۵۶۷۸۹';
                                            const aDigits = '٠١٢٣٤٥٦٧٨٩';
                                            const normalizedVal = val
                                                .replace(/[۰-۹]/g, c => String(pDigits.indexOf(c)))
                                                .replace(/[٠-٩]/g, c => String(aDigits.indexOf(c)));
                                            const cleaned = normalizedVal.replace(/[^0-9]/g, '');
                                            setLoginPhone(cleaned);
                                            setLoginError('');
                                        }}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-center text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-slate-800 placeholder-slate-400 placeholder:font-sans placeholder:font-normal placeholder:opacity-50"
                                        dir="ltr"
                                    />
                                    {loginError && <p className="text-[10px] text-rose-500 font-bold mt-1 text-right">{loginError}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] rounded-xl shadow-xs transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-1.5"
                                >
                                    <span>🔑</span>
                                    <span>ورود به برنامه</span>
                                </button>
                            </form>
                        ) : (
                            /* User Profile Details form */
                            <form onSubmit={handleSaveProfile} className="space-y-3.5 font-sans" dir="rtl">
                                {profileError && (
                                    <div className="bg-rose-50 border border-rose-200/50 text-rose-600 text-[10px] font-bold p-2.5 rounded-xl text-center leading-relaxed animate-pulse">
                                        ⚠️ {profileError}
                                    </div>
                                )}
                                <div className="border-b border-rose-100/30 pb-2 mb-2 flex justify-between items-center">
                                    <h3 className="text-sm font-black text-rose-700 flex items-center gap-1.5">
                                        <span className="w-1.5 h-3.5 bg-rose-600 rounded-full"></span>
                                        پروفایل سلامت کاربری
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={handleLogout}
                                        className="text-[10px] font-extrabold text-red-550 border border-red-200 border-opacity-40 bg-red-50/50 px-2 py-0.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer"
                                    >
                                        خروج از حساب
                                    </button>
                                </div>

                                <div className="flex justify-between items-center bg-teal-50/40 p-2 rounded-xl text-[10px] font-bold border border-teal-100/40">
                                    <span className="text-slate-400">شناسه پرونده (تلفن):</span>
                                    <span className="text-slate-705 font-mono" dir="ltr">{currentPhone}</span>
                                </div>

                                {/* Avatar Upload Section */}
                                <div className="flex flex-col items-center justify-center py-2">
                                    <label className="relative cursor-pointer group">
                                        <input 
                                            type="file" 
                                            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const result = event.target?.result;
                                                        if (typeof result === 'string') {
                                                            updateProfileField('avatar', result);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div className="w-16 h-16 rounded-full border-2 border-rose-200/60 overflow-hidden bg-slate-100 flex items-center justify-center transition-all duration-200 hover:border-rose-400 shadow-sm relative">
                                            {profileForm.avatar ? (
                                                <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">👤</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] text-white font-bold">آپلود عکس</span>
                                             </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white text-[10px] select-none">
                                            📷
                                        </div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-right">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            value={profileForm.fullName || ''}
                                            onChange={(e) => updateProfileField('fullName', e.target.value)}
                                            placeholder="نام و نام خانوادگی"
                                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.age || ''}
                                            onChange={(e) => updateProfileField('age', e.target.value ? Number(e.target.value) : '')}
                                            className={`w-full px-2 py-2 border ${!profileForm.age ? 'border-rose-300 bg-rose-50/25' : 'border-slate-205'} rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705 transition-all`}
                                        >
                                            <option value="">سن (الزامی) *</option>
                                            {Array.from({ length: 89 }, (_, i) => 12 + i).map(val => (
                                                <option key={val} value={val} className="text-slate-800">{toPersianDigits(val)} سال</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.gender || ''}
                                            onChange={(e) => updateProfileField('gender', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-750"
                                        >
                                            <option value="">جنسیت</option>
                                            <option value="مرد" className="text-slate-800">مرد</option>
                                            <option value="زن" className="text-slate-800">زن</option>
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.height || ''}
                                            onChange={(e) => updateProfileField('height', e.target.value ? Number(e.target.value) : '')}
                                            className={`w-full px-2 py-2 border ${!profileForm.height ? 'border-rose-300 bg-rose-50/25' : 'border-slate-205'} rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705 transition-all`}
                                        >
                                            <option value="">قد (الزامی) *</option>
                                            {Array.from({ length: 101 }, (_, i) => 120 + i).map(val => (
                                                <option key={val} value={val} className="text-slate-800">{toPersianDigits(val)} سانتی‌متر</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.weight || ''}
                                            onChange={(e) => updateProfileField('weight', e.target.value ? Number(e.target.value) : '')}
                                            className={`w-full px-2 py-2 border ${!profileForm.weight ? 'border-rose-300 bg-rose-50/25' : 'border-slate-205'} rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-750 transition-all`}
                                        >
                                            <option value="">وزن (الزامی) *</option>
                                            {Array.from({ length: 151 }, (_, i) => 30 + i).map(val => (
                                                <option key={val} value={val} className="text-slate-800">{toPersianDigits(val)} کیلوگرم</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.activityLevel || ''}
                                            onChange={(e) => updateProfileField('activityLevel', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705"
                                        >
                                            <option value="">وضعیت فعالیت</option>
                                            <option value="کم" className="text-slate-800">کم (نشسته / اداری)</option>
                                            <option value="متوسط" className="text-slate-800">متوسط (نیمه فعال)</option>
                                            <option value="زیاد" className="text-slate-800">زیاد (فعالیت سنگین)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.goal || ''}
                                            onChange={(e) => updateProfileField('goal', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705"
                                        >
                                            <option value="">هدف اولیه</option>
                                            <option value="کاهش وزن" className="text-slate-800">کاهش وزن</option>
                                            <option value="حفظ وزن" className="text-slate-800">حفظ وزن</option>
                                            <option value="افزایش وزن" className="text-slate-800">افزایش وزن</option>
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.financialLevel || ''}
                                            onChange={(e) => updateProfileField('financialLevel', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705 font-sans"
                                        >
                                            <option value="">وضعیت اقتصادی</option>
                                            <option value="اقتصادی" className="text-slate-800">اقتصادی</option>
                                            <option value="متوسط" className="text-slate-800">متوسط</option>
                                            <option value="گران" className="text-slate-800">گران‌قیمت</option>
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.secondaryDiet || ''}
                                            onChange={(e) => updateProfileField('secondaryDiet', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705"
                                        >
                                            <option value="">نوع رژیم</option>
                                            {NEW_DIETS.map(diet => (
                                                <option key={diet} value={diet} className="text-slate-800">{diet}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <select
                                            value={profileForm.characteristic || ''}
                                            onChange={(e) => updateProfileField('characteristic', e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-400 focus:text-slate-705"
                                        >
                                            <option value="">بیماری شایع</option>
                                            {CHARACTERISTIC_OPTIONS.map(opt => (
                                                <option key={opt} value={opt} className="text-slate-800">{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Temperament Display Section (Name Reminder Only) */}
                                    <div className="col-span-2 flex justify-between items-center bg-amber-50/45 px-3 py-2 rounded-xl text-[11px] font-bold border border-amber-100/40">
                                        <span className="text-amber-800 font-extrabold flex items-center gap-1.5">
                                            <span>🧠</span>
                                            <span>مزاج شما:</span>
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${temperament ? 'bg-amber-100 text-amber-900 border border-amber-200/50' : 'bg-slate-100 text-slate-500 border border-slate-200/50'}`}>
                                            {temperament ? temperament : 'مزاج نامشخص'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-2.5 ${
                                        saveSuccess ? 'bg-teal-600' : 'bg-emerald-600 hover:bg-emerald-700'
                                    } text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1`}
                                >
                                    {saveSuccess ? '✓ تغییرات با موفقیت ذخیره شد' : 'ذخیره پرونده و اطلاعات فرعی'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Popup Modal with Backdrop (exits when clicked outside) */}
            {activeWidget && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveWidget(null)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl p-5 md:p-6 max-w-sm w-full relative border border-slate-200 animate-in zoom-in-95 duration-200 text-right"
                        onClick={(e) => e.stopPropagation()} // Stop propagation to not close when clicking inside the window
                    >
                        {/* Render Selected Quiz Metrics Widget */}
                        <div className="w-full bg-slate-50/55 rounded-2xl p-3 border border-slate-100/80 transition-all">
                            {activeWidget === 'bmi' && calorieRings}
                            {activeWidget === 'macros' && macroBar}
                            {activeWidget === 'mizaj' && mizajPanel}
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
};
