import React, { useState, useMemo, useEffect } from 'react';
import { analyzeHealthSymptoms, getRelatedHealthItems } from '../services/geminiService';
import { ALL_SYMPTOMS_AND_DISEASES, ALL_DRUGS } from '../constants';
import { toPersianDigits } from '../utils/calculations';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

interface CombinedHealthQuizProps {
    onClose: (quizStarted: boolean) => void;
    onSubmit: (conditions: string[], drugs: string[], analysis: { diseaseName: string, score: number }[] | null) => void;
    initialConditions: string[];
    initialDrugs: string[];
    startInQuizMode?: boolean;
}

const CombinedHealthQuiz: React.FC<CombinedHealthQuizProps> = ({ onClose, onSubmit, initialConditions, initialDrugs, startInQuizMode = false }) => {
    const [step, setStep] = useState<'initial' | 'quiz'>(startInQuizMode ? 'quiz' : 'initial');
    const [quizStarted, setQuizStarted] = useState(startInQuizMode);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(initialConditions));
    const [selectedDrugs, setSelectedDrugs] = useState<Set<string>>(new Set(initialDrugs));
    const [analysis, setAnalysis] = useState<{ diseaseName: string, score: number }[] | null>(null);
    const [_isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isRanking, setIsRanking] = useState(false);

    const [rankedSymptoms, setRankedSymptoms] = useState<string[]>([...ALL_SYMPTOMS_AND_DISEASES]);
    const [rankedDrugs, setRankedDrugs] = useState<string[]>([...ALL_DRUGS]);

    const debouncedSelectedItemsForAnalysis = useDebounce(selectedItems, 1000);
    const debouncedSelectedDrugsForAnalysis = useDebounce(selectedDrugs, 1000);
    const debouncedSelectedItemsForRanking = useDebounce(selectedItems, 400);
    const debouncedSelectedDrugsForRanking = useDebounce(selectedDrugs, 400);

    useEffect(() => {
        const runAnalysis = async () => {
            if (debouncedSelectedItemsForAnalysis.size === 0 && debouncedSelectedDrugsForAnalysis.size === 0) {
                setAnalysis(null);
                return;
            }
            setIsLoadingAnalysis(true);
            try {
                const result = await analyzeHealthSymptoms(Array.from(debouncedSelectedItemsForAnalysis), Array.from(debouncedSelectedDrugsForAnalysis));
                setAnalysis(result);
            } catch (error) {
                console.error("Analysis failed:", error);
                setAnalysis([]);
            } finally {
                setIsLoadingAnalysis(false);
            }
        };
        runAnalysis();
    }, [debouncedSelectedItemsForAnalysis, debouncedSelectedDrugsForAnalysis]);
    
    useEffect(() => {
        const runRanking = async () => {
            if (debouncedSelectedItemsForRanking.size === 0 && debouncedSelectedDrugsForRanking.size === 0) {
                setRankedSymptoms([...ALL_SYMPTOMS_AND_DISEASES].sort((a,b) => a.localeCompare(b, 'fa')));
                setRankedDrugs([...ALL_DRUGS].sort((a,b) => a.localeCompare(b, 'fa')));
                return;
            }
            setIsRanking(true);
            try {
                const result = await getRelatedHealthItems(
                    Array.from(debouncedSelectedItemsForRanking),
                    Array.from(debouncedSelectedDrugsForRanking),
                    ALL_SYMPTOMS_AND_DISEASES,
                    ALL_DRUGS
                );
                setRankedSymptoms(result.rankedSymptoms);
                setRankedDrugs(result.rankedDrugs);
            } catch (error) {
                console.error("Ranking failed:", error);
                setRankedSymptoms([...ALL_SYMPTOMS_AND_DISEASES].sort((a,b) => a.localeCompare(b, 'fa')));
                setRankedDrugs([...ALL_DRUGS].sort((a,b) => a.localeCompare(b, 'fa')));
            } finally {
                setIsRanking(false);
            }
        };
        runRanking();
    }, [debouncedSelectedItemsForRanking, debouncedSelectedDrugsForRanking]);

    const handleItemToggle = (item: string, type: 'item' | 'drug') => {
        const updater = type === 'item' ? setSelectedItems : setSelectedDrugs;
        updater(prev => {
            const newSet = new Set(prev);
            newSet.has(item) ? newSet.delete(item) : newSet.add(item);
            return newSet;
        });
    };

    const clearAll = () => {
        setSelectedItems(new Set());
        setSelectedDrugs(new Set());
        setSearchQuery('');
    };
    
    const filteredSymptomsAndDiseases = useMemo(() => {
        const searchFiltered = rankedSymptoms.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
        const selected = searchFiltered.filter(item => selectedItems.has(item));
        const unselected = searchFiltered.filter(item => !selectedItems.has(item));
        return [...selected, ...unselected];
    }, [searchQuery, rankedSymptoms, selectedItems]);

    const filteredDrugs = useMemo(() => {
        const searchFiltered = rankedDrugs.filter(drug => drug.toLowerCase().includes(searchQuery.toLowerCase()));
        const selected = searchFiltered.filter(drug => selectedDrugs.has(drug));
        const unselected = searchFiltered.filter(drug => !selectedDrugs.has(drug));
        return [...selected, ...unselected];
    }, [searchQuery, rankedDrugs, selectedDrugs]);

    const handleSubmit = () => {
        onSubmit(Array.from(selectedItems), Array.from(selectedDrugs), analysis);
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    if (step === 'initial') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6 relative">
                <button onClick={() => onClose(quizStarted)} className="absolute top-4 right-4 p-1 rounded-full text-slate-600 hover:bg-black/10 z-20" aria-label="بستن">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className={`w-full max-w-md ${isMobile ? 'bg-transparent border-none shadow-none p-2' : 'bg-white p-8 rounded-2xl shadow-lg'} text-center`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">
                        آیا بیماری، علائم خاص، یا داروی مشخصی مصرف می‌کنید؟
                    </h3>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setStep('quiz'); setQuizStarted(true); }} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">بله دارم</button>
                        <button onClick={() => onSubmit([], [], null)} className="px-8 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer">خیر ندارم</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col ${isMobile ? 'bg-transparent' : 'bg-white'} overflow-hidden p-4`}>
            <div className="p-2 border-b border-slate-200 flex-shrink-0 flex items-center gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="جستجوی علائم، بیماری یا دارو..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 text-slate-800 border border-slate-300 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-500"
                    />
                    {isRanking && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>
                <button onClick={() => onClose(quizStarted)} className="p-1 rounded-full text-slate-600 hover:bg-black/10 z-20 flex-shrink-0" aria-label="بستن">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-grow grid grid-cols-2 gap-4 p-2 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                {/* Symptoms/Diseases Column */}
                <div className="flex flex-wrap content-start gap-2 justify-end">
                    {filteredSymptomsAndDiseases.map(item => (
                        <button
                            key={item}
                            onClick={() => handleItemToggle(item, 'item')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                selectedItems.has(item)
                                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                {/* Drugs Column */}
                <div className="flex flex-wrap content-start gap-2 justify-start">
                     {filteredDrugs.map(drug => (
                        <button
                            key={drug}
                            onClick={() => handleItemToggle(drug, 'drug')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                                selectedDrugs.has(drug)
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                            }`}
                        >
                            {drug}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="p-4 flex items-center justify-center gap-3 border-t border-slate-200 flex-shrink-0">
                <button onClick={() => onClose(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 shadow-sm">رد کردن</button>
                <button onClick={clearAll} className="px-5 py-2.5 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 shadow-sm">پاک کردن همه</button>
                <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-slate-400"
                        disabled={selectedItems.size === 0 && selectedDrugs.size === 0}>
                    تایید و ادامه
                </button>
            </div>
        </div>
    );
};

export default CombinedHealthQuiz;