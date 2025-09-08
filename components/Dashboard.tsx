import React, { useState, useCallback, useEffect } from 'react';
import { useClassManager } from '../hooks/useClassManager';
import { useConfigManager } from '../hooks/useConfigManager';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';
import { ClassCard } from './ClassCard';
import { CreateClassModal } from './modals/CreateClassModal';
import { ConfigModal } from './modals/ConfigModal';
import { GuideModal } from './modals/GuideModal';
import { ImportPlatformModal } from './modals/ImportPlatformModal';
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
        className="w-full h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-teal-500 hover:text-teal-600 transition-all duration-200 aspect-[4/3] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
    >
        <i className="fas fa-plus text-4xl mb-3 transition-transform group-hover:scale-110"></i>
        <span className="font-semibold text-center">Créer une nouvelle classe</span>
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


export const Dashboard: React.FC<DashboardProps> = ({ onSelectClass }) => {
    const { classes, addClass, deleteClass, isLoading: isClassesLoading } = useClassManager();
    const { config, updateConfig, isLoading: isConfigLoading } = useConfigManager();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isConfigModalOpen, setConfigModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isGuideOpen, setGuideOpen] = useState(false);
    const [lastModifiedDates, setLastModifiedDates] = useState<Record<string, string | null>>({});

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
                        <h1 className="sm:hidden text-xl font-extrabold text-slate-800 font-slab">
                            Bienvenue M. {teacherName}
                        </h1>
                        {/* Desktop: concis */}
                        <h1 className="hidden sm:block text-2xl sm:text-3xl font-extrabold text-slate-800 font-slab">
                            Bienvenue M. {teacherName} — Espace pédagogique
                        </h1>
                    </>
                ) : (
                    <>
                        {/* Mobile: très court */}
                        <h1 className="sm:hidden text-xl font-bold text-slate-800 font-slab">Espace pédagogique</h1>
                        {/* Desktop */}
                        <h1 className="hidden sm:block text-3xl sm:text-4xl font-bold text-slate-800 font-slab">Votre Espace Pédagogique</h1>
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
        {classes.length === 0 ? (
                    <div className="text-center p-10 max-w-lg mx-auto bg-white rounded-lg shadow-md">
                        <i className="fas fa-school text-5xl text-slate-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-slate-600">Bienvenue !</h3>
                        <p className="text-slate-500 mt-2 mb-4">Vous n'avez pas encore de classe. Commencez par en créer une.</p>
                        <button 
                            onClick={() => setCreateModalOpen(true)}
                className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-teal-700 transition-colors w-full sm:w-auto"
                        >
                            Créer ma première classe
                        </button>
                    </div>
                ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {classes.map(classInfo => (
                            <ClassCard 
                                key={classInfo.id}
                                classInfo={classInfo}
                                lastModified={lastModifiedDates[classInfo.id]}
                                onSelect={() => onSelectClass(classInfo)}
                                onDelete={() => deleteClass(classInfo.id)}
                            />
                        ))}
                         <AddClassCard onClick={() => setCreateModalOpen(true)} />
                    </div>
                )}
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
        </div>
    );
};