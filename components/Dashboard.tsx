import React, { useState, useCallback, useEffect } from 'react';
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
    color: '#6d28d9' // Violet-700 (accessible)
    },
    {
        id: 'premium_2', 
        name: '2ème année collégiale',
    subject: 'Physique',
    color: '#0369a1' // Sky-700 (accessible)
    },
    {
        id: 'premium_3',
        name: '3ème année collégiale',
        subject: 'Mathématiques',
    color: '#b91c1c' // Red-700 (accessible)
    },
    
    {
        id: 'premium_5',
        name: '1ère Bac Sciences Économiques',
        subject: 'Économie',
    color: '#047857' // Emerald-700 (accessible)
    },
    {
        id: 'premium_6',
        name: '2ème Bac Sciences Physiques (PC)',
        subject: 'Physique',
    color: '#9d174d' // Pink-700 (accessible)
    },
    {
        id: 'premium_7',
        name: '2ème Bac Sciences Mathématiques \'A\'',
        subject: 'Mathématiques',
    color: '#115e59' // Teal-800 (accessible)
    },
    {
        id: 'premium_8',
        name: '2ème Bac SVT',
        subject: 'Sciences de la Vie',
    color: '#3f6212' // Lime-700 (accessible)
    }
    ,
    // Additional French (Lycée & Collège Marocain)
    {
        id: 'premium_9',
        name: '1ère Bac Sciences Mathématiques B',
        subject: 'Mathématiques',
    color: '#4c1d95' // Violet-900 (accessible)
    },
    {
        id: 'premium_10',
        name: '1ère Bac Sciences Expérimentales',
    subject: 'SVT',
    color: '#166534' // Green-800 (accessible)
    },
    {
        id: 'premium_11',
        name: 'Tronc Commun Littéraire',
    subject: 'Mathématiques',
    color: '#92400e' // Amber-800 (accessible)
    },
    {
        id: 'premium_12',
        name: '2ème Bac Lettres et Sciences Humaines',
        subject: 'Lettres',
    color: '#9d174d' // Pink-700 (accessible)
    },
    {
        id: 'premium_13',
        name: '2ème Bac Sciences Économiques et Gestion',
    subject: 'Économie',
    color: '#075985' // Sky-800 (accessible)
    },
    // Arabic entries (7 classes)
    {
        id: 'premium_14',
        name: 'الجذع المشترك العلمي',
    subject: 'الرياضيات',
    color: '#1d4ed8' // Blue-700 (accessible)
    },
    {
        id: 'premium_15',
        name: 'الجذع المشترك الأدبي',
    subject: 'الرياضيات',
    color: '#92400e' // Amber-800 (accessible)
    },
    {
        id: 'premium_16',
        name: 'الأولى باكالوريا علوم رياضية أ',
        subject: 'رياضيات',
    color: '#6d28d9' // Violet-700 (accessible)
    },
    {
        id: 'premium_17',
        name: 'الأولى باكالوريا علوم فيزيائية',
        subject: 'علوم فيزيائية',
    color: '#0369a1' // Sky-700 (accessible)
    },
    {
        id: 'premium_18',
        name: 'الثانية باكالوريا علوم رياضية أ',
        subject: 'رياضيات',
    color: '#4c1d95' // Violet-900 (accessible)
    },
    {
        id: 'premium_19',
        name: 'الثانية باكالوريا علوم الحياة والأرض',
        subject: 'علوم الحياة والأرض',
    color: '#166534' // Green-800 (accessible)
    },
    {
        id: 'premium_20',
        name: 'الثالثة إعدادي',
    subject: 'الرياضيات',
    color: '#b91c1c' // Red-700 (accessible)
    }
];


export const Dashboard: React.FC<DashboardProps> = ({ onSelectClass }) => {
    const { classes, addClass, deleteClass, isLoading: isClassesLoading } = useClassManager();
    const { config, updateConfig, isLoading: isConfigLoading } = useConfigManager();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isConfigModalOpen, setConfigModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isGuideOpen, setGuideOpen] = useState(false);
    const [isContactAdminModalOpen, setContactAdminModalOpen] = useState(false);
    const [lastModifiedDates, setLastModifiedDates] = useState<Record<string, string | null>>({});
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
        if (!isLoading && window.tippy) {
            window.tippy('[data-tippy-content]', {
                animation: 'shift-away',
                theme: 'custom',
            });
        }
    }, [isLoading]);

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

    const handleCreateClass = (details: { name: string; subject: string; }) => {
        addClass({
            ...details,
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
        <div className="p-4 sm:p-8 touch-manipulation" data-dashboard-root>
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
            <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                        {/* Create new class first */}
                        <AddClassCard onClick={() => setCreateModalOpen(true)} />
                        {classes.map(classInfo => (
                            <ClassCard 
                                key={classInfo.id}
                                classInfo={classInfo}
                                lastModified={lastModifiedDates[classInfo.id]}
                                onSelect={() => onSelectClass(classInfo)}
                                onDelete={() => deleteClass(classInfo.id)}
                            />
                        ))}
            {premiumClasses.filter(p => !dismissedPremiumIds.includes(p.id)).map(premiumClass => (
                            <LockedClassCard
                                key={premiumClass.id}
                                name={premiumClass.name}
                                subject={premiumClass.subject}
                                color={premiumClass.color}
                                onContactAdmin={() => setContactAdminModalOpen(true)}
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
                onClose={() => setContactAdminModalOpen(false)}
            />
        </div>
    );
};