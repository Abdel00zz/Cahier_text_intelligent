import { useCallback, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { ClassInfo } from '../types';
import { logger } from '../utils/logger';
import { manifestService, ManifestClass } from '../services/ManifestService';

const STORAGE_KEY = 'classManager_v1';
const CLASS_DATA_PREFIX = 'classData_v1_';
const FIRST_LAUNCH_KEY = 'app_first_launch_v1';

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

                if (storedClasses) {
                    // Load existing classes, then ensure demo classes are present
                    const existing: ClassInfo[] = JSON.parse(storedClasses);
                    let current = [...existing];
                    setClasses(existing);

                    // Load and ensure demo classes from manifest
                    await ensureDemoClassesFromManifest(current);
                } else if (isFirstLaunch) {
                    // Load default classes on first launch from manifest
                    await loadDefaultClassesFromManifest();
                    localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
                }
            } catch (error) {
                logger.error('Failed to load classes from localStorage', error);
            } finally {
                setIsLoading(false);
            }
        };

        const ensureDemoClassesFromManifest = async (currentClasses: ClassInfo[]) => {
            try {
                // Load demo classes for all cycles
                const cycles: ('college' | 'lycee' | 'prepa')[] = ['college', 'lycee', 'prepa'];
                let updatedClasses = [...currentClasses];
                
                for (const cycle of cycles) {
                    const demoClasses = await manifestService.getDemoClasses(cycle);
                    
                    for (const manifestClass of demoClasses) {
                        const exists = updatedClasses.some(c => 
                            c.name === manifestClass.name && 
                            c.subject === manifestClass.subject &&
                            c.cycle === manifestClass.cycle
                        );
                        
                        if (!exists) {
                            await createClassFromManifest(manifestClass, true, updatedClasses);
                        }
                    }
                }
                
                if (updatedClasses.length !== currentClasses.length) {
                    setClasses(updatedClasses);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClasses));
                }
            } catch (error) {
                logger.error('Failed to ensure demo classes from manifest', error);
            }
        };

        const loadDefaultClassesFromManifest = async () => {
            try {
                const defaultClasses: ClassInfo[] = [];
                
                // Load demo classes for college and lycee by default
                const collegeDemos = await manifestService.getDemoClasses('college');
                const lyceeDemos = await manifestService.getDemoClasses('lycee');
                
                for (const manifestClass of [...collegeDemos, ...lyceeDemos]) {
                    await createClassFromManifest(manifestClass, true, defaultClasses);
                }
                
                setClasses(defaultClasses);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses));
                logger.info('Default classes loaded from manifest');
            } catch (error) {
                logger.error('Failed to load default classes from manifest', error);
                // Fallback to empty array
                setClasses([]);
                localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            }
        };

        const createClassFromManifest = async (manifestClass: ManifestClass, isDemo: boolean, targetArray: ClassInfo[]) => {
            try {
                const classInfo = manifestService.manifestClassToClassInfo(manifestClass);
                const classData = await manifestService.loadClassData(manifestClass, isDemo);
                
                targetArray.push(classInfo);
                localStorage.setItem(`${CLASS_DATA_PREFIX}${classInfo.id}`, JSON.stringify(classData.lessonsData || []));
                
                logger.info(`Class created from manifest: ${manifestClass.name}`);
            } catch (error) {
                logger.error(`Failed to create class from manifest: ${manifestClass.name}`, error);
            }
        };

        loadClasses();
    }, [setClasses]);

    const saveClasses = useCallback((updatedClasses: ClassInfo[] | ((draft: ClassInfo[]) => void)) => {
        try {
            // use-immer's updater function can be a new array or a function
            if (typeof updatedClasses === 'function') {
                // If it's a function, we need to get the current state to save it
                setClasses(draft => {
                    updatedClasses(draft);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
                });
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClasses));
                setClasses(updatedClasses);
            }
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

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${classToDelete.name}" ? Cette action est irréversible.`)) {
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