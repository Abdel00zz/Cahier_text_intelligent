import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useClassManager } from '../hooks/useClassManager';
import { useConfigManager } from '../hooks/useConfigManager';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';
import { ClassCard } from './ClassCard';
import LockedClassCard from './LockedClassCard';
import { CreateClassModal } from './modals/CreateClassModal';
import { ConfigModal } from './modals/ConfigModal';
import { GuideModal } from './modals/GuideModal';
import { ImportPlatformModal } from './modals/ImportPlatformModal';
import ContactAdminModal from './modals/ContactAdminModal';
import { ClassInfo } from '../types';
type Cycle = 'college' | 'lycee' | 'prepa';
import { logger } from '../utils/logger';

interface DashboardProps {
    onSelectClass: (classInfo: ClassInfo) => void;
}

const AddClassCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    className="w-full h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-all duration-200 aspect-[5/3] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
    >
    <i className="fas fa-plus text-2xl mb-1 transition-transform group-hover:scale-110"></i>
    <span className="font-semibold text-center text-xs">Créer une nouvelle classe</span>
    </div>
);

const findLatestDate = (data: any): string | null => {
    let latestDate: string | null = null;

    const findDate = (obj: any) => {
        if (typeof obj !== 'object' || obj === null) return;

        if (obj.date && typeof obj.date === 'string') {
            if (!latestDate || obj.date > latestDate) {
                latestDate = obj.date;
            }
        }

        Object.values(obj).forEach(value => {
            if (Array.isArray(value)) {
                value.forEach(findDate);
            } else if (typeof value === 'object') {
                findDate(value);
            }
        });
    };

    if (Array.isArray(data)) {
        data.forEach(findDate);
    } else {
        findDate(data);
    }

    return latestDate;
};

// Premium locked classes data
const premiumClasses = [
    {
        id: 'premium_1',
        name: '1ère année collégiale',
        subject: 'Français',
        color: '#93c5fd', // Pastel blue
        cycle: 'college' as Cycle,
    },
    {
        id: 'premium_2',
        name: '2ème année collégiale',
        subject: 'Physique',
        color: '#fca5a5', // Pastel red
        cycle: 'college' as Cycle,
    },
    {
        id: 'premium_3',
        name: '3ème année collégiale',
        subject: 'Mathématiques',
        color: '#fdba74', // Pastel orange
        cycle: 'college' as Cycle,
    },
    
    {
        id: 'premium_5',
        name: '1ère Bac Sciences Économiques',
        subject: 'Économie',
        color: '#a5f3fc', // Pastel cyan
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_6',
        name: '2ème Bac Sciences Physiques (PC)',
        subject: 'Physique',
        color: '#c4b5fd', // Pastel violet
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_7',
        name: '2ème Bac Sciences Mathématiques \'A\'',
        subject: 'Mathématiques',
        color: '#bbf7d0', // Pastel green
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_8',
        name: '2ème Bac SVT',
        subject: 'Sciences de la Vie',
        color: '#fef08a', // Pastel yellow
        cycle: 'lycee' as Cycle,
    },
    // Additional French (Lycée & Collège Marocain)
    {
        id: 'premium_9',
        name: '1ère Bac Sciences Mathématiques B',
        subject: 'Mathématiques',
        color: '#fda4af', // Pastel pink
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_10',
        name: '1ère Bac Sciences Expérimentales',
        subject: 'SVT',
        color: '#b5e5f5', // Pastel light blue
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_11',
        name: 'Tronc Commun Littéraire',
        subject: 'Français',
        color: '#e0bbe0', // Pastel lavender
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_12',
        name: '2ème Bac Lettres et Sciences Humaines',
        subject: 'Lettres',
        color: '#e6e6fa', // Pastel light lavender
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_13',
        name: '2ème Bac Sciences Économiques et Gestion',
        subject: 'Économie',
        color: '#ffebc0', // Pastel cream
        cycle: 'lycee' as Cycle,
    },
    // Arabic entries (7 classes)
    {
        id: 'premium_14',
        name: 'الجذع المشترك العلمي',
        subject: 'الرياضيات',
        color: '#bae1ff', // Pastel light blue
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_15',
        name: 'الجذع المشترك الأدبي',
        subject: 'اللغة العربية',
        color: '#ffc4c4', // Pastel light red
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_16',
        name: 'الأولى باكالوريا علوم رياضية أ',
        subject: 'رياضيات',
        color: '#ffb3ba', // Pastel pink
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_17',
        name: 'الأولى باكالوريا علوم فيزيائية',
        subject: 'علوم فيزيائية',
        color: '#ffdfba', // Pastel peach
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_18',
        name: 'الثانية باكالوريا علوم رياضية أ',
        subject: 'رياضيات',
        color: '#ffffba', // Pastel yellow
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_19',
        name: 'الثانية باكالوريا علوم الحياة والأرض',
        subject: 'علوم الحياة والأرض',
        color: '#baffc9', // Pastel mint
        cycle: 'lycee' as Cycle,
    },
    {
        id: 'premium_20',
        name: 'الثالثة إعدادي',
        subject: 'الرياضيات',
        color: '#ffb7ce', // Pastel pink
        cycle: 'college' as Cycle,
    },
];

// Extra premium classes requested (collège scientific subjects, lycée Tronc commun FR, and prépa MPSI/PCSI/TSI)
premiumClasses.push(
    // Collège: other scientific subjects
    {
        id: 'premium_22',
        name: '1ère année collégiale',
        subject: 'SVT',
        color: '#166534', // Green-800
        cycle: 'college' as Cycle,
    },
    {
        id: 'premium_23',
        name: '2ème année collégiale',
        subject: 'Physique-Chimie',
        color: '#1e40af', // Blue-800
        cycle: 'college' as Cycle,
    },
    {
        id: 'premium_24',
        name: '3ème année collégiale',
        subject: 'Informatique',
        color: '#0b7285', // Cyan-800-ish
        cycle: 'college' as Cycle,
    },
    // Prépa scientifique
    {
        id: 'premium_25',
        name: 'MPSI',
        subject: 'Mathématiques',
        color: '#7c2d12', // Orange-900
        cycle: 'prepa' as Cycle,
    },
    {
        id: 'premium_26',
        name: 'PCSI',
        subject: 'Physique',
        color: '#14532d', // Emerald-900
        cycle: 'prepa' as Cycle,
    },
    {
        id: 'premium_27',
        name: 'TSI',
        subject: "Sciences de l'Ingénieur",
        color: '#1f2937', // Gray-800
        cycle: 'prepa' as Cycle,
    }
);


export const Dashboard: React.FC<DashboardProps> = ({ onSelectClass }) => {
    const { classes, addClass, deleteClass, isLoading: isClassesLoading } = useClassManager();
    const { config, updateConfig, isLoading: isConfigLoading } = useConfigManager();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isConfigModalOpen, setConfigModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isGuideOpen, setGuideOpen] = useState(false);
    const [isContactAdminModalOpen, setContactAdminModalOpen] = useState(false);
    const [selectedPremiumInfo, setSelectedPremiumInfo] = useState<{ name: string; subject: string } | null>(null);
    const [lastModifiedDates, setLastModifiedDates] = useState<Record<string, string | null>>({});
    const [selectedCycle, setSelectedCycle] = useState<Cycle>(() => {
        try {
            return (localStorage.getItem('selected_cycle_v1') as Cycle) || 'college';
        } catch { return 'college'; }
    });
    const [hadStoredCycle] = useState<boolean>(() => {
        try { return localStorage.getItem('selected_cycle_v1') !== null; } catch { return false; }
    });
    const didInitCycleRef = useRef(false);
    const [dismissedPremiumIds, setDismissedPremiumIds] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem('dismissed_premium_cards_v1');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const isLoading = isClassesLoading || isConfigLoading;

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isLoading && window.tippy && !isTouch) {
            window.tippy('[data-tippy-content]', {
                animation: 'shift-away',
                theme: 'custom',
            });
        }
    }, [isLoading]);

    useEffect(() => {
        const id = setTimeout(() => {
            try {
                const prev = localStorage.getItem('selected_cycle_v1');
                if (prev !== selectedCycle) {
                    localStorage.setItem('selected_cycle_v1', selectedCycle);
                }
            } catch {}
        }, 50);
        return () => clearTimeout(id);
    }, [selectedCycle]);

    useEffect(() => {
        if (isClassesLoading) return;

        const dates: Record<string, string | null> = {};
        classes.forEach(classInfo => {
            try {
                const lessonsDataRaw = localStorage.getItem(`classData_v1_${classInfo.id}`);
                if (lessonsDataRaw) {
                    const lessonsData = JSON.parse(lessonsDataRaw);
                    dates[classInfo.id] = findLatestDate(lessonsData);
                } else {
                    dates[classInfo.id] = null;
                }
            } catch (e) {
                logger.error(`Failed to parse data for class ${classInfo.id}`, e);
                dates[classInfo.id] = null;
            }
        });
        setLastModifiedDates(dates);
    }, [classes, isClassesLoading]);

    // On first load without a saved selection, set cycle once to the first available class's cycle
    useEffect(() => {
        if (isClassesLoading) return;
        if (didInitCycleRef.current) return;
        if (!hadStoredCycle && classes.length > 0) {
            const firstCycle = (classes[0].cycle || 'college') as Cycle;
            setSelectedCycle(firstCycle);
        }
        didInitCycleRef.current = true;
    }, [classes, isClassesLoading, hadStoredCycle]);

    const handleCreateClass = (details: { name: string; subject: string; }) => {
        addClass({
            ...details,
            cycle: selectedCycle,
            teacherName: config.defaultTeacherName || 'Enseignant',
        });
        setCreateModalOpen(false);
    };

    const handleExportPlatform = useCallback(() => {
        try {
            const allData = {
                config,
                classes: classes.map(classInfo => {
                    const lessonsData = JSON.parse(localStorage.getItem(`classData_v1_${classInfo.id}`) || '[]');
                    return { classInfo, lessonsData };
                })
            };
            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cahier-de-textes-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            logger.error("Export failed", error);
            alert("L'exportation a échoué.");
        }
    }, [classes, config]);

    const handleImportPlatform = useCallback((fileContent: string) => {
        try {
            const data = JSON.parse(fileContent);

            if (!data.config || !Array.isArray(data.classes)) {
                throw new Error("Fichier de sauvegarde invalide ou corrompu.");
            }
            
            // 1. Restore config
            localStorage.setItem('appConfig_v1', JSON.stringify(data.config));

            // 2. Restore class list
            const allClassInfo = data.classes.map((c: any) => c.classInfo);
            localStorage.setItem('classManager_v1', JSON.stringify(allClassInfo));

            // 3. Restore data for each class
            data.classes.forEach((c: any) => {
                if (c.classInfo && c.classInfo.id && c.lessonsData) {
                    localStorage.setItem(`classData_v1_${c.classInfo.id}`, JSON.stringify(c.lessonsData));
                }
            });

            alert("Importation réussie ! L'application va maintenant se recharger.");
            window.location.reload();

        } catch (error) {
            logger.error("Import failed", error);
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`L'importation a échoué: ${message}`);
        }
        setImportModalOpen(false);
    }, []);

    const handleDismissPremium = useCallback((id: string) => {
        setDismissedPremiumIds(prev => {
            const next = Array.from(new Set([...prev, id]));
            localStorage.setItem('dismissed_premium_cards_v1', JSON.stringify(next));
            return next;
        });
    }, []);

    const needsConfiguration = !config.establishmentName || !config.defaultTeacherName;

    if (isLoading) {
        return <Spinner fullPage text="Chargement des classes..." />;
    }

    const teacherName = (config.defaultTeacherName || '').trim();

    return (
    <div className="p-2 sm:p-8 touch-manipulation pb-8 safe-bottom" data-dashboard-root>
            <header className="relative text-center mb-8 sm:mb-12">
                {teacherName ? (
                    <>
                        {/* Mobile: court */}
                        <h1 className="sm:hidden text-2xl font-extrabold text-slate-800 font-slab">
                            Bienvenue M. {teacherName}
                        </h1>
                        <p className="sm:hidden mt-1 text-slate-600 text-sm font-medium">
                            Inspirez, simplifiez, progressez — visons +110% d’impact aujourd’hui.
                        </p>
                        {/* Desktop: concis */}
                        <h1 className="hidden sm:block text-3xl sm:text-4xl font-extrabold text-slate-800 font-slab">
                            Bienvenue M. {teacherName} — Espace pédagogique
                        </h1>
                        <p className="hidden sm:block mt-2 text-slate-600 text-base font-medium">
                            Objectif du jour: inspirer vos élèves et gagner en efficacité — +110% d’impact.
                        </p>
                    </>
                ) : (
                    <>
                        {/* Mobile: très court */}
                        <h1 className="sm:hidden text-2xl font-extrabold text-slate-800 font-slab">Espace pédagogique</h1>
                        <p className="sm:hidden mt-1 text-slate-600 text-sm font-medium">
                            Inspirez vos élèves, simplifiez vos cours, visez +110%.
                        </p>
                        {/* Desktop */}
                        <h1 className="hidden sm:block text-3xl sm:text-4xl font-extrabold text-slate-800 font-slab">Votre Espace Pédagogique</h1>
                        <p className="hidden sm:block mt-2 text-slate-600 text-base font-medium">
                            Enseignez avec clarté et impact — allons au-delà de 110% aujourd’hui.
                        </p>
                    </>
                )}
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <Button
                        variant="icon"
                        size="lg"
                        onClick={() => setGuideOpen(true)}
                        data-tippy-content="Aide"
                        aria-label="Ouvrir l'aide"
                    >
                        <i className="fas fa-question-circle text-2xl"></i>
                    </Button>
                    <Button
                        variant="icon"
                        size="lg"
                        onClick={() => setConfigModalOpen(true)}
                        data-tippy-content="Configuration"
                        aria-label="Ouvrir la configuration"
                        className={needsConfiguration ? 'animate-pulse-glow' : ''}
                    >
                        <i className="fas fa-cog text-2xl"></i>
                    </Button>
                </div>
            </header>
            <main>
            {/* Cycle selector (centered) */}
            <div className="w-full flex justify-center mb-3 sm:mb-4">
                <div className="inline-flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-2 -mx-2">
                {([
                    { key: 'college', label: 'Collège' },
                    { key: 'lycee', label: 'Lycée' },
                    { key: 'prepa', label: 'Classe préparatoire' },
                ] as {key: Cycle; label: string;}[]).map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => !isClassesLoading && setSelectedCycle(opt.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCycle === opt.key ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'}`}
                        aria-pressed={selectedCycle === opt.key}
                        aria-disabled={isClassesLoading}
                        disabled={isClassesLoading}
                    >
                        {opt.label}
                    </button>
                ))}
                </div>
            </div>
            <div className="mt-6 sm:mt-16 px-2 sm:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
                        {/* Create new class first */}
                        <AddClassCard onClick={() => setCreateModalOpen(true)} />
                        {/* Sort classes: demo "Tronc commun scientifique" first, then other user classes */}
                        {classes
                            .filter(c => (c.cycle || 'college') === selectedCycle)
                            .sort((a, b) => {
                                // Prioritize demo classes per cycle: 'Tronc commun scientifique' for lycée, '3ème année collégiale' for collège
                                const isDemoA = (selectedCycle === 'lycee' && a.name.toLowerCase().includes('tronc commun scientifique'))
                                    || (selectedCycle === 'college' && a.name.toLowerCase().includes('3ème année collégiale'));
                                const isDemoB = (selectedCycle === 'lycee' && b.name.toLowerCase().includes('tronc commun scientifique'))
                                    || (selectedCycle === 'college' && b.name.toLowerCase().includes('3ème année collégiale'));
                                if (isDemoA && !isDemoB) return -1;
                                if (!isDemoA && isDemoB) return 1;
                                // Then sort by creation date (newest first)
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            })
                            .map(classInfo => (
                            <ClassCard 
                                key={classInfo.id}
                                classInfo={classInfo}
                                lastModified={lastModifiedDates[classInfo.id]}
                                onSelect={() => onSelectClass(classInfo)}
                                onDelete={() => deleteClass(classInfo.id)}
                            />
                        ))}
            {premiumClasses
                .filter(p => p.cycle === selectedCycle)
                .filter(p => !dismissedPremiumIds.includes(p.id))
                .filter(p => !classes.some(c => (c.cycle || 'college') === selectedCycle && c.name === p.name && c.subject === p.subject))
                .map(premiumClass => (
                            <LockedClassCard
                                key={premiumClass.id}
                                name={premiumClass.name}
                                subject={premiumClass.subject}
                                color={premiumClass.color}
                                onContactAdmin={() => { setSelectedPremiumInfo({ name: premiumClass.name, subject: premiumClass.subject }); setContactAdminModalOpen(true); }}
                onDelete={() => handleDismissPremium(premiumClass.id)}
                            />
                        ))}
                    </div>
            </main>
            <CreateClassModal 
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateClass}
                defaultTeacherName={config.defaultTeacherName}
            />
            <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setConfigModalOpen(false)}
                config={config}
                onConfigChange={updateConfig}
                onExportPlatform={handleExportPlatform}
                onOpenImport={() => setImportModalOpen(true)}
            />
            <GuideModal isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
            <ImportPlatformModal
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={handleImportPlatform}
            />
            <ContactAdminModal
                isOpen={isContactAdminModalOpen}
                onClose={() => { setContactAdminModalOpen(false); setSelectedPremiumInfo(null); }}
                selectedPremium={selectedPremiumInfo}
            />
        </div>
    );
};