import { useState, useEffect, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { ClassInfo } from '../types';
import { manifestService, ManifestClass } from '../services/ManifestService';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'classManager_v1';
const CLASS_DATA_PREFIX = 'classData_v1_';
const FIRST_LAUNCH_KEY = 'app_first_launch_v1';

// Fonction utilitaire pour obtenir la configuration utilisateur
const getUserConfig = () => {
    try {
        const configRaw = localStorage.getItem('appConfig_v1');
        return configRaw ? JSON.parse(configRaw) : {};
    } catch {
        return {};
    }
};

const generateColor = () => {
    // Soft, cool palette: cold blues, teals, soft greens, gentle oranges
    const colors = [
        '#93c5fd', // blue-300
        '#bfdbfe', // blue-200
        '#7dd3fc', // sky-300
        '#a5f3fc', // cyan-200
        '#99f6e4', // teal-200
        '#86efac', // green-300
        '#fde68a', // amber-300
        '#fbbf24', // amber-400 (gentle orange)
        '#fca5a5', // red-300 (soft)
        '#c4b5fd', // violet-300
        '#a78bfa', // violet-400 (soft)
        '#f9a8d4'  // pink-300 (soft)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const useClassManager = () => {
    const [classes, setClasses] = useImmer<ClassInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const storedClasses = localStorage.getItem(STORAGE_KEY);
                const isFirstLaunch = !localStorage.getItem(FIRST_LAUNCH_KEY);
                const userConfig = getUserConfig();

                let classesToLoad: ClassInfo[] = [];
                let updateStorage = false;

                if (storedClasses) {
                    classesToLoad = JSON.parse(storedClasses);
                }

                if (isFirstLaunch) {
                    const defaultClasses = await loadDefaultClassesFromManifest(userConfig);
                    classesToLoad = defaultClasses;
                    updateStorage = true;
                    localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
                } else {
                    // Always ensure demo classes are present
                    const { updatedClasses, needsUpdate } = await ensureDemoClassesFromManifest(classesToLoad, userConfig);
                    if (needsUpdate) {
                        classesToLoad = updatedClasses;
                        updateStorage = true;
                    }
                }
                
                setClasses(classesToLoad);
                if (updateStorage) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(classesToLoad));
                }

            } catch (error) {
                logger.error('Failed to load classes', error);
                setClasses([]); // Fallback to an empty array on error
            } finally {
                setIsLoading(false);
            }
        };

        const ensureDemoClassesFromManifest = async (currentClasses: ClassInfo[], userConfig: any) => {
            let updatedClasses = [...currentClasses];
            let needsUpdate = false;
            const cycles: ('college' | 'lycee' | 'prepa')[] = ['college', 'lycee', 'prepa'];

            for (const cycle of cycles) {
                const demoClasses = await manifestService.getDemoClasses(cycle);
                for (const manifestClass of demoClasses) {
                    const exists = updatedClasses.some(c => 
                        c.name.toLowerCase().trim() === manifestClass.name.toLowerCase().trim() && 
                        (c.cycle || 'college') === manifestClass.cycle
                    );
                    
                    if (!exists) {
                        await createClassFromManifest(manifestClass, true, updatedClasses, userConfig.defaultTeacherName);
                        needsUpdate = true;
                    }
                }
            }
            return { updatedClasses, needsUpdate };
        };

        const loadDefaultClassesFromManifest = async (userConfig: any) => {
            const defaultClasses: ClassInfo[] = [];
            const cycles: ('college' | 'lycee' | 'prepa')[] = ['college', 'lycee', 'prepa'];

            for (const cycle of cycles) {
                const demoClasses = await manifestService.getDemoClasses(cycle);
                for (const manifestClass of demoClasses) {
                    await createClassFromManifest(manifestClass, true, defaultClasses, userConfig.defaultTeacherName);
                }
            }
            
            logger.info('Default classes loaded from manifest for all cycles');
            return defaultClasses;
        };

        const createClassFromManifest = async (
            manifestClass: ManifestClass, 
            isDemo: boolean, 
            targetArray: ClassInfo[],
            userTeacherName?: string
        ) => {
            try {
                // Utiliser le nom de l'utilisateur configuré en priorité
                const classInfo = manifestService.manifestClassToClassInfo(manifestClass, userTeacherName);
                const loadedData = await manifestService.loadClassData(manifestClass, isDemo);
                const lessons = loadedData.lessonsData || [];

                targetArray.push(classInfo);
                localStorage.setItem(`${CLASS_DATA_PREFIX}${classInfo.id}`, JSON.stringify(lessons));
                
                logger.info(`Class created from manifest: ${manifestClass.name} with teacher: ${classInfo.teacherName}`);
            } catch (error) {
                logger.error(`Failed to create class from manifest: ${manifestClass.name}`, error);
            }
        };

        loadClasses();
    }, [setClasses]);

    const saveClasses = useCallback((updater: (draft: ClassInfo[]) => void) => {
        try {
            setClasses(draft => {
                updater(draft);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
            });
        } catch (error) {
            logger.error("Failed to save classes to localStorage", error);
        }
    }, [setClasses]);

    const addClass = useCallback((classDetails: Omit<ClassInfo, 'id' | 'createdAt' | 'color'>) => {
        const newClass: ClassInfo = {
            ...classDetails,
            cycle: classDetails.cycle ?? 'college',
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            color: generateColor(),
        };
        
        saveClasses(draft => {
            draft.push(newClass);
        });

        localStorage.setItem(`${CLASS_DATA_PREFIX}${newClass.id}`, JSON.stringify([]));
        return newClass;
    }, [saveClasses]);

    const deleteClass = useCallback((classId: string) => {
        const classToDelete = classes.find(c => c.id === classId);
        if (!classToDelete) return;

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe \"${classToDelete.name}\" ? Cette action est irréversible.`)) {
            saveClasses(draft => {
                const index = draft.findIndex(c => c.id === classId);
                if (index !== -1) {
                    draft.splice(index, 1);
                }
            });
            localStorage.removeItem(`${CLASS_DATA_PREFIX}${classId}`);
        }
    }, [classes, saveClasses]);
    
    const updateClass = useCallback((classId: string, updatedInfo: Partial<Omit<ClassInfo, 'id'>>) => {
        saveClasses(draft => {
            const classToUpdate = draft.find(c => c.id === classId);
            if (classToUpdate) {
                Object.assign(classToUpdate, updatedInfo);
            }
        });
    }, [saveClasses]);

    return { classes, addClass, deleteClass, updateClass, isLoading };
};